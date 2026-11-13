import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const now = Date.now();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    const method = request?.method;
    const url = request?.originalUrl || request?.url;
    const requestId = request?.headers?.['x-request-id'];

    return next.handle().pipe(
      tap(() => {
        const statusCode = response?.statusCode;
        const contentLength = response?.getHeader?.('content-length');
        const durationMs = Date.now() - now;

        this.logger.log(
          JSON.stringify({
            msg: 'request_completed',
            method,
            url,
            statusCode,
            durationMs,
            contentLength,
            requestId,
          }),
        );
      }),
    );
  }
}
