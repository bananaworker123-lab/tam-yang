import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { AppError, ErrorCode, toEnvelope } from './index.js';

describe('error-envelope-shape (PBT)', () => {
  it('AppError → envelope always has code/message/status/requestId', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(ErrorCode)),
        fc.string(),
        fc.string({ minLength: 1 }),
        (code, message, requestId) => {
          const env = toEnvelope(new AppError(code, message), requestId);
          expect(env.error.code).toBe(code);
          expect(env.error.message).toBe(message);
          expect(typeof env.error.status).toBe('number');
          expect(env.error.status).toBeGreaterThanOrEqual(400);
          expect(env.error.requestId).toBe(requestId);
        },
      ),
    );
  });

  it('unknown thrown value → INTERNAL 500 envelope with requestId', () => {
    fc.assert(
      fc.property(fc.anything(), fc.string({ minLength: 1 }), (thrown, requestId) => {
        const env = toEnvelope(thrown, requestId);
        // AppError instances are handled in the other property; here we only
        // assert the fallback contract for non-AppError values.
        if (!(thrown instanceof AppError)) {
          expect(env.error.code).toBe(ErrorCode.INTERNAL);
          expect(env.error.status).toBe(500);
          expect(env.error.requestId).toBe(requestId);
        }
      }),
    );
  });

  it('static helpers map to expected status codes', () => {
    expect(AppError.validation('x').status).toBe(400);
    expect(AppError.unauthorized().status).toBe(401);
    expect(AppError.forbidden().status).toBe(403);
    expect(AppError.notFound().status).toBe(404);
    expect(AppError.conflict('x').status).toBe(409);
  });
});
