import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { AuthenticationDTO } from './dto/authentication.dto';
import { AccessTokenDTO } from './dto/accesstoken.dto';
import { ApiResponse } from './api.response';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signin')
  @HttpCode(200)
  public signIn(
    @Body() authDTO: AuthenticationDTO,
  ): ApiResponse<AccessTokenDTO> {
    const tokens: Map<string, string> = this.authService.signIn(
      authDTO.username,
      authDTO.password,
    );

    return {
      statusCode: 200,
      data: new AccessTokenDTO(tokens.get('access'), tokens.get('refresh')),
    };
  }

  @Post('/refresh/:token')
  @HttpCode(200)
  public refreshTokens(
    @Param('token') token: string,
  ): ApiResponse<AccessTokenDTO> {
    const tokens: Map<string, string> = this.authService.refresh(token);

    return {
      statusCode: 200,
      data: new AccessTokenDTO(tokens.get('access'), tokens.get('refresh')),
    };
  }
}
