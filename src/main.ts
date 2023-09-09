import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ErrorInterceptor } from './interceptor/error.interceptor';
import { JsonLogger } from './logger/json.logger';
import { ConfigService } from '@nestjs/config';
import { BaseLogger } from './logger/base.logger';

function appendLogger(app, logType) {
  switch (logType) {
    case 'json':
      app.useLogger(app.get(JsonLogger));
      break;
    case 'base':
    default:
      app.useLogger(app.get(BaseLogger));
      break;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  app.useGlobalInterceptors(new ErrorInterceptor());
  appendLogger(app, configService.get('log.type'));
  await app.listen(8080);
}
bootstrap();
