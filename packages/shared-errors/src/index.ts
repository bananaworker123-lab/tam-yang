/** Standard error codes shared across modules: [DOMAIN]_[NUMBER]. */
export const ErrorCode = {
  VALIDATION_001: 'VALIDATION_001',
  AUTH_001: 'AUTH_001', // not authenticated
  AUTH_002: 'AUTH_002', // forbidden / cross-scope
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT_001: 'CONFLICT_001',
  INTERNAL: 'INTERNAL',
} as const;
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

const DEFAULT_STATUS: Record<string, number> = {
  VALIDATION_001: 400,
  AUTH_001: 401,
  AUTH_002: 403,
  NOT_FOUND: 404,
  CONFLICT_001: 409,
  INTERNAL: 500,
};

/** Application error thrown by services, converted to an envelope by the API filter. */
export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: string, message: string, status?: number, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status ?? DEFAULT_STATUS[code] ?? 500;
    this.details = details;
  }

  static validation(message: string, details?: unknown): AppError {
    return new AppError(ErrorCode.VALIDATION_001, message, 400, details);
  }
  static unauthorized(message = 'Not authenticated'): AppError {
    return new AppError(ErrorCode.AUTH_001, message, 401);
  }
  static forbidden(message = 'Forbidden'): AppError {
    return new AppError(ErrorCode.AUTH_002, message, 403);
  }
  static notFound(message = 'Not found'): AppError {
    return new AppError(ErrorCode.NOT_FOUND, message, 404);
  }
  static conflict(message: string, details?: unknown): AppError {
    return new AppError(ErrorCode.CONFLICT_001, message, 409, details);
  }
}

export interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
    status: number;
    details?: unknown;
    requestId: string;
  };
}

/** Pure function: convert any thrown value into the standard error envelope. */
export function toEnvelope(err: unknown, requestId: string): ErrorEnvelope {
  if (err instanceof AppError) {
    return {
      error: {
        code: err.code,
        message: err.message,
        status: err.status,
        ...(err.details !== undefined ? { details: err.details } : {}),
        requestId,
      },
    };
  }
  const message = err instanceof Error ? err.message : 'Internal server error';
  return {
    error: {
      code: ErrorCode.INTERNAL,
      message,
      status: 500,
      requestId,
    },
  };
}
