import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { IdentityController } from './identity/identity.controller';
import { UserService } from './identity/user.service';
import { RequestIdMiddleware } from './common/request-id.middleware';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './common/core.module';
import { FamilyModule } from './modules/family/family.module';
import { AssignmentModule } from './modules/assignment/assignment.module';
import { ProgressModule } from './modules/progress/progress.module';
import { RequestsAuditModule } from './modules/requests-audit/requests.module';
import { OversightModule } from './modules/oversight/oversight.module';

@Module({
  imports: [CoreModule, PrismaModule, AuthModule, FamilyModule, AssignmentModule, ProgressModule, RequestsAuditModule, OversightModule],
  controllers: [HealthController, IdentityController],
  providers: [UserService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
