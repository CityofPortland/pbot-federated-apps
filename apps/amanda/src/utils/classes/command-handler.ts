export class CommandHandler {
  /**
   * Map object of commands held in this registry.
   */
  public namedCommands: { [key: string]: any } = {};

  public app: any;
  public messageHandlerRegistered = false;
  public initialized = false;

  /**
   * Constructs a new {@link CommandHandler} object.
   * @param app The application.
   */
  constructor(app: any) {
    this.app = app;
  }

  /**
   * Initializes the object from an {@link InitializationOptions}.
   * @param options The {@link InitializationOptions}.
   */
  public initialize(options: any): void {
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
        amanda.diagnostics.LogLevel.debug
      );
      this.messageHandlerRegistered = true;
    } else if (window.attachEvent) {
      window.attachEvent('onmessage', event =>
        this._handleAMANDACommand(event)
      );
      this.app.trace.log(
        'IE8 message handler registered',
        amanda.diagnostics.LogLevel.debug
      );
      this.messageHandlerRegistered = true;
    } else {
      this.messageHandlerRegistered = false;
      this.app.trace.log(
        'Failed to register message handler, app cannot function',
        amanda.diagnostics.LogLevel.error
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
    func: Function
  ): void {
    if (!commandName || !scope || !func) {
      this.app.trace.log(
        "'commandName', 'scope' and 'func' are required for creating commands",
        amanda.diagnostics.LogLevel.error
      );
      return;
    }

    commandName = commandName.toLowerCase();
    if (this._commandExists(commandName)) {
      this.app.trace.log(
        `Overwriting the command '${commandName}'`,
        amanda.diagnostics.LogLevel.warning
      );
    }

    const command = new commands.Command(this.app, commandName, scope, func);
    this.namedCommands[commandName] = command;
    this.app.trace.log(
      `Command '${commandName}' added to the registry`,
      amanda.diagnostics.LogLevel.debug
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
        amanda.diagnostics.LogLevel.debug
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
      this.app.trace.log(
        'Command or Command data not found',
        amanda.diagnostics.LogLevel.warning
      );
      return;
    }

    const commandPayload = commands.Payload.fromJson(browserEvent.data);
    if (!commandPayload || !commandPayload.messageType) {
      this.app.trace.log(
        'Command received, but did not contain a messageType key. Cannot execute any command',
        amanda.diagnostics.LogLevel.error
      );
      return;
    } else {
      this.app.trace.log(
        `Command '${commandPayload.messageType}' received from AMANDA`,
        amanda.diagnostics.LogLevel.debug
      );
    }

    const commandName = commandPayload.messageType.toLowerCase();
    if (this.namedCommands[commandName]) {
      this.namedCommands[commandName].execute(commandPayload);
    } else {
      this.app.trace.log(
        `Command '${commandName}' not handled`,
        amanda.diagnostics.LogLevel.error
      );
    }
  }
}
