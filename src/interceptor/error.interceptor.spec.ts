import { throwError } from 'rxjs';
import { EntityNotFoundError } from '../domain/user/error/entity.notfound.error';
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ErrorInterceptor } from './error.interceptor';
import { MismatchedUserError } from './error/mismatched.user.error';
import { InvalidTokenError } from '../security/error/invalid.token.error';
import { UserAlreadyCreatedError } from '../domain/user/error/user.already.created.error';

describe('Error Interceptor Test', () => {
  let errorInterceptor: ErrorInterceptor;
  let ctxMock;
  beforeEach(() => {
    errorInterceptor = new ErrorInterceptor();
    ctxMock = {
      switchToHttp: () => ({
        getRequest: () => ({
          url: '/users/username',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer token`,
          },
        }),
      }),
    } as ExecutionContext;
  });

  it('Should throw NotFoundException when EntityNotFoundError is thrown', (done) => {
    const handlerMock = {
      handle() {
        return throwError(() => new EntityNotFoundError('Entity not found'));
      },
    } as CallHandler;

    errorInterceptor.intercept(ctxMock, handlerMock).subscribe({
      error: (error) => {
        expect(error).toEqual(new NotFoundException('Entity not found'));
        done();
      },
    });
  });

  it('Should throw UnauthorizedException when InvalidTokenError is thrown', (done) => {
    const handlerMock = {
      handle() {
        return throwError(() => new InvalidTokenError());
      },
    } as CallHandler;

    errorInterceptor.intercept(ctxMock, handlerMock).subscribe({
      error: (error) => {
        expect(error).toEqual(
          new UnauthorizedException('Invalid or missing token'),
        );
        done();
      },
    });
  });

  it('Should throw ForbiddenException when MismatchedUserError is thrown', (done) => {
    const handlerMock = {
      handle() {
        return throwError(() => new MismatchedUserError());
      },
    } as CallHandler;

    errorInterceptor.intercept(ctxMock, handlerMock).subscribe({
      error: (error) => {
        expect(error).toEqual(
          new ForbiddenException(
            'User in authorization does not match user on request',
          ),
        );
        done();
      },
    });
  });

  it('Should thrown BadRequestException when UserAlreadyCreatedError is thrown', (done) => {
    const handlerMock = {
      handle() {
        return throwError(() => new UserAlreadyCreatedError('username'));
      },
    } as CallHandler;

    errorInterceptor.intercept(ctxMock, handlerMock).subscribe({
      error: (error) => {
        expect(error).toEqual(
          new BadRequestException('User username is already created.'),
        );
        done();
      },
    });
  });

  it('Should throw InternalServerErrorException when non specific Error is thrown', (done) => {
    const handlerMock = {
      handle() {
        return throwError(() => new Error('non-specific error'));
      },
    } as CallHandler;

    errorInterceptor.intercept(ctxMock, handlerMock).subscribe({
      error: (error) => {
        expect(error).toEqual(
          new InternalServerErrorException('non-specific error'),
        );
        done();
      },
    });
  });
});
