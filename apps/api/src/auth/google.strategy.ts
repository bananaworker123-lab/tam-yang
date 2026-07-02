import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile, type VerifyCallback } from 'passport-google-oauth20';
import { UserService } from '../identity/user.service';
import type { AuthContext } from '@homework-tracker/shared-types';

/** Registered only when Google credentials are present (see AuthModule). */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly users: UserService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID ?? 'missing',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? 'missing',
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:3000/api/v1/auth/google/callback',
      scope: ['profile', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value ?? '';
    const userId = await this.users.upsertFromGoogle({
      googleSub: profile.id,
      email,
      name: profile.displayName ?? email,
      pictureUrl: profile.photos?.[0]?.value ?? null,
    });
    const ctx = await this.users.buildAuthContext(userId);
    done(null, (ctx as AuthContext) ?? undefined);
  }
}
