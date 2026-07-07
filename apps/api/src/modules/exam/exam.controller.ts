import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { Roles, CurrentUser } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { Reflector } from '@nestjs/core';
import type { AuthContext } from '@homework-tracker/shared-types';
import { ExamService, type ExamInput } from './exam.service';

@Controller('exams')
@UseGuards(new RolesGuard(new Reflector()))
export class ExamController {
  constructor(private readonly svc: ExamService) {}

  @Get()
  list(@Query('childId') childId?: string, @CurrentUser() user?: AuthContext) {
    const resolvedChildId = childId ?? (user?.roles.includes('child') ? user.userId : undefined);
    return this.svc.list(resolvedChildId);
  }

  @Post()
  @Roles('admin')
  create(@Body() body: ExamInput) {
    return this.svc.create(body);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() body: Partial<ExamInput>) {
    return this.svc.update(id, body);
  }

  @Delete(':id')
  @Roles('admin')
  delete(@Param('id') id: string) {
    return this.svc.delete(id);
  }

  @Post(':id/participate')
  participate(@Param('id') id: string, @CurrentUser() user: AuthContext, @Body('childId') childId?: string) {
    const cid = user.roles.includes('child') ? user.userId : (childId ?? user.userId);
    return this.svc.participate(id, cid);
  }

  @Delete(':id/participate')
  unparticipate(@Param('id') id: string, @CurrentUser() user: AuthContext, @Body('childId') childId?: string) {
    const cid = user.roles.includes('child') ? user.userId : (childId ?? user.userId);
    return this.svc.unparticipate(id, cid);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string, @CurrentUser() user: AuthContext, @Body('childId') childId?: string) {
    const cid = user.roles.includes('child') ? user.userId : (childId ?? user.userId);
    return this.svc.complete(id, cid);
  }

  @Delete(':id/complete')
  uncomplete(@Param('id') id: string, @CurrentUser() user: AuthContext, @Body('childId') childId?: string) {
    const cid = user.roles.includes('child') ? user.userId : (childId ?? user.userId);
    return this.svc.uncomplete(id, cid);
  }
}
