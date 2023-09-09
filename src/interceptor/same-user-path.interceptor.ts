import {
  Injectable,
  ExecutionContext,
  CallHandler,
  NestInterceptor,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { PATH_METADATA } from '@nestjs/common/constants';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { AuthRequest } from '../controller/type/request.type';
import { JwtBaseService } from '../security/jwt.base.service';
import { JwtPayloadType } from '../security/types/jwt.payload.type';
import { MismatchedUserError } from './error/mismatched.user.error';

@Injectable()
export class SameUserPathInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    @Inject('JwtService')
    private readonly jwtService: JwtBaseService,
  ) {}

  public getContextPath(context: ExecutionContext): string[] {
    const paths = this.reflector.getAllAndMerge<string[]>(PATH_METADATA, [
      context.getClass(),
      context.getHandler(),
    ]);
    return paths.join('').split('/');
  }

  private getRequestURLUsername(
    contextPath: string[],
    requestURL: string,
  ): string {
    const contextPathUsernameIndex = contextPath.indexOf(':username');
    const requestURLParts = requestURL.split('/');
    const requestURLUsername = requestURLParts[contextPathUsernameIndex];
    if (requestURLUsername) {
      return requestURLUsername;
    }
    throw new MismatchedUserError();
  }

  private getSubFromTokenPayload(request: AuthRequest): string {
    const authHeaderToken = request.headers.authorization.split(' ')[1];
    const decodedToken: JwtPayloadType =
      this.jwtService.decodeToken(authHeaderToken);
    return decodedToken.sub.username;
  }

  private checkSameUserInPathAndToken(
    context: ExecutionContext,
    request: AuthRequest,
  ) {
    if (
      this.getRequestURLUsername(this.getContextPath(context), request.url) !==
      this.getSubFromTokenPayload(request)
    ) {
      throw new MismatchedUserError();
    }
  }

  public intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const httpContext: HttpArgumentsHost = context.switchToHttp();
    const request: AuthRequest = httpContext.getRequest();

    this.checkSameUserInPathAndToken(context, request);

    return next.handle();
  }
}
