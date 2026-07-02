import { Controller, Get, Post, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { Roles, CurrentUser } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { AppError } from '@homework-tracker/shared-errors';
import type { AuthContext } from '@homework-tracker/shared-types';
import { FamilyService } from './family.service';
import { Reflector } from '@nestjs/core';

@Controller('families')
@UseGuards(new RolesGuard(new Reflector()))
export class FamilyController {
  constructor(private readonly families: FamilyService) {}

  @Post()
  async create(@Body() body: { name: string }, @CurrentUser() user: AuthContext) {
    if (!body.name?.trim()) throw AppError.validation('Family name is required');
    return this.families.createFamily(user.userId, body.name.trim());
  }

  @Get(':id/members')
  async members(@Param('id') id: string, @CurrentUser() user: AuthContext) {
    await this.families.assertMember(user.userId, id);
    return this.families.listMembers(id);
  }

  @Post(':id/invites')
  @Roles('parent', 'admin')
  async invite(
    @Param('id') id: string,
    @Body() body: { role: 'parent' | 'child' },
    @CurrentUser() user: AuthContext,
  ) {
    await this.families.assertMember(user.userId, id);
    return this.families.createInvite(id, body.role);
  }

  @Post('/invites/:token/accept')
  async acceptInvite(@Param('token') token: string, @CurrentUser() user: AuthContext) {
    return this.families.acceptInvite(token, user.email, user.userId);
  }

  @Delete(':id/members/:userId')
  @Roles('parent', 'admin')
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser() actor: AuthContext,
  ) {
    await this.families.assertMember(actor.userId, id);
    return this.families.removeMember(id, userId);
  }
}
