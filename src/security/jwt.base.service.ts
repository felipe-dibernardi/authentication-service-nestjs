import { UnauthorizedException } from '@nestjs/common';
import { JwtPayloadType } from './types/jwt.payload.type';

interface SubInfo {
  id: string;
  username: string;
}
export interface Payload {
  sub: SubInfo;
}

export abstract class JwtBaseService {
  abstract verifyToken(token: string): JwtPayloadType;

  abstract decodeToken(token: string): JwtPayloadType;

  abstract createToken(payload: Payload, expiresIn: string): string;

  public extractAccessTokenFromHeader(headers): string | undefined {
    if (!headers) {
      throw new UnauthorizedException('No header present');
    }
    const [type, token] = headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer') {
      return token;
    }
    throw new UnauthorizedException('Authorization header/token not present');
  }
}
