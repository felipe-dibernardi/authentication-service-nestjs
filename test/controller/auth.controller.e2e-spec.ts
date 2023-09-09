import { INestApplication } from '@nestjs/common';
import { JwtSecretService } from '../../src/security/jwt.secret.service';
import { UserService } from '../../src/service/user.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../../src/controller/user.controller';
import { UserRepositoryProvider } from '../../src/persistence/user/user.repository.provider';
import { PasswordValidationProvider } from '../../src/strategy/password/password.validation.provider';
import { AuthController } from '../../src/controller/auth.controller';
import { AuthService } from '../../src/service/auth.service';
import * as request from 'supertest';
import { User } from '../../src/domain/user/user.domain';
import { ErrorInterceptor } from '../../src/interceptor/error.interceptor';

describe('User Controller E2E Test', () => {
  let app: INestApplication;
  let userService: UserService;
  let refreshToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UserService,
        UserRepositoryProvider,
        PasswordValidationProvider,
        JwtService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'auth.enabled') {
                return true;
              }
              if (key === 'auth.secret') {
                return 'testsecret';
              }
              return undefined;
            }),
          },
        },
        {
          provide: 'JwtService',
          useClass: JwtSecretService,
        },
        JwtSecretService,
      ],
    }).compile();
    userService = moduleFixture.get<UserService>(UserService);
    app = moduleFixture.createNestApplication();
    app.useGlobalInterceptors(new ErrorInterceptor());
    await app.init();
  });

  beforeEach(() => {
    userService.insert(
      User.createAndEncrypt({
        username: 'username',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
      }),
    );
  });

  it('POST Sign in', async () => {
    return request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        username: 'username',
        password: 'password',
      })
      .expect(200)
      .expect((res) => {
        const tokens = res.body.data;
        refreshToken = tokens.refreshToken;
        expect(tokens.accessToken).toBeTruthy();
        expect(tokens.refreshToken).toBeTruthy();
      });
  });

  it('Should get Unauthorized when trying to sign in with wrong username/password', async () => {
    return request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        username: 'wrong-username',
        password: 'password',
      })
      .expect(401)
      .expect((res) => {
        expect(res.body.message).toEqual('Username and/or password incorrect');
      });
  });

  it('POST Refresh token', async () => {
    return request(app.getHttpServer())
      .post(`/auth/refresh/${refreshToken}`)
      .expect(200)
      .expect((res) => {
        const tokens = res.body.data;
        expect(tokens.accessToken).toBeTruthy();
        expect(tokens.refreshToken).toBeTruthy();
      });
  });

  it('Should get Unauthorized when trying to get new tokens with invalid refresh token', async () => {
    return request(app.getHttpServer())
      .post(`/auth/refresh/wrong-token`)
      .expect(401)
      .expect((res) => {
        expect(res.body.message).toEqual('Invalid or missing token');
      });
  });
});
