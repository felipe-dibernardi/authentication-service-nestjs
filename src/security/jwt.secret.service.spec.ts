import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtSecretService } from './jwt.secret.service';
import { JwtService } from '@nestjs/jwt';
import { InvalidTokenError } from './error/invalid.token.error';
import { ConfigurationMissingError } from './error/configuration.missing.error';

describe('JWT Secret Service Test', () => {
  let jwtSecretService: JwtSecretService;
  let configService: ConfigService;
  let jwtService: JwtService;

  beforeEach(() => {
    configService = new ConfigService();
    jwtService = new JwtService();
    jwtSecretService = new JwtSecretService(jwtService, configService);
  });

  it('Should throw exception when authorization header is not present', () => {
    const headers = {
      'content-type': 'application/json',
    };

    expect(() =>
      jwtSecretService.extractAccessTokenFromHeader(headers),
    ).toThrow();
  });

  it('Should throw exception when auth.secret is not configured', () => {
    expect(() =>
      jwtSecretService.createToken(
        { sub: { id: 'abc', username: 'user-test' } },
        '2h',
      ),
    ).toThrow(new ConfigurationMissingError('auth.secret'));
  });

  describe('auth.secret config present', () => {
    beforeEach(() => {
      jest.spyOn(configService, 'get').mockImplementation(() => 'testsecret');
    });

    it('Should verify token correctly', () => {
      const token = jwtSecretService.createToken(
        { sub: { id: 'abc', username: 'user-test' } },
        '2h',
      );

      const payload = jwtSecretService.verifyToken(token);

      expect(payload.sub.username).toEqual('user-test');
    });

    it('Should decode token correctly', () => {
      const token = jwtSecretService.createToken(
        { sub: { id: 'abc', username: 'user-test' } },
        '2h',
      );

      const payload = jwtSecretService.decodeToken(token);

      expect(payload.sub.username).toEqual('user-test');
    });

    it('Should throw InvalidAccessTokenError when token is undefined', async () => {
      await expect(() => jwtSecretService.verifyToken(undefined)).toThrow(
        new InvalidTokenError(),
      );
    });

    it('Should throw InvalidAccessTokenError when token in invalid', async () => {
      await expect(() => jwtSecretService.verifyToken('Test')).toThrow(
        new InvalidTokenError(),
      );
    });
  });
});
