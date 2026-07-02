import { Module } from '@nestjs/common';
import { OversightController } from './oversight.controller';
import { OversightService } from './oversight.service';

@Module({
  controllers: [OversightController],
  providers: [OversightService],
})
export class OversightModule {}
