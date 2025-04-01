import { LogLevel } from '../enums/log-level';
import { CommandHandler } from './command-handler';
import { EsriMap } from './esri-map';
import { EventHandler } from './event-handler';
import { Extensions } from './extensions';
import { Logger } from './logger';

export class AmandaApp {
  commands: CommandHandler;
  configOptions: unknown;
  events: EventHandler;
  map!: EsriMap;
  trace: Logger;

  constructor() {
    this.configOptions = {};
    this.trace = new Logger(this);
    this.commands = new CommandHandler(this);
    this.events = new EventHandler(this);
  }

  initialize(map: esri.Map, options = {}) {
    Extensions.checkExtensionMethods();
    this.trace.initialize(options);
    this.trace.log(
      `Initializing version ${amanda.version} of the AMANDA GIS Widget`,
      LogLevel.debug
    );
    this.commands.initialize(options);
    this.events.initialize(options);
    this.commands.registerMessageHandler();

    if (this.commands.messageHandlerRegistered) {
      this.trace.log('Command handler registered', LogLevel.debug);
    } else {
      this.trace.log(
        'Unable to attach command handler to window',
        LogLevel.error
      );
    }

    this.map = new EsriMap(this, map, options);
    this.map.getMapCommandImplementation().registerCommands();
    this.trace.log('Using an Esri Map', LogLevel.debug);

    this.configOptions = options;
  }
}
