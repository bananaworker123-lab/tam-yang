import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { Roles, CurrentUser } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import type { AuthContext } from '@homework-tracker/shared-types';
import { AppError } from '@homework-tracker/shared-errors';
import { AssignmentService, type AssignmentInput } from './assignment.service';
import { Reflector } from '@nestjs/core';

@Controller('assignments')
@UseGuards(new RolesGuard(new Reflector()))
export class AssignmentController {
  constructor(private readonly svc: AssignmentService) {}

  @Get()
  list(@Query('className') className?: string, @Query('termName') termName?: string, @Query('all') all?: string) {
    return all === '1' ? this.svc.listAll() : this.svc.listActive(className, termName);
  }

  @Post()
  @Roles('admin')
  create(@Body() body: AssignmentInput, @CurrentUser() actor: AuthContext) {
    if (!body.topic?.trim() || !body.teacherName) throw AppError.validation('Topic and teacher are required');
    return this.svc.create(body, actor.userId, actor.roles[0] ?? 'admin');
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() body: Partial<AssignmentInput> & { active?: boolean }, @CurrentUser() actor: AuthContext) {
    return this.svc.update(id, body, actor.userId, actor.roles[0] ?? 'admin');
  }

  @Delete(':id')
  @Roles('admin')
  delete(@Param('id') id: string, @CurrentUser() actor: AuthContext) {
    return this.svc.delete(id, actor.userId, actor.roles[0] ?? 'admin');
  }
}
