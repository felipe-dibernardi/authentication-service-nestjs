import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as process from 'process';
import config from './config/config';
import auth from './config/auth';
import { UserModule } from './module/user.module';
import { AuthModule } from './module/auth.module';
import { LoggerModule } from './module/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV !== 'test'
          ? process.env.NODE_ENV !== 'dev'
            ? ['production-repo/.env']
            : ['.env']
          : ['test/.env'],
      isGlobal: true,
      load: [config, auth],
    }),
    AuthModule,
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
