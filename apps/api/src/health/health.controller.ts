import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('healthz')
  health(): { status: string; ts: string } {
    return { status: 'ok', ts: new Date().toISOString() };
  }
}
