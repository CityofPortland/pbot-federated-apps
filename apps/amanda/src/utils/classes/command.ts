import { LogLevel } from '../enums/log-level';
import { AmandaApp } from './amanda-app';
import { Payload } from './payload';

export class Command {
  app: AmandaApp;
  name: string;
  scope: any;
  func: any;

  constructor(app: AmandaApp, name: string, scope, func) {
    this.app = app;
    this.name = name;
    this.scope = scope;
    this.func = func;
  }

  execute(payload: Payload) {
    this.app.trace.log(`Executing command '${this.name}'`, LogLevel.debug);
    this.func.call(this.scope, payload);
  }
}
