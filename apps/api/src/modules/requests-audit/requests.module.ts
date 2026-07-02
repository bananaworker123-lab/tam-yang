import { Module } from '@nestjs/common';
import { RequestsController } from './requests.controller';
import { RequestsAuditService } from './requests.service';

@Module({ controllers: [RequestsController], providers: [RequestsAuditService] })
export class RequestsAuditModule {}
