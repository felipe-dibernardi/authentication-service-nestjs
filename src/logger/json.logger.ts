import { ConsoleLogger, Injectable, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JsonLogger extends ConsoleLogger {
  constructor(private readonly configService: ConfigService) {
    super();
    this.setLogLevels(configService.get('log.levels'));
  }

  protected formatPid(pid: number) {
    return `${pid}`;
  }

  protected colorize(message: string, logLevel: LogLevel) {
    return message;
  }

  protected formatContext(context: string): string {
    return context;
  }

  protected formatMessage(
    logLevel: LogLevel,
    message: unknown,
    pidMessage: string,
    formattedLogLevel: string,
    contextMessage: string,
  ): string {
    const output = this.stringifyMessage(message, logLevel);
    return `${JSON.stringify({
      pid: pidMessage,
      timestamp: this.getTimestamp(),
      level: logLevel,
      context: contextMessage,
      message: output,
    })}\n`;
  }
}
