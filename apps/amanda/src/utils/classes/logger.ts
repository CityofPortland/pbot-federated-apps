import { LogLevel } from '../enums/log-level';
import { AmandaApp } from './amanda-app';

export class Logger {
  private logLevelMap: { level: any; order: number }[];
  private _logStart: string;
  private _logLevel: any;
  public initialized: boolean;
  private app: AmandaApp;

  /**
   * Constructs a new instance of {@link Logger}.
   * @param app The {@link AmandaApp} which this component is linked to.
   */
  constructor(app: AmandaApp) {
    this.logLevelMap = [
      { level: LogLevel.debug, order: 1 },
      { level: LogLevel.warning, order: 2 },
      { level: LogLevel.error, order: 3 },
    ];
    this._logStart = 'AMANDA GIS Widgets';
    this._logLevel = LogLevel.warning;
    this.initialized = false;
    this.app = app;
  }

  getDate(): string {
    const date = new Date();
    return `${this._padDigits(date.getHours(), 2)}:${this._padDigits(
      date.getMinutes(),
      2
    )}:${this._padDigits(date.getSeconds(), 2)}.${this._padDigits(
      date.getMilliseconds(),
      3
    )}`;
  }

  /**
   * Logs a simple string message with a log level.
   * Will only log if the specified {@link LogLevel} is the same or greater than what is specified on the {@link AmandaApp}.
   * @param message The message to publish.
   * @param messageLogLevel The {@link LogLevel} of the message.
   */
  log(message: string, messageLogLevel: LogLevel) {
    if (
      this._getLogLevel(messageLogLevel) >= this._getLogLevel(this._logLevel)
    ) {
      if (messageLogLevel) {
        this._writeLog(
          `${this._logStart} ${this.getDate()}: [${messageLogLevel}] ${message}`
        );
      } else {
        this._writeLog(this._logStart + Date() + ': ' + message);
        this._writeLog(`${this._logStart} ${this.getDate()}: ${message})`);
      }
    }
  }

  /**
   * Logs a message with an {@link Error} object.
   * Will log under {@link LogLevel} error level.
   * @param message The message to publish.
   * @param error The {@link Error}.
   */
  logError(message: string, error: Error) {
    this._writeLog(
      `${this._logStart} ${this.getDate()}: [${
        LogLevel.error
      }] ${message} Reason: ${error ? error.message : 'No details available'}`
    );
  }

  private _writeLog(message: string) {
    console.log(message);
  }

  private _getLogLevel(level: LogLevel): number | undefined {
    for (let i = 0; i < this.logLevelMap.length; i++) {
      if (level === this.logLevelMap[i].level) {
        return this.logLevelMap[i].order;
      }
    }
  }

  private _padDigits(num: number, totalDigits: number, left = true): string {
    const numString = num.toString();
    let padding = '';
    if (totalDigits > numString.length) {
      for (let i = 0; i < totalDigits - numString.length; i++) {
        padding += '0';
      }
    }
    return left ? padding + numString : numString + padding;
  }

  /**
   * Initializes the object from an {@link InitializationOptions}.
   * @param options The {@link InitializationOptions}.
   */
  initialize(options: any) {
    if (options && !!options['logLevel']) {
      const level = options.logLevel;
      if (
        level === LogLevel.debug ||
        level === LogLevel.warning ||
        level === LogLevel.error
      ) {
        this._logLevel = level;
        this.log(
          `Log level set to ${LogLevel.debug} from configuration`,
          LogLevel.debug
        );
      } else {
        this.log(
          `Specified log level of ${level} was not recognized. Values must be ${LogLevel.debug}, ${LogLevel.warning} or ${LogLevel.error}`,
          LogLevel.warning
        );
      }
    }
  }
}
