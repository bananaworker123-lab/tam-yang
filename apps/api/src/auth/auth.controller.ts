import { Controller, Get, Post, Req, Res, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AppError } from '@homework-tracker/shared-errors';
import { Role, type AuthContext } from '@homework-tracker/shared-types';

const hasGoogle = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

@Controller('auth')
export class AuthController {
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleStart(): void { /* Passport redirects to Google */ }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: Request, @Res() res: Response): void {
    const user = req.user as AuthContext | undefined;
    if (user) (req.session as unknown as { user?: AuthContext }).user = user;
    const web = process.env.WEB_ORIGIN ?? 'http://localhost:5173';
    res.redirect(`${web}/home`);
  }

  @Post('logout')
  logout(@Req() req: Request): { ok: true } {
    req.session.destroy(() => undefined);
    return { ok: true };
  }

  /**
   * DEV ONLY — create a session without Google OAuth for local testing.
   * Disabled in production.
   */
  @Post('dev-login')
  devLogin(@Req() req: Request, @Body() body: { role?: Role; name?: string }): AuthContext {
    if (process.env.NODE_ENV === 'production') {
      throw AppError.forbidden('dev-login is disabled in production');
    }
    const role = body?.role ?? Role.Parent;
    const ctx: AuthContext = {
      userId: 'dev-user',
      email: 'dev@example.com',
      name: body?.name ?? 'Dev User',
      roles: [role],
      familyId: role === Role.Parent || role === Role.Child ? 'dev-family' : null,
      classScopes: role === Role.Teacher ? ['dev-class'] : [],
      onboardingComplete: role !== Role.Parent,
    };
    (req.session as unknown as { user?: AuthContext }).user = ctx;
    return ctx;
  }

  static googleEnabled(): boolean {
    return hasGoogle;
  }
}
