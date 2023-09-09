import { SameUserPathInterceptor } from './same-user-path.interceptor';
import { Reflector } from '@nestjs/core';
import { JwtSecretService } from '../security/jwt.secret.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext, Type } from '@nestjs/common';
import { MismatchedUserError } from './error/mismatched.user.error';
import { UserController } from '../controller/user.controller';

describe('Same User Path Interceptor Test', () => {
  let sameUserPathInterceptor: SameUserPathInterceptor;
  let reflector: Reflector;
  let jwtService: JwtSecretService;
  let handlerMock;

  beforeEach(() => {
    reflector = new Reflector();
    jwtService = new JwtSecretService(new JwtService(), new ConfigService());
    sameUserPathInterceptor = new SameUserPathInterceptor(
      reflector,
      jwtService,
    );

    handlerMock = {
      handle: jest.fn(),
    };
  });

  it('Should throw error when username is not the same in token and path', () => {
    const ctxMock = {
      getClass<T = any>(): Type<UserController> {
        return UserController;
      },
      // eslint-disable-next-line @typescript-eslint/ban-types
      getHandler(): Function {
        return () => 'getUser';
      },
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

    jest
      .spyOn(reflector, 'getAllAndMerge')
      .mockReturnValue(['/users', '/:username']);

    jest.spyOn(jwtService, 'decodeToken').mockImplementation(() => {
      return {
        sub: { id: 'abc', username: 'another-username' },
        iat: 9999999,
        exp: 9999999,
      };
    });

    expect(() =>
      sameUserPathInterceptor.intercept(ctxMock, handlerMock),
    ).toThrow(new MismatchedUserError());
  });

  it('Should throw error when there is no username on path', () => {
    const ctxMock = {
      getClass<T = any>(): Type<UserController> {
        return UserController;
      },
      // eslint-disable-next-line @typescript-eslint/ban-types
      getHandler(): Function {
        return () => 'getUser';
      },
      switchToHttp: () => ({
        getRequest: () => ({
          url: '/users/',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer token`,
          },
        }),
      }),
    } as ExecutionContext;

    jest.spyOn(reflector, 'getAllAndMerge').mockImplementation(() => ['users']);

    jest.spyOn(jwtService, 'decodeToken').mockImplementation(() => {
      return {
        sub: { id: 'abc', username: 'username' },
        iat: 9999999,
        exp: 9999999,
      };
    });

    expect(() =>
      sameUserPathInterceptor.intercept(ctxMock, handlerMock),
    ).toThrow(new MismatchedUserError());
  });

  it('Should throw error when there is a mismatch between url and context path', () => {
    const ctxMock = {
      getClass<T = any>(): Type<UserController> {
        return UserController;
      },
      // eslint-disable-next-line @typescript-eslint/ban-types
      getHandler(): Function {
        return () => 'getUser';
      },
      switchToHttp: () => ({
        getRequest: () => ({
          url: '/users',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer token`,
          },
        }),
      }),
    } as ExecutionContext;

    jest
      .spyOn(reflector, 'getAllAndMerge')
      .mockImplementation(() => ['/users', '/:username']);

    jest.spyOn(jwtService, 'decodeToken').mockImplementation(() => {
      return {
        sub: { id: 'abc', username: 'username' },
        iat: 9999999,
        exp: 9999999,
      };
    });

    expect(() =>
      sameUserPathInterceptor.intercept(ctxMock, handlerMock),
    ).toThrow(new MismatchedUserError());
  });

  it('Should call handle when there is no mismatch', () => {
    const ctxMock = {
      getClass<T = any>(): Type<UserController> {
        return UserController;
      },
      // eslint-disable-next-line @typescript-eslint/ban-types
      getHandler(): Function {
        return () => 'getUser';
      },
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

    jest
      .spyOn(reflector, 'getAllAndMerge')
      .mockImplementation(() => ['/users', '/:username']);

    jest.spyOn(jwtService, 'decodeToken').mockImplementation(() => {
      return {
        sub: { id: 'abc', username: 'username' },
        iat: 9999999,
        exp: 9999999,
      };
    });

    sameUserPathInterceptor.intercept(ctxMock, handlerMock);
    expect(handlerMock.handle).toBeCalledTimes(1);
  });
});
