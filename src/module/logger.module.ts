import { Module } from '@nestjs/common';
import { JsonLogger } from '../logger/json.logger';
import { BaseLogger } from '../logger/base.logger';

@Module({
  providers: [JsonLogger, BaseLogger],
  exports: [JsonLogger, BaseLogger],
})
export class LoggerModule {}
