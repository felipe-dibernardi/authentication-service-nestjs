import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggerInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request: Request = context.switchToHttp().getRequest();
    this.logger.log(`${request.method} Request sent to ${request.url}`);
    if (
      request.body &&
      Object.keys(request.body).length !== 0 &&
      Logger.isLevelEnabled('debug')
    ) {
      this.logger.debug(JSON.stringify(request.body));
    }
    return next.handle();
  }
}
