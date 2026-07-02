import './load-env';
import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import passport from 'passport';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { cors: false });

  const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:5173';
  app.enableCors({ origin: webOrigin, credentials: true });

  // Session store: use Postgres if DATABASE_URL is set, else memory (dev fallback)
  const PgStore = connectPg(session);
  const store = process.env.DATABASE_URL
    ? new PgStore({ conString: process.env.DATABASE_URL, tableName: 'user_sessions', createTableIfMissing: true })
    : undefined;

  app.use(
    session({
      store,
      secret: process.env.SESSION_SECRET ?? 'dev-secret-change-me',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    }),
  );

  // Passport (used by Google OAuth strategy when credentials are configured).
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj: Express.User, done) => done(null, obj));
  app.use(passport.initialize());
  app.use(passport.session());

  app.setGlobalPrefix('api/v1', { exclude: ['healthz'] });
  app.useGlobalFilters(new AllExceptionsFilter());
  void app.get(Reflector); // ensure Reflector is available for guards

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`[api] listening on http://localhost:${port}`);
}

void bootstrap();
