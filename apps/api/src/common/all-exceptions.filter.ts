import { Catch, ExceptionFilter, ArgumentsHost, HttpException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppError, toEnvelope } from '@homework-tracker/shared-errors';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const requestId = req.requestId ?? 'unknown';

    // Normalise NestJS HttpException into AppError-compatible envelope.
    if (exception instanceof HttpException && !(exception instanceof AppError)) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      const message =
        typeof payload === 'string'
          ? payload
          : ((payload as { message?: string }).message ?? exception.message);
      res.status(status).json({
        error: { code: `HTTP_${status}`, message, status, requestId },
      });
      return;
    }

    const envelope = toEnvelope(exception, requestId);
    res.status(envelope.error.status).json(envelope);
  }
}
