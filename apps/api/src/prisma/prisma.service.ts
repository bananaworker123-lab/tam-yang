import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '../../prisma-client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    // Connect lazily — don't crash the app if the DB isn't up yet (dev).
    try {
      await this.$connect();
      this.logger.log('Connected to database');
    } catch (err) {
      this.logger.warn(
        `Database not reachable yet — queries will fail until it is up. (${(err as Error).message})`,
      );
    }
  }
}
