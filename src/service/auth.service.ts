import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtBaseService } from '../security/jwt.base.service';
import { HashUtils } from '../utils/hash.utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    @Inject('JwtService')
    private readonly jwtService: JwtBaseService,
  ) {}

  public signIn(username: string, password: string): Map<string, string> {
    let user;
    try {
      user = this.userService.getByUsername(username);
    } catch (err) {
      throw new UnauthorizedException('Username and/or password incorrect');
    }

    if (HashUtils.compare(password, user.password)) {
      return this.createTokens(user.id, user.username);
    }
    throw new UnauthorizedException('Username and/or password incorrect');
  }

  public refresh(token: string): Map<string, string> {
    const payload = this.jwtService.verifyToken(token);
    return this.createTokens(payload.sub.id, payload.sub.username);
  }

  private createTokens(id: string, username: string): Map<string, string> {
    const tokensMap = new Map<string, string>();
    tokensMap.set(
      'access',
      this.jwtService.createToken({ sub: { id, username } }, '2h'),
    );
    tokensMap.set(
      'refresh',
      this.jwtService.createToken({ sub: { id, username } }, '7d'),
    );
    return tokensMap;
  }
}
