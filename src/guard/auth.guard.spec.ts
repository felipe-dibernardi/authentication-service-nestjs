import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { JwtBaseService } from '../security/jwt.base.service';
import { JwtSecretService } from '../security/jwt.secret.service';

describe('Auth Guard Spec', () => {
  let authGuard: AuthGuard;
  let configService: ConfigService;
  let jwtService: JwtBaseService;

  beforeEach(() => {
    configService = new ConfigService();
    jwtService = new JwtSecretService(new JwtService(), configService);
    authGuard = new AuthGuard(jwtService, configService);
  });

  describe('Without auth header', () => {
    it('Should pass the guard with auth disabled', async () => {
      jest.spyOn(configService, 'get').mockImplementation(() => false);
      const ctxMock = {
        switchToHttp: () => ({
          getRequest: () => ({}),
        }),
      } as ExecutionContext;

      expect(await authGuard.canActivate(ctxMock)).toBeTruthy();
    });

    it('Should fail the guard with auth enabled', async () => {
      jest.spyOn(configService, 'get').mockImplementation(() => true);
      const ctxMock = {
        switchToHttp: () => ({
          getRequest: () => ({}),
        }),
      } as ExecutionContext;

      expect(await authGuard.canActivate(ctxMock)).toBeFalsy();
    });
  });

  describe('Auth header present and auth enabled', () => {
    beforeEach(() => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'auth.enabled') {
          return true;
        }
        if (key === 'auth.secret') {
          return 'testsecret';
        }
      });
    });

    it('Should pass when provided a valid token', async () => {
      const token = jwtService.createToken(
        { sub: { id: 'abc', username: 'user-test' } },
        '2h',
      );
      const ctxMock = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              'content-type': 'application/json',
              authorization: `Bearer ${token}`,
            },
          }),
        }),
      } as ExecutionContext;

      expect(await authGuard.canActivate(ctxMock)).toBeTruthy();
    });

    it('Should fail when provided a wrong token', async () => {
      const token = 'mock-token';
      const ctxMock = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              'content-type': 'application/json',
              authorization: `${token}`,
            },
          }),
        }),
      } as ExecutionContext;

      expect(await authGuard.canActivate(ctxMock)).toBeFalsy();
    });
  });
});
