import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { UserController } from '../../src/controller/user.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../src/service/user.service';
import { UserRepositoryProvider } from '../../src/persistence/user/user.repository.provider';
import { ConfigService } from '@nestjs/config';
import { JwtSecretService } from '../../src/security/jwt.secret.service';
import { PasswordValidationProvider } from '../../src/strategy/password/password.validation.provider';
import { JwtService } from '@nestjs/jwt';
import { HashUtils } from '../../src/utils/hash.utils';
import { JwtBaseService } from '../../src/security/jwt.base.service';
import { ErrorInterceptor } from '../../src/interceptor/error.interceptor';

describe('User Controller E2E Test', () => {
  let app: INestApplication;
  let jwtService: JwtSecretService;
  let userService: UserService;
  const baseUrl = '/users';
  let token = '';
  let userId = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
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
    jwtService = moduleFixture.get<JwtSecretService>(JwtSecretService);
    app = moduleFixture.createNestApplication();
    app.useGlobalInterceptors(new ErrorInterceptor());
    await app.init();
  });

  beforeEach(() => {
    token = jwtService.createToken(
      { sub: { id: 'abc', username: 'username' } },
      '2h',
    );
  });

  it('POST new User', async () => {
    return request(app.getHttpServer())
      .post(`${baseUrl}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: 'username',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
      })
      .expect(201);
  });

  it('GET User', async () => {
    return request(app.getHttpServer())
      .get(`${baseUrl}/username`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        const user = res.body.data;
        const comparisonUser = userService.getByUsername('username');
        expect(user._id).toEqual(comparisonUser.id);
        expect(user._firstName).toEqual(comparisonUser.firstName);
        expect(user._lastName).toEqual(comparisonUser.lastName);
        userId = user._id;
      });
  });

  it('PUT to update user updatable attributes', () => {
    return request(app.getHttpServer())
      .put(`${baseUrl}/username`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        id: userId,
        username: 'username',
        firstName: 'Jane',
        lastName: 'Smith',
      })
      .expect(200)
      .expect((res) => {
        const user = userService.getByUsername('username');
        expect(user.id).toEqual(userId);
        expect(user.username).toEqual('username');
        expect(user.firstName).toEqual('Jane');
        expect(user.lastName).toEqual('Smith');
      });
  });

  it('Should return Forbidden when there is no authorization header', async () => {
    return request(app.getHttpServer())
      .put(`${baseUrl}/username`)
      .send({
        id: userId,
        username: 'username',
        firstName: 'Jane',
        lastName: 'Smith',
      })
      .expect(403)
      .expect((res) => {
        expect(res.body.message).toEqual('Forbidden resource');
      });
  });

  it('PATCH to change password', async () => {
    return request(app.getHttpServer())
      .patch(`${baseUrl}/username/changePassword`)
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'password', newPassword: 'New@password1' })
      .expect(200)
      .expect((res) => {
        const user = userService.getByUsername('username');
        expect(HashUtils.compare('New@password1', user.password)).toBeTruthy();
      });
  });
});
