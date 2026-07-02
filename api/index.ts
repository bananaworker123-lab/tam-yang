/**
 * Vercel serverless entry — imports NestJS from pre-compiled dist/
 * so Vercel's bundler never sees TypeScript decorators.
 */
import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import passport from 'passport';
import type { IncomingMessage, ServerResponse } from 'http';

// Import from pre-compiled JS output (nest build produces apps/api/dist/)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { AppModule } = require('../apps/api/dist/app.module');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { AllExceptionsFilter } = require('../apps/api/dist/common/all-exceptions.filter');

const expressApp = express();
let nestReady = false;

async function bootstrap(): Promise<void> {
  if (nestReady) return;

  const adapter = new ExpressAdapter(expressApp);
  const nestApp = await NestFactory.create(AppModule, adapter, { cors: false });

  const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:5173';
  nestApp.enableCors({ origin: webOrigin, credentials: true });

  const PgStore = connectPg(session);
  const store = process.env.DATABASE_URL
    ? new PgStore({
        conString: process.env.DATABASE_URL,
        tableName: 'user_sessions',
        createTableIfMissing: true,
      })
    : undefined;

  nestApp.use(
    session({
      store,
      secret: process.env.SESSION_SECRET ?? 'dev-secret-change-me',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    }),
  );

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj: Express.User, done) => done(null, obj));
  nestApp.use(passport.initialize());
  nestApp.use(passport.session());

  nestApp.setGlobalPrefix('api/v1', { exclude: ['healthz'] });
  nestApp.useGlobalFilters(new AllExceptionsFilter());
  nestApp.get(Reflector);

  await nestApp.init();
  nestReady = true;
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  await bootstrap();
  expressApp(req as any, res as any);
}
