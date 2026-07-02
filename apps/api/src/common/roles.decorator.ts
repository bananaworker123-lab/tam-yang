import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Role, AuthContext } from '@homework-tracker/shared-types';

export const ROLES_KEY = 'roles';

/** Restrict a route to the given roles. Usage: @Roles('admin') */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

/** Inject the current AuthContext from the session. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthContext | undefined => {
    const req = ctx.switchToHttp().getRequest();
    return (req.session as { user?: AuthContext } | undefined)?.user;
  },
);
