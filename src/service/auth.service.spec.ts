import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { UserRepositoryMemory } from '../persistence/user/user.repository.memory';
import { JwtSecretService } from '../security/jwt.secret.service';
import { User } from '../domain/user/user.domain';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { InvalidTokenError } from '../security/error/invalid.token.error';

describe('Auth Service Test', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtSecretService;
  let configService: ConfigService;
  beforeEach(() => {
    configService = new ConfigService();
    userService = new UserService(new UserRepositoryMemory(undefined));
    jwtService = new JwtSecretService(new JwtService(), configService);
    authService = new AuthService(userService, jwtService);
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      if (key === 'auth.enabled') {
        return true;
      }
      if (key === 'auth.secret') {
        return 'testsecret';
      }
    });
  });

  it('Should authenticate user with correct username and password', () => {
    const username = 'userAuthenticating';
    const password = 'userPassword';
    jest
      .spyOn(userService, 'getByUsername')
      .mockImplementation(() => User.createAndEncrypt({ username, password }));

    const token = authService.signIn(username, password);

    expect(token.get('access')).not.toBeNull();
  });

  it('Should not authenticate with non-existent user', () => {
    const username = 'userAuthenticating';
    const password = 'userPassword';
    userService.insert(
      User.createAndEncrypt({
        username,
        password,
      }),
    );

    expect(() => authService.signIn('non-existent-user', password)).toThrow(
      new UnauthorizedException('Username and/or password incorrect'),
    );
  });

  it('Should not authenticate user with wrong password', () => {
    const username = 'userAuthenticating';
    const password = 'userPassword';
    userService.insert(
      User.createAndEncrypt({
        username,
        password,
      }),
    );

    expect(() => authService.signIn(username, 'wrong-password')).toThrow(
      new UnauthorizedException('Username and/or password incorrect'),
    );
  });

  it('Should create new tokens for valid refresh token', () => {
    const token = jwtService.createToken(
      { sub: { id: 'abc', username: 'username' } },
      '2h',
    );
    const newTokens = authService.refresh(token);

    expect(newTokens.get('access')).not.toBeNull();
    expect(newTokens.get('refresh')).not.toBeNull();
  });

  it('Should not create new tokens for invalid refresh token', () => {
    expect(() => authService.refresh('invalid-token')).toThrow(
      new InvalidTokenError(),
    );
  });
});
