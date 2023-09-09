import { Module } from '@nestjs/common';
import { AuthController } from '../controller/auth.controller';
import { AuthService } from '../service/auth.service';
import { UserModule } from './user.module';
import { JwtSecretService } from '../security/jwt.secret.service';
import { JwtSecretModule } from './jwt.secret.module';

@Module({
  imports: [UserModule, JwtSecretModule],
  exports: [],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: 'JwtService',
      useClass: JwtSecretService,
    },
  ],
})
export class AuthModule {}
