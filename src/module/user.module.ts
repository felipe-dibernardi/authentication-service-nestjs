import { Module } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { UserController } from '../controller/user.controller';
import { UserRepositoryProvider } from '../persistence/user/user.repository.provider';
import { PasswordValidationProvider } from '../strategy/password/password.validation.provider';
import { JwtSecretModule } from './jwt.secret.module';
import { JwtSecretService } from '../security/jwt.secret.service';

@Module({
  imports: [JwtSecretModule],
  exports: [UserService],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepositoryProvider,
    PasswordValidationProvider,
    {
      provide: 'JwtService',
      useClass: JwtSecretService,
    },
  ],
})
export class UserModule {}
