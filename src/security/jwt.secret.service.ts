import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtBaseService, Payload } from './jwt.base.service';
import { JwtPayloadType } from './types/jwt.payload.type';
import { InvalidTokenError } from './error/invalid.token.error';
import { ConfigurationMissingError } from './error/configuration.missing.error';

@Injectable()
export class JwtSecretService extends JwtBaseService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  public verifyToken(token: string): JwtPayloadType {
    try {
      return this.jwtService.verify(token, {
        secret: this.getSecretKey(),
        algorithms: ['HS256'],
      });
    } catch (err) {
      throw new InvalidTokenError();
    }
  }

  public decodeToken(token: string): JwtPayloadType {
    return this.jwtService.decode(token) as JwtPayloadType;
  }

  public createToken(payload: Payload, expiresIn: string): string {
    return this.jwtService.sign(payload, {
      secret: this.getSecretKey(),
      expiresIn,
    });
  }

  private getSecretKey(): string {
    const key = 'auth.secret';
    const secret = this.configService.get<string>(key);
    if (!secret) {
      throw new ConfigurationMissingError(key);
    }
    return secret;
  }
}
