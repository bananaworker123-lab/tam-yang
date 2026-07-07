import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { Roles, CurrentUser } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import type { AuthContext } from '@homework-tracker/shared-types';
import { AppError } from '@homework-tracker/shared-errors';
import { RequestsAuditService } from './requests.service';
import { Reflector } from '@nestjs/core';

@Controller()
@UseGuards(new RolesGuard(new Reflector()))
export class RequestsController {
  constructor(private readonly svc: RequestsAuditService) {}

  @Post('requests')
  createRequest(@Body() body: { detail: string; assignmentId?: string; requestType?: string; examData?: string }, @CurrentUser() user: AuthContext) {
    if (!body.detail?.trim()) throw AppError.validation('Detail is required');
    if (user.roles.includes('admin')) throw AppError.forbidden('Admin cannot create requests');
    return this.svc.createRequest(user.userId, user.roles[0]!, body.detail, body.assignmentId, body.requestType, body.examData);
  }

  @Get('requests/mine')
  myRequests(@CurrentUser() user: AuthContext) {
    return this.svc.listMine(user.userId);
  }

  @Get('requests')
  @Roles('admin')
  allRequests() { return this.svc.listAll(); }

  @Post('requests/:id/resolve')
  @Roles('admin')
  resolve(@Param('id') id: string, @Body() body: { reply: string }) {
    return this.svc.resolve(id, body.reply, 'resolved');
  }

  @Post('requests/:id/reject')
  @Roles('admin')
  reject(@Param('id') id: string, @Body() body: { reply?: string }) {
    return this.svc.resolve(id, body.reply ?? '', 'rejected');
  }

  @Get('audit')
  @Roles('admin')
  audit(@Query('q') q?: string) { return this.svc.searchAudit(q); }
}
