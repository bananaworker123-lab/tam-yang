import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AppError } from '@homework-tracker/shared-errors';
import type { AuthContext, Role } from '@homework-tracker/shared-types';
import { ROLES_KEY } from './roles.decorator';

/**
 * Enforces authentication and (optionally) role membership.
 * - No session user → AUTH_001 (401)
 * - @Roles set and user lacks all → AUTH_002 (403)
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>();
    const user = (req.session as unknown as { user?: AuthContext }).user;
    if (!user) throw AppError.unauthorized();

    const required = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const ok = required.some((r) => user.roles.includes(r));
    if (!ok) throw AppError.forbidden('Insufficient role');
    return true;
  }
}
