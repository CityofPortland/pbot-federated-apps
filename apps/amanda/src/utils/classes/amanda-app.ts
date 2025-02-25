export class AmandaApp {
  commands: any;
  configOptions: any;
  events: any;
  map: EsriMap;
  trace: any;

  constructor() {
    this.configOptions = {};
    this.trace = new amanda.diagnostics.Logger(this);
    this.commands = new amanda.commands.CommandHandler(this);
    this.events = new amanda.events.EventHandler(this);
  }

  initialize(map, options = {}) {
    amanda.utils.Extensions.checkExtensionMethods();
    this.trace.initialize(options);
    this.trace.log(
      `Initializing version ${amanda.version} of the AMANDA GIS Widget`,
      amanda.diagnostics.LogLevel.debug
    );
    this.commands.initialize(options);
    this.events.initialize(options);
    this.commands.registerMessageHandler();

    if (this.commands.messageHandlerRegistered) {
      this.trace.log(
        'Command handler registered',
        amanda.diagnostics.LogLevel.debug
      );
    } else {
      this.trace.log(
        'Unable to attach command handler to window',
        amanda.diagnostics.LogLevel.error
      );
    }

    if (map && map instanceof esri.Map) {
      this.map = new amanda.map.EsriMap(this, map, options);
      this.map.getMapCommandImplementation().registerCommands();
      this.trace.log('Using an Esri Map', amanda.diagnostics.LogLevel.debug);
    } else {
      this.trace.log(
        'The map used during initialization was not of recognized type. Currently Esri maps are supported',
        amanda.diagnostics.LogLevel.error
      );
    }

    this.configOptions = options;
  }
}
