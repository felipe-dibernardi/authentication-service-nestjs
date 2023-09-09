import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

export abstract class AuthBaseGuard implements CanActivate {
  protected constructor(protected readonly configService: ConfigService) {}
  abstract canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean>;

  protected isAuthEnabled(authenticationConfigKey: string): boolean {
    return this.configService.get<boolean>(authenticationConfigKey);
  }
}
