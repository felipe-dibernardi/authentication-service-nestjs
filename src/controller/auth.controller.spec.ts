import { AuthController } from './auth.controller';
import { AuthService } from '../service/auth.service';
import { UserService } from '../service/user.service';
import { UserRepositoryMemory } from '../persistence/user/user.repository.memory';
import { JwtSecretService } from '../security/jwt.secret.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../domain/user/user.domain';
import { AuthenticationDTO } from './dto/authentication.dto';
import { UnauthorizedException } from '@nestjs/common';
import { InvalidTokenError } from '../security/error/invalid.token.error';

describe('Auth Controller Test', () => {
  let authController: AuthController;
  let configService: ConfigService;
  let authService: AuthService;
  let jwtService: JwtSecretService;
  let userService: UserService;
  let userRepository: UserRepositoryMemory;

  beforeAll(() => {
    configService = new ConfigService();
    userRepository = new UserRepositoryMemory(undefined);
    userService = new UserService(userRepository);
    jwtService = new JwtSecretService(new JwtService(), configService);
    authService = new AuthService(userService, jwtService);
    authController = new AuthController(authService);
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      if (key === 'auth.enabled') {
        return true;
      }
      if (key === 'auth.secret') {
        return 'testsecret';
      }
    });
  });

  it('Should sign in correctly when an user was found', () => {
    const username = 'userAuthenticating';
    const password = 'userPassword';
    jest
      .spyOn(userRepository, 'getByUsername')
      .mockReturnValue(User.createAndEncrypt({ username, password }));

    const authDTO = new AuthenticationDTO('userAuthenticating', 'userPassword');

    const authResponse = authController.signIn(authDTO);

    expect(authResponse).not.toBeNull();
    expect(authResponse.statusCode).toEqual(200);
    expect(authResponse.message).toBeUndefined();
    expect(authResponse.data.accessToken).not.toBeNull();
    expect(authResponse.data.refreshToken).not.toBeNull();
  });

  it('Should throw error when wrong password is sent', () => {
    const username = 'userAuthenticating';
    const password = 'userPassword';
    jest
      .spyOn(userRepository, 'getByUsername')
      .mockReturnValue(User.createAndEncrypt({ username, password }));

    const authDTO = new AuthenticationDTO(
      'userAuthenticating',
      'wrong-password',
    );

    expect(() => authController.signIn(authDTO)).toThrow(
      new UnauthorizedException('Username and/or password incorrect'),
    );
  });

  it('Should create new tokens when the refresh token is valid', () => {
    const token = jwtService.createToken(
      {
        sub: { id: 'abc', username: 'abc ' },
      },
      '2h',
    );

    const authResponse = authController.refreshTokens(token);

    expect(authResponse).not.toBeNull();
    expect(authResponse.statusCode).toEqual(200);
    expect(authResponse.message).toBeUndefined();
    expect(authResponse.data.accessToken).not.toBeNull();
    expect(authResponse.data.refreshToken).not.toBeNull();
  });

  it('Should throw an error when token is invalid while trying to refresh', () => {
    expect(() => authController.refreshTokens('abc')).toThrow(
      new InvalidTokenError(),
    );
  });
});
