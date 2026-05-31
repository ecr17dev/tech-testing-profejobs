import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

function extractMessage(exception: HttpException): string | string[] {
  const response = exception.getResponse();
  if (typeof response === 'string') {
    return response;
  }
  if (typeof response === 'object' && response !== null) {
    const msg = (response as { message?: string | string[] }).message;
    if (msg !== undefined) {
      return msg;
    }
  }
  return exception.message;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? extractMessage(exception)
        : 'Error interno del servidor';

    const errorBody: ErrorResponse = {
      statusCode: httpStatus,
      message,
      error: HttpStatus[httpStatus] || 'Internal Server Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (httpStatus >= 500) {
      this.logger.error(
        `${request.method} ${request.url} -> ${httpStatus}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else if (httpStatus >= 400) {
      this.logger.warn(
        `${request.method} ${request.url} -> ${httpStatus}: ${JSON.stringify(message)}`,
      );
    }

    response.status(httpStatus).json(errorBody);
  }
}
