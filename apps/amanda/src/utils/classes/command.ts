export class Command {
  constructor(app, name, scope, func) {
    this.app = app;
    this.name = name;
    this.scope = scope;
    this.func = func;
  }

  execute(payload) {
    this.app.trace.log(
      `Executing command '${this.name}'`,
      amanda.diagnostics.LogLevel.debug
    );
    this.func.call(this.scope, payload);
  }
}
