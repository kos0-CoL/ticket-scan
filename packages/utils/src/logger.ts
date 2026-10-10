export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  requestId?: string;
  userId?: string;
  provider?: string;
  model?: string;
  attempt?: number;
  maxAttempts?: number;
  durationMs?: number;
  tokensUsed?: {
    input: number;
    output: number;
    total: number;
  };
  cost?: number;
  error?: string;
  errorCode?: string;
  [key: string]: unknown;
}

export interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: LogContext;
}

interface RequestLike {
  method?: string;
  url?: string;
  headers?: Record<string, string | undefined> | Headers;
  getHeader?: (name: string) => string | undefined;
}

function getHeaderValue(headers: Record<string, string | undefined> | Headers | undefined, name: string): string | undefined {
  if (!headers) return undefined;
  if (headers instanceof Headers) {
    const value = headers.get(name);
    return value ?? undefined;
  }
  return headers[name.toLowerCase()] || headers[name];
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = 'info';

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level] >= levels[this.logLevel];
  }

  private formatEntry(level: LogLevel, message: string, context: LogContext = {}): StructuredLogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };
  }

  private output(entry: StructuredLogEntry): void {
    const logLine = JSON.stringify(entry);
    if (entry.level === 'error' || entry.level === 'warn') {
      console.error(logLine);
    } else {
      console.log(logLine);
    }
  }

  debug(message: string, context: LogContext = {}): void {
    if (this.shouldLog('debug')) {
      this.output(this.formatEntry('debug', message, context));
    }
  }

  info(message: string, context: LogContext = {}): void {
    if (this.shouldLog('info')) {
      this.output(this.formatEntry('info', message, context));
    }
  }

  warn(message: string, context: LogContext = {}): void {
    if (this.shouldLog('warn')) {
      this.output(this.formatEntry('warn', message, context));
    }
  }

  error(message: string, context: LogContext = {}): void {
    if (this.shouldLog('error')) {
      this.output(this.formatEntry('error', message, context));
    }
  }

  logRequest(request: RequestLike, context: LogContext = {}): void {
    this.info('OCR request received', {
      ...context,
      method: request.method,
      url: request.url,
      userAgent: getHeaderValue(request.headers, 'user-agent'),
      contentLength: getHeaderValue(request.headers, 'content-length'),
    });
  }

  logResponse(context: LogContext, statusCode: number, durationMs: number): void {
    this.info('OCR response sent', {
      ...context,
      statusCode,
      durationMs,
    });
  }

  logError(context: LogContext, error: Error | unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    this.error('OCR error occurred', {
      ...context,
      error: errorMessage,
      errorStack,
    });
  }

  logProviderAttempt(context: LogContext): void {
    this.info('OCR provider attempt', context);
  }

  logProviderSuccess(context: LogContext): void {
    this.info('OCR provider succeeded', context);
  }

  logProviderFailure(context: LogContext): void {
    this.warn('OCR provider failed, trying fallback', context);
  }

  logCost(context: LogContext, cost: number): void {
    this.info('OCR cost tracked', { ...context, cost });
  }
}

export const logger = Logger.getInstance();

export function createRequestContext(request: RequestLike, userId?: string): LogContext {
  const requestId = getHeaderValue(request.headers, 'x-request-id') || crypto.randomUUID();
  return {
    requestId,
    userId,
  };
}

export function withRequestLogging<T>(
  request: RequestLike,
  handler: (context: LogContext) => Promise<T>,
  userId?: string
): Promise<T> {
  const context = createRequestContext(request, userId);
  const startTime = Date.now();

  logger.logRequest(request, context);

  return handler(context)
    .then((result) => {
      logger.logResponse(context, 200, Date.now() - startTime);
      return result;
    })
    .catch((error) => {
      logger.logError(context, error);
      logger.logResponse(context, 500, Date.now() - startTime);
      throw error;
    });
}