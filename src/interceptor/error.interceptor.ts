import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';
import { EntityNotFoundError } from '../domain/user/error/entity.notfound.error';
import { MismatchedUserError } from './error/mismatched.user.error';
import { InvalidTokenError } from '../security/error/invalid.token.error';
import { UserAlreadyCreatedError } from '../domain/user/error/user.already.created.error';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        return throwError(() => this.handleErrors(err));
      }),
    );
  }

  private isUnauthorizedException(err: Error) {
    return (
      err instanceof UnauthorizedException || err instanceof InvalidTokenError
    );
  }

  private handleErrors(err: Error): HttpException {
    if (err instanceof EntityNotFoundError) {
      return new NotFoundException(err.message);
    }
    if (err instanceof MismatchedUserError) {
      return new ForbiddenException(err.message);
    }
    if (this.isUnauthorizedException(err)) {
      return new UnauthorizedException(err.message);
    }
    if (err instanceof UserAlreadyCreatedError) {
      return new BadRequestException(err.message);
    }
    return new InternalServerErrorException(err.message);
  }
}
