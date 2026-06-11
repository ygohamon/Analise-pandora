import { resolve } from 'path';

import * as winston from 'winston';
import { LoggerOptions, transports, format } from 'winston';

const defaultLabel = 'CRAWLER';

export class Logger {
  public static get(label: string = null): winston.Logger {
    if (!label) {
      label = defaultLabel;
    }

    if (!winston.loggers.has(label)) {
      winston.loggers.add(label, Logger.createLoggerOptions(label));
    }

    return winston.loggers.get(label);
  }

  private static createLoggerOptions(label): LoggerOptions {
    return {
      transports: [Logger.consoleTransport, Logger.fileTransport],
      format: format.label({ label }),
      exitOnError: false,
    };
  }

  private static template(info: { level: string; message: string; [key: string]: any }): string {
    const { timestamp, level, label, message, error, ...rest } = info;

    let log = `${info.timestamp} - [${info.level}] - [${info.label}]: ${info.message}`;

    // Se houver um erro no objeto mostra o stack
    if (error?.stack) {
      log = `${log}\n${error.stack}`;
    }

    if (!( Object.keys(rest).length === 0 && rest.constructor === Object)) {
      log = `${log}\n${JSON.stringify(rest, null, 2)}`;
    }

    return log;
  }

  private static readonly consoleTransport = new transports.Console({
    level: process.env.SERVER_LOG_CONSOLE_LEVEL || 'info',
    format: format.combine(
      format.timestamp(),
      format.colorize(),
      format.printf(Logger.template)
    ),
  });

  private static readonly fileTransport = new transports.File({
    level: process.env.SERVER_LOG_FILE_LEVEL || 'debug',
    format: format.combine(
      format.timestamp(),
      format.printf(Logger.template)
    ),
    filename: resolve('./server.log'),
    handleExceptions: true,
    maxsize: 5242880,
    maxFiles: 5,
  });
}

export let logger = Logger.get();

/**
 * Classe criada para realizar o log das rotas utilizando o Morgan
 */
class MorganStream {
  write(text: string) {
    logger.info(text.trim());
  }
}

export let morganStream = new MorganStream();
