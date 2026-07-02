import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AppError } from '@homework-tracker/shared-errors';
import type { AuthContext } from '@homework-tracker/shared-types';

@Controller()
export class IdentityController {
  /** Returns the current auth context, or 401 if not signed in. */
  @Get('me')
  me(@Req() req: Request): AuthContext {
    const user = (req.session as unknown as { user?: AuthContext }).user;
    if (!user) throw AppError.unauthorized();
    return user;
  }
}
