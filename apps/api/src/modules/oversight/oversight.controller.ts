import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
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

  /** Active class & term from DB — readable by all authenticated users. */
  @Get('active-class-term')
  getActiveClassTerm() {
    return this.svc.getActiveClassTerm();
  }

  /** Set active class & term in DB — admin only. */
  @Patch('admin/active-class-term')
  @Roles('admin')
  setActiveClassTerm(@Body() body: { classId: string; termId: string }) {
    if (!body.classId || !body.termId) throw AppError.validation('classId and termId are required');
    return this.svc.setActiveClassTerm(body.classId, body.termId);
  }

  @Post('admin/classes')
  @Roles('admin')
  createClass(@Body() body: { name: string }) {
    if (!body.name?.trim()) throw AppError.validation('name is required');
    return this.svc.createClassroom(body.name);
  }

  @Patch('admin/classes/:id')
  @Roles('admin')
  renameClass(@Param('id') id: string, @Body() body: { name: string }) {
    if (!body.name?.trim()) throw AppError.validation('name is required');
    return this.svc.renameClassroom(id, body.name);
  }

  @Delete('admin/classes/:id')
  @Roles('admin')
  deleteClass(@Param('id') id: string) {
    return this.svc.deleteClassroom(id);
  }

  @Post('admin/terms')
  @Roles('admin')
  createTerm(@Body() body: { name: string }) {
    if (!body.name?.trim()) throw AppError.validation('name is required');
    return this.svc.createTerm(body.name);
  }

  @Patch('admin/terms/:id')
  @Roles('admin')
  renameTerm(@Param('id') id: string, @Body() body: { name: string }) {
    if (!body.name?.trim()) throw AppError.validation('name is required');
    return this.svc.renameTerm(id, body.name);
  }

  @Delete('admin/terms/:id')
  @Roles('admin')
  deleteTerm(@Param('id') id: string) {
    return this.svc.deleteTerm(id);
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

  // ---------- Subject catalog ----------

  @Get('admin/subjects')
  @Roles('admin')
  listSubjects() {
    return this.svc.listSubjects();
  }

  @Post('admin/subjects')
  @Roles('admin')
  createSubject(@Body() body: { name: string; short: string }) {
    if (!body.name?.trim() || !body.short?.trim())
      throw AppError.validation('name and short are required');
    return this.svc.upsertSubject(undefined, body.name.trim(), body.short.trim().toUpperCase().slice(0, 4));
  }

  @Put('admin/subjects/:id')
  @Roles('admin')
  updateSubject(@Param('id') id: string, @Body() body: { name: string; short: string }) {
    if (!body.name?.trim() || !body.short?.trim())
      throw AppError.validation('name and short are required');
    return this.svc.upsertSubject(id, body.name.trim(), body.short.trim().toUpperCase().slice(0, 4));
  }

  @Delete('admin/subjects/:id')
  @Roles('admin')
  deleteSubject(@Param('id') id: string) {
    return this.svc.deleteSubject(id);
  }

  // ---------- Teacher catalog ----------

  @Get('admin/teacher-catalog')
  @Roles('admin')
  listTeacherCatalog() {
    return this.svc.listTeacherCatalog();
  }

  @Post('admin/teacher-catalog')
  @Roles('admin')
  createTeacherCatalog(@Body() body: { name: string; subject: string; className: string }) {
    if (!body.name?.trim() || !body.subject?.trim() || !body.className?.trim())
      throw AppError.validation('name, subject and className are required');
    return this.svc.upsertTeacherCatalog(undefined, body.name.trim(), body.subject.trim(), body.className.trim());
  }

  @Put('admin/teacher-catalog/:id')
  @Roles('admin')
  updateTeacherCatalog(@Param('id') id: string, @Body() body: { name: string; subject: string; className: string }) {
    if (!body.name?.trim() || !body.subject?.trim() || !body.className?.trim())
      throw AppError.validation('name, subject and className are required');
    return this.svc.upsertTeacherCatalog(id, body.name.trim(), body.subject.trim(), body.className.trim());
  }

  @Delete('admin/teacher-catalog/:id')
  @Roles('admin')
  deleteTeacherCatalog(@Param('id') id: string) {
    return this.svc.deleteTeacherCatalog(id);
  }
}
