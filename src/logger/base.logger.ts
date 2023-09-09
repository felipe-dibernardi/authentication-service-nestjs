import { ConsoleLogger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BaseLogger extends ConsoleLogger {
  constructor(private readonly configService: ConfigService) {
    super();
    this.setLogLevels(configService.get('log.levels'));
  }
}
