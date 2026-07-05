import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { Roles, CurrentUser } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import type { AuthContext } from '@homework-tracker/shared-types';
import { AppError } from '@homework-tracker/shared-errors';
import { ProgressService } from './progress.service';
import { Reflector } from '@nestjs/core';

@Controller('progress')
@UseGuards(new RolesGuard(new Reflector()))
export class ProgressController {
  constructor(private readonly svc: ProgressService) {}

  @Get()
  async list(
    @CurrentUser() user: AuthContext,
    @Query('childId') childId?: string,
    @Query('className') className?: string,
    @Query('termName') termName?: string,
    @Query('assignmentId') assignmentId?: string,
  ) {
    if (!user.familyId) throw AppError.forbidden('No family');
    const effectiveChildId = user.roles.includes('child')
      ? user.userId
      : (childId ?? await this.svc.resolveChildUserId(user.familyId, user.userId));
    return this.svc.listForChild(effectiveChildId, user.familyId, className, termName, assignmentId);
  }

  @Patch(':assignmentId')
  async update(
    @Param('assignmentId') assignmentId: string,
    @Body() body: { status: string; progressId?: string; childId?: string },
    @CurrentUser() user: AuthContext,
  ) {
    if (!user.familyId) throw AppError.forbidden('No family');
    const childId = user.roles.includes('child')
      ? user.userId
      : (body.childId ?? await this.svc.resolveChildUserId(user.familyId, user.userId));
    return this.svc.updateStatus(
      body.progressId ?? null, assignmentId,
      childId, user.familyId,
      body.status as any, user,
    );
  }
}
