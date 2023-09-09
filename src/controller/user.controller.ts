import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { AuthGuard } from '../guard/auth.guard';
import { UserDTO } from './dto/user.dto';
import { ApiResponse } from './api.response';
import { UserDTOConverter } from './converter/user.dto.converter';
import { ChangePasswordDTO } from './dto/changepassword.dto';
import { CreateUserDTO } from './dto/create-user.dto';
import { SameUserPathInterceptor } from '../interceptor/same-user-path.interceptor';
import { RequestLoggerInterceptor } from '../interceptor/request.logger.interceptor';

@Controller('/users')
@UseInterceptors(RequestLoggerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/:username')
  @UseGuards(AuthGuard)
  @UseInterceptors(SameUserPathInterceptor)
  @HttpCode(200)
  public getUser(@Param('username') username: string): ApiResponse<UserDTO> {
    return {
      statusCode: 200,
      data: UserDTOConverter.convertDomainTODTO(
        this.userService.getByUsername(username),
      ),
    };
  }

  @Post()
  @HttpCode(201)
  public insertUser(@Body() userDTO: CreateUserDTO): ApiResponse<void> {
    this.userService.insert(UserDTOConverter.convertCreateDTOToDomain(userDTO));
    return {
      statusCode: 201,
      message: 'User successfully added',
    };
  }

  @Put('/:username')
  @UseGuards(AuthGuard)
  @UseInterceptors(SameUserPathInterceptor)
  @HttpCode(200)
  public updateUser(
    @Param('username') username: string,
    @Body() userDTO: UserDTO,
  ): ApiResponse<void> {
    this.userService.update(UserDTOConverter.convertDTOToDomain(userDTO));
    return {
      statusCode: 200,
      message: 'User successfully updated',
    };
  }

  @Patch('/:username/changePassword')
  @UseGuards(AuthGuard)
  @UseInterceptors(SameUserPathInterceptor)
  @HttpCode(200)
  public changePassword(
    @Param('username') username: string,
    @Body() changePasswordDTO: ChangePasswordDTO,
  ): ApiResponse<void> {
    this.userService.changePassword(
      username,
      changePasswordDTO.currentPassword,
      changePasswordDTO.newPassword,
    );
    return {
      statusCode: 200,
      message: 'Password successfully updated',
    };
  }
}
