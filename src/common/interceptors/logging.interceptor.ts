import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, ip, headers } = request;
    
    // Generate request ID
    const requestId = uuidv4();
    request.requestId = requestId;
    response.setHeader('X-Request-ID', requestId);

    const userAgent = headers['user-agent'] || '';
    const now = Date.now();

    this.logger.log(
      `${method} ${url} - ${ip} - ${userAgent} - [${requestId}]`
    );

    return next
      .handle()
      .pipe(
        tap(() => {
          const { statusCode } = response;
          const responseTime = Date.now() - now;
          
          this.logger.log(
            `${method} ${url} - ${statusCode} - ${responseTime}ms - [${requestId}]`
          );
        }),
      );
  }
}