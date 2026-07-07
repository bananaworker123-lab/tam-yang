import { Module } from '@nestjs/common';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { CoreModule } from '../../common/core.module';

@Module({
  imports: [CoreModule, PrismaModule],
  controllers: [ExamController],
  providers: [ExamService],
})
export class ExamModule {}
