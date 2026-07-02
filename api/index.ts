/**
 * Vercel serverless entry — imports NestJS from pre-compiled dist/
 * so Vercel's bundler never sees TypeScript decorators.
 *
 * Uses cookie-session (session stored in a signed cookie) instead of
 * connect-pg-simple so there is NO database round-trip on every request.
 */
import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import cookieSession from 'cookie-session';
import passport from 'passport';
import type { IncomingMessage, ServerResponse } from 'http';

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

  // Cookie-session: session data lives in the cookie itself — zero DB round-trips.
  // The cookie is signed with SESSION_SECRET so it can't be tampered with.
  nestApp.use(
    cookieSession({
      name: 'sess',
      keys: [process.env.SESSION_SECRET ?? 'dev-secret-change-me'],
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
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
