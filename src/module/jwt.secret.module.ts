import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtSecretService } from '../security/jwt.secret.service';
import { AuthGuard } from '../guard/auth.guard';

@Module({
  imports: [JwtModule.register({})],
  exports: [AuthGuard, JwtSecretService, JwtService],
  controllers: [],
  providers: [
    AuthGuard,
    JwtSecretService,
    JwtService,
    {
      provide: 'JwtService',
      useClass: JwtSecretService,
    },
  ],
})
export class JwtSecretModule {}
