import { LogLevel } from '../enums/log-level';
import { AmandaApp } from './amanda-app';
import { Command } from './command';
import { Payload } from './payload';

export class CommandHandler {
  /**
   * Map object of commands held in this registry.
   */
  public namedCommands: { [key: string]: Command } = {};

  public app: AmandaApp;
  public messageHandlerRegistered = false;
  public initialized = false;

  /**
   * Constructs a new {@link CommandHandler} object.
   * @param app The application.
   */
  constructor(app: AmandaApp) {
    this.app = app;
  }

  /**
   * Initializes the object
   */
  public initialize(): void {
    this.initialized = true;
  }

  /**
   * Registers the message handler.
   */
  public registerMessageHandler(): void {
    if (window.addEventListener) {
      window.addEventListener(
        'message',
        event => this._handleAMANDACommand(event),
        false
      );
      this.app.trace.log(
        'FF,SA,CH,OP,IE9+ message handler registered',
        LogLevel.debug
      );
      this.messageHandlerRegistered = true;
    } else {
      this.messageHandlerRegistered = false;
      this.app.trace.log(
        'Failed to register message handler, app cannot function',
        LogLevel.error
      );
    }
  }

  /**
   * Creates and registers a command with the command framework.
   * @param commandName The name of the command. Must be unique or commands will be overwritten.
   * @param scope The scope of 'this' when the command is executed.
   * @param func The implementation of the command.
   */
  public registerCommand(
    commandName: string,
    scope: any,
    func: ((payload: Payload) => void) | (() => void)
  ): void {
    if (!commandName || !scope || !func) {
      this.app.trace.log(
        "'commandName', 'scope' and 'func' are required for creating commands",
        LogLevel.error
      );
      return;
    }

    commandName = commandName.toLowerCase();
    if (this._commandExists(commandName)) {
      this.app.trace.log(
        `Overwriting the command '${commandName}'`,
        LogLevel.warning
      );
    }

    const command = new Command(this.app, commandName, scope, func);
    this.namedCommands[commandName] = command;
    this.app.trace.log(
      `Command '${commandName}' added to the registry`,
      LogLevel.debug
    );
  }

  /**
   * Unregisters a command from the command framework.
   * @param commandName The name of the command to remove.
   */
  public unregisterCommand(commandName: string): void {
    if (commandName && this._commandExists(commandName)) {
      commandName = commandName.toLowerCase();
      delete this.namedCommands[commandName];
      this.app.trace.log(
        `Unregistered command '${commandName}'`,
        LogLevel.debug
      );
    }
  }

  /**
   * Checks whether the command exists.
   * @param commandName The name of the command.
   * @returns true if the command exists, false otherwise.
   */
  private _commandExists(commandName: string): boolean {
    return !!this.namedCommands[commandName];
  }

  /**
   * Handles an incoming AMANDA command via browser event.
   * @param browserEvent The browser event.
   */
  private _handleAMANDACommand(browserEvent: any): void {
    if (!browserEvent || !browserEvent.data) {
      this.app.trace.log('Command or Command data not found', LogLevel.warning);
      return;
    }

    const commandPayload = Payload.fromJson(browserEvent.data);
    if (!commandPayload || !commandPayload.messageType) {
      this.app.trace.log(
        'Command received, but did not contain a messageType key. Cannot execute any command',
        LogLevel.error
      );
      return;
    } else {
      this.app.trace.log(
        `Command '${commandPayload.messageType}' received from AMANDA`,
        LogLevel.debug
      );
    }

    const commandName = commandPayload.messageType.toLowerCase();
    if (this.namedCommands[commandName]) {
      this.namedCommands[commandName].execute(commandPayload);
    } else {
      this.app.trace.log(
        `Command '${commandName}' not handled`,
        LogLevel.error
      );
    }
  }
}
