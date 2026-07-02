import { Module, type Provider } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './google.strategy';
import { UserService } from '../identity/user.service';

// Register the Google strategy only when credentials are configured, so the
// app still boots (and dev-login works) without OAuth secrets.
const strategyProviders: Provider[] =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [GoogleStrategy] : [];

@Module({
  controllers: [AuthController],
  providers: [UserService, ...strategyProviders],
  exports: [UserService],
})
export class AuthModule {}
