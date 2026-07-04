import { Controller, Get, Patch, Req, Body } from '@nestjs/common';
import type { Request } from 'express';
import { AppError } from '@homework-tracker/shared-errors';
import type { AuthContext } from '@homework-tracker/shared-types';
import { UserService } from './user.service';

@Controller()
export class IdentityController {
  constructor(private readonly users: UserService) {}

  @Get('me')
  async me(@Req() req: Request): Promise<AuthContext> {
    const session = req.session as unknown as { user?: AuthContext };
    if (!session.user) throw AppError.unauthorized();
    const fresh = await this.users.buildAuthContext(session.user.userId);
    if (!fresh) throw AppError.unauthorized();
    session.user = fresh;
    return fresh;
  }

  @Patch('users/:id/name')
  async updateName(
    @Req() req: Request,
    @Body() body: { name: string },
  ): Promise<AuthContext> {
    const session = req.session as unknown as { user?: AuthContext };
    if (!session.user) throw AppError.unauthorized();
    if (!body.name?.trim()) throw AppError.validation('Name is required');
    await this.users.updateName(session.user.userId, body.name.trim());
    const updated = await this.users.buildAuthContext(session.user.userId);
    if (!updated) throw AppError.notFound('User not found');
    session.user = updated;
    return updated;
  }
}
