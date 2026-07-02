import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { Roles, CurrentUser } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import type { AuthContext } from '@homework-tracker/shared-types';
import { AppError } from '@homework-tracker/shared-errors';
import { OversightService } from './oversight.service';
import { Reflector } from '@nestjs/core';

@Controller('oversight')
@UseGuards(new RolesGuard(new Reflector()))
export class OversightController {
  constructor(private readonly svc: OversightService) {}

  /** All classrooms (from DB) — used to populate class dropdowns. */
  @Get('classes')
  classes() {
    return this.svc.getClassrooms();
  }

  /** All terms (from DB). */
  @Get('terms')
  terms() {
    return this.svc.getTerms();
  }

  /** Teacher: progress matrix for the teacher's class(es). */
  @Get('teacher')
  @Roles('teacher', 'admin')
  teacherOverview(
    @CurrentUser() user: AuthContext,
    @Query('className') className?: string,
    @Query('termName') termName?: string,
  ) {
    return this.svc.getTeacherOverview(user.userId, className, termName);
  }

  /** Admin: aggregate dashboard stats. */
  @Get('admin/overview')
  @Roles('admin')
  adminOverview() {
    return this.svc.getAdminOverview();
  }

  /** Admin: all families with members. */
  @Get('admin/families')
  @Roles('admin')
  adminFamilies() {
    return this.svc.getAdminFamilies();
  }

  /** Admin: progress across all families. */
  @Get('admin/progress')
  @Roles('admin')
  adminProgress(
    @Query('className') className?: string,
    @Query('termName') termName?: string,
  ) {
    return this.svc.getAdminAllProgress(className, termName);
  }

  /** Admin: list teacher assignments. */
  @Get('admin/teachers')
  @Roles('admin')
  adminTeachers() {
    return this.svc.getAdminTeachers();
  }

  /** Admin: assign a user as teacher to a class. */
  @Post('admin/teachers')
  @Roles('admin')
  assignTeacher(@Body() body: { email: string; className: string }) {
    if (!body.email?.trim() || !body.className?.trim())
      throw AppError.validation('email and className are required');
    return this.svc.assignTeacher(body.email, body.className);
  }

  /** Admin: remove a teacher assignment. */
  @Delete('admin/teachers/:id')
  @Roles('admin')
  removeTeacher(@Param('id') id: string) {
    return this.svc.removeTeacherAssignment(id);
  }
}
