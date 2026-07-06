import { Controller, Get, Patch, Req, Param, Body } from '@nestjs/common';
import type { Request } from 'express';
import { AppError } from '@homework-tracker/shared-errors';
import type { AuthContext } from '@homework-tracker/shared-types';
import { UserService } from './user.service';

@Controller()
export class IdentityController {
  constructor(private readonly users: UserService) {}

  @Get('me')
  async me(@Req() req: Request) {
    const session = req.session as unknown as { user?: AuthContext };
    if (!session.user) throw AppError.unauthorized();
    const fresh = await this.users.buildAuthContextWithFamily(session.user.userId);
    if (!fresh) throw AppError.unauthorized();
    const { familyMembers, ...authCtx } = fresh as AuthContext & { familyMembers?: unknown };
    session.user = authCtx;
    return { ...authCtx, familyMembers };
  }

  @Patch('users/:id/name')
  async updateName(
    @Req() req: Request,
    @Param('id') targetId: string,
    @Body() body: { name: string },
  ): Promise<{ ok: boolean }> {
    const session = req.session as unknown as { user?: AuthContext };
    if (!session.user) throw AppError.unauthorized();
    if (!body.name?.trim()) throw AppError.validation('Name is required');
    await this.users.assertSameFamilyOrSelf(session.user, targetId);
    await this.users.updateName(targetId, body.name.trim());
    if (session.user.userId === targetId) {
      const updated = await this.users.buildAuthContext(targetId);
      if (updated) session.user = updated;
    }
    return { ok: true };
  }

  @Patch('users/:id/short-name')
  async updateShortName(
    @Req() req: Request,
    @Param('id') targetId: string,
    @Body() body: { shortName: string },
  ): Promise<{ ok: boolean }> {
    const session = req.session as unknown as { user?: AuthContext };
    if (!session.user) throw AppError.unauthorized();
    await this.users.assertSameFamilyOrSelf(session.user, targetId);
    await this.users.updateShortName(targetId, (body.shortName ?? '').trim());
    if (session.user.userId === targetId) {
      const updated = await this.users.buildAuthContext(targetId);
      if (updated) session.user = updated;
    }
    return { ok: true };
  }
}
