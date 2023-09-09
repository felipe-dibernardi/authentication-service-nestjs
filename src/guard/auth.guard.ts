import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthBaseGuard } from './auth.base.guard';
import { JwtBaseService } from '../security/jwt.base.service';
import { RequestUser } from '../controller/request.user';

@Injectable()
export class AuthGuard extends AuthBaseGuard {
  constructor(
    @Inject('JwtService')
    protected readonly jwtService: JwtBaseService,
    protected readonly configService: ConfigService,
  ) {
    super(configService);
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.isAuthEnabled('auth.enabled')) {
      return true;
    }
    const request: RequestUser = context.switchToHttp().getRequest();
    try {
      const payload = await this.jwtService.verifyToken(
        this.jwtService.extractAccessTokenFromHeader(request.headers),
      );
      request.user = payload.sub;
    } catch (err) {
      return false;
    }
    return true;
  }
}
