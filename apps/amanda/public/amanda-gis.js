var amanda;
(function (amanda) {
  /**
   * The application is the center of the AMANDA GIS Widget and contains links to all
   * of the application components such as map and command and event handlers.
   */
  var AmandaApp = (function () {
    /**
     * Constructs a new {@link AmandaApp} object.
     */
    function AmandaApp() {
      /**
       * The {@link InitializationOptions} which were loaded.
       */
      this.configOptions = {};
      this.trace = new amanda.diagnostics.Logger(this);
      this.commands = new amanda.commands.CommandHandler(this);
      this.events = new amanda.events.EventHandler(this);
    }
    /**
     * Initializes the {@link AmandaApp} with an Esri map.
     * @param map An Ersi Map.
     * @param options Optional options object.
     */
    AmandaApp.prototype.initialize = function (map, options) {
      if (options === void 0) {
        options = {};
      }
      // check extension methods
      amanda.utils.Extensions.checkExtensionMethods();
      this.trace.initialize(options);
      this.trace.log(
        'Initializing version {0} of the AMANDA GIS Widget'.format(
          amanda.version
        ),
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
      // check the map which AMANDA Widgets was initialized with.
      // currently only supports Ersi.Map type, but can support expansion to Google/Leaflet/Others perhaps.
      if (map && map instanceof esri.Map) {
        // implement an IMap
        this.map = new amanda.map.EsriMap(this, map, options);
        // get the Command Implementation from the map.
        this.map.getMapCommandImplementation().registerCommands();
        this.trace.log('Using an Esri Map', amanda.diagnostics.LogLevel.debug);
      } else {
        // map not recognized
        this.trace.log(
          'The map used during initialization was not of recognized type. Currently Esri maps are supported',
          amanda.diagnostics.LogLevel.error
        );
      }
      // save the config options
      this.configOptions = options;
    };
    return AmandaApp;
  })();
  amanda.AmandaApp = AmandaApp;
})(amanda || (amanda = {}));
var amanda;
(function (amanda) {
  var commands;
  (function (commands) {
    /**
     * An object which represents a named executable {@link Command}.
     */
    var Command = (function () {
      /**
       * Constructs a new {@link Command}.
       * @param app The app.
       * @param name The name of the command.
       * @param scope The scope which will be executed when the command is run.
       * @param func The implementation of the command.
       */
      function Command(app, name, scope, func) {
        this.app = app;
        this.name = name;
        this.scope = scope;
        this.func = func;
      }
      /**
       * Executes the command.
       * @param parameters the parameters which will be passing into the command as arguments.
       */
      Command.prototype.execute = function (payload) {
        this.app.trace.log(
          "Executing command '{0}'".format(this.name),
          amanda.diagnostics.LogLevel.debug
        );
        this.func.call(this.scope, payload);
      };
      return Command;
    })();
    commands.Command = Command;
  })((commands = amanda.commands || (amanda.commands = {})));
})(amanda || (amanda = {}));
var amanda;
(function (amanda) {
  var commands;
  (function (commands) {
    /**
     * Command implementation for a {@link esri.Map}.
     */
    var EsriCommandImpl = (function () {
      /**
       * Constructs a new {@link EsriCommandImpl} object.
       * @param app The appication.
       */
      function EsriCommandImpl(app) {
        this.app = app;
      }
      /**
       * Registers the commands to the {@link CommandHandler}.
       */
      EsriCommandImpl.prototype.registerCommands = function () {
        this.app.commands.registerCommand(
          commands.CommandType.select,
          this,
          this.select
        );
        this.app.commands.registerCommand(
          commands.CommandType.activate,
          this,
          this.activate
        );
        this.app.commands.registerCommand(
          commands.CommandType.bufferSearch,
          this,
          this.bufferSearch
        );
        this.app.commands.registerCommand(
          commands.CommandType.deactivate,
          this,
          this.deactivate
        );
        this.app.commands.registerCommand(
          commands.CommandType.deselect,
          this,
          this.deselect
        );
        this.app.commands.registerCommand(
          commands.CommandType.highlight,
          this,
          this.highlight
        );
        this.app.commands.registerCommand(
          commands.CommandType.setLayerVisibility,
          this,
          this.setLayerVisibility
        );
        this.app.commands.registerCommand(
          commands.CommandType.setMapMode,
          this,
          this.setMapMode
        );
        this.app.commands.registerCommand(
          commands.CommandType.unhighlight,
          this,
          this.unhighlight
        );
        this.app.commands.registerCommand(
          commands.CommandType.setScale,
          this,
          this.setScale
        );
      };
      /**
       * Changes the scale of the map to provided input.
       * {@link Payload} required command parameters:
       * - `messageType`: The {@link CommandType} for setScal.
       * - `scale` : The scale to set.
       * @params payload The commands {@link Payload}.
       */
      EsriCommandImpl.prototype.setScale = function (payload) {
        var scale = payload.scale;
        if (!scale) {
          this.app.trace.log(
            'Invalid payload for the scale command: Missing a valid scale..',
            amanda.diagnostics.LogLevel.error
          );
          return;
        }
        var map = this.app.map.getGISMap();
        map.setScale(scale);
      };
      /**
       * Perform a select operation on Current Map Extent using whereClause with higher precedence over the feature valures on the configured field name.
       * Event: Fires an event when the results are found.
       * {@link Payload} required command parameters:
       * - `messageType`: The {@link CommandType} for select.
       * - `layerName`: The layer name to retrieve the features from.
       * - `fieldName`: The field which the IDs will be queries against.
       * - `where`: The where clause to query.
       * - `features`: The ID or IDs.
       * @params payload The commands {@link Payload}.
       */
      EsriCommandImpl.prototype.select = async function (payload) {
        var _this = this;
        var layerName = payload.layerName;
        var fieldName = payload.fieldName;
        var filterByCurrentMapExtent = payload.filterByCurrentMapExtent;
        if (!payload || !layerName || !fieldName) {
          this.app.trace.log(
            'Invalid payload for the select command. Missing layerName and/or fieldName.',
            amanda.diagnostics.LogLevel.error
          );
          return;
        }
        var layer = await this.app.map.getLayerByName(layerName);
        if (!layer) {
          this.app.trace.log(
            'Can not find a layer for {0}.'.format(layerName),
            amanda.diagnostics.LogLevel.error
          );
          return;
        }
        if (layer) {
          var whereClause = '';
          var whereCustom = payload.where;
          var whereAuto = null;
          if (
            payload &&
            payload.fieldName &&
            payload.features &&
            payload.features.length > 0
          ) {
            whereAuto = amanda.utils.QueryHelper.generateWhereClause(
              payload.fieldName,
              payload.features,
              amanda.utils.QueryHelper.isFieldStringType(layer, fieldName)
            );
          }
          var selectQuery = new amanda.map.Query(layer.getUrl());
          selectQuery.queryParams.outFields.push('*');
          selectQuery.queryParams.outSpatialReference =
            this.app.map.getGISMap().spatialReference;
          if (filterByCurrentMapExtent) {
            selectQuery.queryParams.geometry = this.app.map.getGISMap().extent;
          }
          // Use the precedence to prefer 'whereCustom' over 'whereAuto'.
          if (whereCustom) {
            whereClause = whereCustom;
          } else if (whereAuto) {
            whereClause = whereAuto;
          }
          selectQuery.queryParams.where = whereClause;
          selectQuery
            .perform()
            .then(function (results) {
              var features = [];
              if (results && results.features) {
                results.features.forEach(function (graphic) {
                  var id = _this._getPropertyByName(
                    graphic.attributes,
                    fieldName
                  );
                  if (id) {
                    features.push(id);
                  }
                });
                _this.app.events.featuresSelected(
                  layerName,
                  features,
                  results.exceededTransferLimit
                );
                _this._selectFeatures(layerName, fieldName, results.features);
              } else {
                _this.app.trace.log(
                  'Select query returned no features',
                  amanda.diagnostics.LogLevel.warning
                );
              }
            })
            .catch(function (error) {
              _this.app.trace.logError('Select query failed', error);
            });
        }
      };
      /**
       * Perform a deselect operation. Clears all pushpins from the map.
       * {@link Payload} required command parameters:
       * - `messageType`: The {@link CommandType} for deselect.
       * @params payload The commands {@link Payload}.
       */
      EsriCommandImpl.prototype.deselect = function () {
        this.app.map.clearPushpins();
      };
      /**
       * Perform a unhighlight operation. Clears all highlighted pushpins from the map.
       * {@link Payload} required command parameters:
       * - `messageType`: The {@link CommandType} for unhighlight.
       * @params payload The commands {@link Payload}.
       */
      EsriCommandImpl.prototype.unhighlight = function () {
        this.app.map.clearHighlights();
      };
      /**
       * Perform a deactivate operation. Removes the infowindow from the map.
       * {@link Payload} required command parameters:
       * - `messageType`: The {@link CommandType} for deactivate.
       * @params payload The commands {@link Payload}.
       */
      EsriCommandImpl.prototype.deactivate = function () {
        var infoWindow = this.app.map.getGISMap().infoWindow;
        infoWindow.hide();
      };
      /**
       * Changes the current map mode which either allows geometry selection or returns the map to the default state.
       * Event: Fires an event when the results are found.
       * {@link Payload} required command parameters:
       * - `messageType`: The {@link CommandType} for set map mode.
       * - `layerName`: The layer name to retrieve the features from.
       * - `fieldName`: The field which the found features IDs will be returned from.
       * - `selectionType`: The {@link map.SelectionType}.
       * - {@link Payload} optional command parameters:
       * - `distance`: The number of units to buffer the input shape by.
       * - `bufferUnit`: The unit to buffer by.
       * @params payload The commands {@link Payload}.
       */
      EsriCommandImpl.prototype.setMapMode = async function (payload) {
        var _this = this;
        var layerName = payload.layerName;
        var selectionType = payload.mapMode;
        var layer = await this.app.map.getLayerByName(payload.layerName);
        var fieldName = payload.fieldName;
        if (
          selectionType.toUpperCase() === amanda.map.SelectionType.defaultSelect
        ) {
          this.app.map.clearMapMode();
        }
        if (layer && fieldName && selectionType) {
          // geometry selected callback
          var geometrySelected = function (geometry) {
            var selectQuery = new amanda.map.Query(layer.getUrl());
            selectQuery.queryParams.geometry = geometry;
            selectQuery.queryParams.outFields.push('*');
            selectQuery.queryParams.outSpatialReference =
              _this.app.map.getGISMap().spatialReference;
            selectQuery
              .perform()
              .then(function (results) {
                var ids = [];
                var attributes = [];
                if (results && results.features) {
                  results.features.forEach(function (feature) {
                    var id = _this._getPropertyByName(
                      feature.attributes,
                      fieldName
                    );
                    if (id) {
                      ids.push(id);
                    }
                    if (feature.attributes) {
                      attributes.push(feature.attributes);
                    }
                  });
                  if (results.exceededTransferLimit) {
                    _this.app.trace.log(
                      'Select by geometry returned the first {0} results. Server limit exceeded.',
                      amanda.diagnostics.LogLevel.warning
                    );
                  }
                  _this.app.events.featuresSelectedByGeometry(
                    layerName,
                    attributes,
                    ids,
                    results.exceededTransferLimit
                  );
                } else {
                  _this.app.trace.log(
                    'Select by geometry returned no features',
                    amanda.diagnostics.LogLevel.warning
                  );
                }
              })
              .catch(function (error) {
                return _this.app.trace.logError(
                  'Select by geometry query failed',
                  error
                );
              });
          };
          this.app.map.captureSelection(selectionType, geometrySelected, {
            bufferUnit: payload.bufferUnit,
            bufferDistance: payload.distance,
          });
        }
      };
      /**
       * Displays an infowindow over the specified feature.
       * {@link Payload} required command parameters:
       * - `messageType`: The {@link CommandType} for activate.
       * - `layerName`: The layer name where the feature can be located
       * - `fieldName`: The field which the ID will be queries against.
       * - `feature`: The ID of the feature.
       * - `infoTitle`: The title.
       * - `infoContent`: The content.
       * @params payload The commands {@link Payload}.
       */
      EsriCommandImpl.prototype.activate = async function (payload) {
        var _this = this;
        var layerName = payload.layerName;
        var feature = payload.feature;
        var fieldName = payload.fieldName;
        var layer = await this.app.map.getLayerByName(layerName);
        var stringType = amanda.utils.QueryHelper.isFieldStringType(
          layer,
          fieldName
        );
        var selectQuery = new amanda.map.Query(layer.getUrl());
        selectQuery.queryParams.outFields.push('*');
        selectQuery.queryParams.outSpatialReference =
          this.app.map.getGISMap().spatialReference;
        selectQuery.queryParams.where =
          amanda.utils.QueryHelper.generateWhereClause(
            fieldName,
            [feature],
            stringType
          );
        selectQuery
          .perform()
          .then(function (results) {
            if (results && results.features) {
              results.features.forEach(function (graphic) {
                var point = amanda.utils.GraphicHelper.getCentroid(graphic);
                if (point) {
                  var pushpin = amanda.utils.GraphicHelper.createPushpinGraphic(
                    point,
                    _this.app.configOptions.pushpinImage
                  );
                  pushpin.attributes = graphic.attributes;
                  var id = _this._getPropertyByName(
                    graphic.attributes,
                    fieldName
                  );
                  amanda.utils.GraphicHelper.setTags(
                    pushpin,
                    layerName,
                    commands.CommandType.activate,
                    id
                  );
                  _this.app.map.addPushpin(pushpin);
                  _this.app.map.getGISMap().centerAt(point);
                  if (payload.infoTitle || payload.infoContent) {
                    var infoWindow = _this.app.map.getGISMap().infoWindow;
                    if (payload.infoTitle) {
                      infoWindow.setTitle(payload.infoTitle);
                    }
                    if (payload.infoContent) {
                      infoWindow.setContent(payload.infoContent);
                    }
                    infoWindow.show(point);
                  }
                }
              });
            } else {
              _this.app.trace.log(
                'Activate query returned no features',
                amanda.diagnostics.LogLevel.warning
              );
            }
          })
          .catch(function (error) {
            _this.app.trace.logError('Activate query failed', error);
          });
      };
      /**
       * Highlights a feature.
       * {@link Payload} required command parameters:
       * - `messageType`: The {@link CommandType} for highlight.
       * - `layerName`: The layer name where the feature can be located
       * - `fieldName`: The field which the ID will be queries against.
       * - `feature`: The ID of the feature.
       * @params payload The commands {@link Payload}.
       */
      EsriCommandImpl.prototype.highlight = async function (payload) {
        var _this = this;
        var layerName = payload.layerName;
        var feature = payload.feature;
        var fieldName = payload.fieldName;
        var layer = await this.app.map.getLayerByName(layerName);
        var stringType = amanda.utils.QueryHelper.isFieldStringType(
          layer,
          fieldName
        );
        var selectQuery = new amanda.map.Query(layer.getUrl());
        selectQuery.queryParams.outFields.push('*');
        selectQuery.queryParams.outSpatialReference =
          this.app.map.getGISMap().spatialReference;
        selectQuery.queryParams.where =
          amanda.utils.QueryHelper.generateWhereClause(
            fieldName,
            [feature],
            stringType
          );
        selectQuery
          .perform()
          .then(function (results) {
            if (results && results.features) {
              results.features.forEach(function (highlightGraphic) {
                if (highlightGraphic) {
                  var id = _this._getPropertyByName(
                    highlightGraphic.attributes,
                    fieldName
                  );
                  amanda.utils.GraphicHelper.setTags(
                    highlightGraphic,
                    layerName,
                    commands.CommandType.highlight,
                    id
                  );
                  _this.app.map.ensurePushpinsOntop();
                  _this.app.map.addHighlight(highlightGraphic);
                }
              });
            } else {
              _this.app.trace.log(
                'Highlight query returned no features',
                amanda.diagnostics.LogLevel.warning
              );
            }
          })
          .catch(function (error) {
            _this.app.trace.logError('Highlight query failed', error);
          });
      };
      /**
       * Performs a buffered search.
       * Results from the source layer are found, the geometries are buffered by a set distance in meters and then
       * the resultant geometry is used to query on the layer. Once results are found, they are selected.
       * Event: Fires an event when the results are found.
       * {@link Payload} required command parameters:
       * - `messageType`: The {@link CommandType} for buffer search.
       * - `sourceLayerName`: The layer name where the feature can be located
       * - `sourceFieldName`: The field which the ID will be queries against.
       * - `features`: The IDs of the source features which will be buffered.
       * - `layerName`: The layer name of where the actual search will take place.
       * - `fieldName`: The values from this field will be returned to AMANDA.
       * - `distance`: The distance to buffer.
       * - {@link Payload} optional command parameters:
       * - `bufferUnit`: The unit to buffer by. Default is 'meters'.
       * @params payload The commands {@link Payload}.
       */
      EsriCommandImpl.prototype.bufferSearch = async function (payload) {
        var _this = this;
        var sourceLayerName = payload.sourceLayerName;
        var sourceFieldName = payload.sourceFieldName;
        var sourceLayer = await this.app.map.getLayerByName(sourceLayerName);
        var layerName = payload.layerName;
        var fieldName = payload.fieldName;
        var layer = await this.app.map.getLayerByName(layerName);
        var features = payload.features;
        var distance = payload.distance;
        var stringType = amanda.utils.QueryHelper.isFieldStringType(
          sourceLayer,
          sourceFieldName
        );
        var selectQuery = new amanda.map.Query(sourceLayer.getUrl());
        selectQuery.queryParams.outFields.push('*');
        selectQuery.queryParams.outSpatialReference =
          this.app.map.getGISMap().spatialReference;
        selectQuery.queryParams.where =
          amanda.utils.QueryHelper.generateWhereClause(
            sourceFieldName,
            features,
            stringType
          );
        selectQuery
          .perform()
          .then(function (results) {
            var buffer = new amanda.map.Buffer(
              _this.app.map.geometryServiceUrl
            );
            if (results && results.features && results.features.length > 0) {
              results.features.forEach(function (toBuffer) {
                if (toBuffer) {
                  buffer.bufferParams.geometries.push(toBuffer.geometry);
                  buffer.bufferParams.distances.push(distance);
                  buffer.bufferParams.unionResults = true;
                  buffer.bufferParams.unit = amanda.map.Buffer.toEsriUnit(
                    payload.bufferUnit
                  );
                }
              });
              return buffer.perform();
            } else {
              _this.app.trace.log(
                'Source layer buffer search query returned no features',
                amanda.diagnostics.LogLevel.warning
              );
              return Promise.resolve([]);
            }
          })
          .then(function (bufferResults) {
            if (bufferResults && bufferResults.length > 0) {
              var geometryToQueryWith = bufferResults[0];
              var stringType_1 = amanda.utils.QueryHelper.isFieldStringType(
                layer,
                fieldName
              );
              var selectQuery_1 = new amanda.map.Query(layer.getUrl());
              selectQuery_1.queryParams.outFields.push('*');
              selectQuery_1.queryParams.outSpatialReference =
                _this.app.map.getGISMap().spatialReference;
              selectQuery_1.queryParams.geometry = geometryToQueryWith;
              return selectQuery_1.perform();
            } else {
              _this.app.trace.log(
                'No buffer could be determined from source input features',
                amanda.diagnostics.LogLevel.warning
              );
              return Promise.resolve(new esri.tasks.FeatureSet());
            }
          })
          .then(function (foundFeatures) {
            if (
              foundFeatures &&
              foundFeatures.features &&
              foundFeatures.features.length > 0
            ) {
              var idsArray_1 = [];
              foundFeatures.features.forEach(function (feature) {
                var id = _this._getPropertyByName(
                  feature.attributes,
                  fieldName
                );
                if (id) {
                  idsArray_1.push(id);
                }
              });
              _this.app.events.featuresSelected(layerName, idsArray_1);
              _this._selectFeatures(
                layerName,
                fieldName,
                foundFeatures.features
              );
            } else {
              _this.app.trace.log(
                'Buffered query did not return any results',
                amanda.diagnostics.LogLevel.warning
              );
            }
            return Promise.resolve();
          })
          .catch(function (error) {
            _this.app.trace.logError(
              'Failed to perform the buffered selection',
              error
            );
          });
      };
      EsriCommandImpl.prototype._selectFeatures = function (
        layerName,
        fieldName,
        graphics
      ) {
        var _this = this;
        this.app.map.ensurePushpinsOntop();
        graphics.forEach(function (graphic) {
          var id = _this._getPropertyByName(graphic.attributes, fieldName);
          amanda.utils.GraphicHelper.setTags(
            graphic,
            layerName,
            commands.CommandType.select,
            id
          );
          _this.app.map.addPushpin(graphic);
        });
        this.app.map.zoomToSelection(null);
      };
      EsriCommandImpl.prototype._getPropertyByName = function (
        array,
        fieldName
      ) {
        var val = null;
        if (array && !!array[fieldName]) {
          val = array[fieldName];
        }
        return val;
      };
      /**
       * Sets a layers visibility to the passed value.
       * Event: Fires an event if the layers visibility changes.
       * {@link Payload} required command parameters:
       * - `messageType`: The {@link CommandType} for set visibility.
       * - `layerName`: The layer which is having it's visibility changed.
       * - `visibility`: 'True' for visible, 'False' for invisible.
       * @params payload The commands {@link Payload}.
       */
      EsriCommandImpl.prototype.setLayerVisibility = async function (payload) {
        var layerName = payload.layerName;
        var visibility = payload.visibility;
        var layer = await this.app.map.getLayerByName(layerName);
        var changed = false;
        if (layer) {
          changed = layer.setVisibility(visibility);
        }
        if (changed) {
          this.app.events.visibilityChanged(layerName, visibility);
        }
      };
      return EsriCommandImpl;
    })();
    commands.EsriCommandImpl = EsriCommandImpl;
  })((commands = amanda.commands || (amanda.commands = {})));
})(amanda || (amanda = {}));
var amanda;
(function (amanda) {
  var commands;
  (function (commands) {
    /**
     * The following values can be used when creating messages in AMANDA 7 to pass to the embedded AMANDA GIS Widgets enabled viewer.
     */
    var CommandType;
    (function (CommandType) {
      /**
       * Performs a select command.
       * Value: "SELECT"
       */
      CommandType.select = 'SELECT';
      /**
       * Performs a deselect command.
       * Value: "DESELECT"
       */
      CommandType.deselect = 'DESELECT';
      /**
       * Performs an activate command.
       * Value: "ACTIVATE"
       */
      CommandType.activate = 'ACTIVATE';
      /**
       * Performs a deactivate command.
       * Value: "DEACTIVATE"
       */
      CommandType.deactivate = 'DEACTIVATE';
      /**
       * Performs a highlight command.
       * Value: "HIGHLIGHT"
       */
      CommandType.highlight = 'HIGHLIGHT';
      /**
       * Performs an unhighlight command.
       * Value: "UNHIGHLIGHT"
       */
      CommandType.unhighlight = 'UNHIGHLIGHT';
      /**
       * Performs a set map mode command for makign geometry selections.
       * Value: "SETMAPMODE"
       */
      CommandType.setMapMode = 'SETMAPMODE';
      /**
       * Performs a buffer search command.
       * Value: "BUFFERSEARCH"
       */
      CommandType.bufferSearch = 'BUFFERSEARCH';
      /**
       * Performs a set layer visibility command.
       * Value: "SETLAYERVISIBILITY"
       */
      CommandType.setLayerVisibility = 'SETLAYERVISIBILITY';
      /**
       * Performs a scale command.
       *
       */
      CommandType.setScale = 'SETSCALE';
    })((CommandType = commands.CommandType || (commands.CommandType = {})));
  })((commands = amanda.commands || (amanda.commands = {})));
})(amanda || (amanda = {}));
var amanda;
(function (amanda) {
  var events;
  (function (events) {
    /**
     * Manages event communication to the AMANDA7 implementation.
     */
    var EventHandler = (function () {
      /**
       * Constructs a new instance of an {@link EventHandler}.
       * @param app The application.
       */
      function EventHandler(app) {
        this._domain = null;
        this.app = app;
        this.initialized = false;
      }
      /**
       * Initializes the object from an {@link InitializationOptions}.
       * @param options The {@link InitializationOptions}.
       */
      EventHandler.prototype.initialize = function (options) {
        if (options && !!options['domain']) {
          this._domain = options['domain'];
          this.app.trace.log(
            'Event handler using domain: '.format(this._domain),
            amanda.diagnostics.LogLevel.debug
          );
        }
        this.initialized = true;
      };
      /**
       * Fires the selected click event with the supplied parameters.
       * @param layerName The name of the layer.
       * @param feature The id of the feature.
       */
      EventHandler.prototype.selectedClick = function (layerName, feature) {
        var payload = new events.Payload();
        payload.messageType = events.EventType.selectedclick;
        payload.layerName = layerName;
        payload.feature = feature;
        this.emitEvent(payload);
      };
      /**
       * Fires the map ready event.
       */
      EventHandler.prototype.mapReady = function () {
        var payload = new events.Payload();
        payload.messageType = events.EventType.initialized;
        this.emitEvent(payload);
      };
      /**
       * Fires the feature selected event with the supplied parameters.
       * @param layerName The name of the layer.
       * @param features The ids of the features.
       */
      EventHandler.prototype.featuresSelected = function (
        layerName,
        features,
        exceededTransferLimit
      ) {
        if (exceededTransferLimit === void 0) {
          exceededTransferLimit = false;
        }
        var payload = new events.Payload();
        payload.messageType = events.EventType.featuresSelected;
        payload.layerName = layerName;
        payload.features = features;
        payload.exceededTransferLimit = exceededTransferLimit;
        this.emitEvent(payload);
      };
      /**
       * Fires the feature selected by geometry event with the supplied parameters.
       * @param layerName The name of the layer.
       * @param features The ids of the features.
       */
      EventHandler.prototype.featuresSelectedByGeometry = function (
        layerName,
        attributes,
        features,
        exceededTransferLimit
      ) {
        if (exceededTransferLimit === void 0) {
          exceededTransferLimit = false;
        }
        var payload = new events.Payload();
        payload.messageType = events.EventType.featuresSelectedByGeometry;
        payload.layerName = layerName;
        payload.features = features;
        payload.attributes = attributes;
        payload.exceededTransferLimit = exceededTransferLimit;
        this.emitEvent(payload);
      };
      /**
       * Fires the map mode changed even.
       * @param mode The changed map mode.
       */
      EventHandler.prototype.mapModeChanged = function (mode) {
        var payload = new events.Payload();
        payload.messageType = events.EventType.mapModeChanged;
        payload.mapMode = mode.toLowerCase();
        this.emitEvent(payload);
      };
      /**
       * Fires the map extent changed event to tell AMANDA the GIS map extent is changed.
       */
      EventHandler.prototype.mapExtentChanged = function () {
        var payload = new events.Payload();
        payload.messageType = events.EventType.mapExtentChanged;
        this.emitEvent(payload);
      };
      /**
       * Fires the feature hover event with the supplied parameters.
       * @param layerName The name of the layer.
       * @param feature The id of the feature.
       */
      EventHandler.prototype.featureHover = function (layerName, feature) {
        var payload = new events.Payload();
        payload.messageType = events.EventType.featureHover;
        payload.layerName = layerName;
        payload.feature = feature;
        this.emitEvent(payload);
      };
      /**
       * Fires the features selected event with the supplied parameters.
       * @param features The ids of the features.
       */
      EventHandler.prototype.selectedFeaturesVisibleOnMap = function (
        features
      ) {
        var payload = new events.Payload();
        payload.messageType = events.EventType.selectedFeaturesVisible;
        payload.visibleFeatures = features;
        this.emitEvent(payload);
      };
      /**
       * Fires the deselected event.
       */
      EventHandler.prototype.deselected = function () {
        var payload = new events.Payload();
        payload.messageType = events.EventType.deselected;
        this.emitEvent(payload);
      };
      /**
       * Fires the feature hover event with the supplied parameters.
       * @param layerName The name of the layer.
       * @param features The ids of the features.
       */
      EventHandler.prototype.bufferSearchResults = function (
        layerName,
        features
      ) {
        var payload = new events.Payload();
        payload.messageType = events.EventType.bufferSearchResults;
        payload.layerName = layerName;
        payload.features = features;
        this.emitEvent(payload);
      };
      /**
       * Fires the visibility changed event with the supplied parameters.
       * @param layerName The name of the layer.
       * @param visibility The visible state of the layer.
       */
      EventHandler.prototype.visibilityChanged = function (
        layerName,
        visibility
      ) {
        var payload = new events.Payload();
        payload.messageType = events.EventType.visibilitySet;
        payload.layerName = layerName;
        payload.visibility = visibility;
        this.emitEvent(payload);
      };
      /**
       * Fires an event with the supplied parameters.
       * @param event The {@link Payload} to pass to the browser as JSON.
       */
      EventHandler.prototype.emitEvent = function (event) {
        if (!(event instanceof events.Payload)) {
          this.app.trace.log(
            'Event must be of type amanda.events.Payload.',
            amanda.diagnostics.LogLevel.error
          );
          return;
        }
        var windowDomain = '*';
        if (this._domain) {
          windowDomain = this._domain;
        }
        try {
          top.postMessage(event.toJson(), windowDomain);
          this.app.trace.log(
            "'{0}' was emitted from the map.".format(event.messageType),
            amanda.diagnostics.LogLevel.debug
          );
        } catch (e) {
          this.app.trace.logError('Post message failed', e);
        }
      };
      return EventHandler;
    })();
    events.EventHandler = EventHandler;
  })((events = amanda.events || (amanda.events = {})));
})(amanda || (amanda = {}));
var amanda;
(function (amanda) {
  var events;
  (function (events) {
    /**
     * Represents an event payload which is passed to the AMANDA 7 wrapper application for notifications.
     */
    var Payload = (function () {
      /**
       * Constructs a new {@link Payload}.
       */
      function Payload() {}
      /**
       * Returns the JSON representation of the object.
       * @returns The JSON.
       */
      Payload.prototype.toJson = function () {
        return JSON.stringify(this);
      };
      return Payload;
    })();
    events.Payload = Payload;
  })((events = amanda.events || (amanda.events = {})));
})(amanda || (amanda = {}));
var amanda;
(function (amanda) {
  /**
   * Class to represent an added Esri Layer.
   * {@link EsriLayer} are automatically populated when Dynamic, Tiled or Feature layers are added to the map.
   */
  var EsriLayer = (function () {
    /**
     * Constructs a new {@link EsriLayer} object.
     */
    function EsriLayer() {}
    /**
     * Gets the formatted URL for the layer.
     */
    EsriLayer.prototype.getUrl = function () {
      if (this._serviceLayer instanceof esri.layers.FeatureLayer) {
        return this.url;
      } else {
        return this.url + '/' + this.id;
      }
    };
    /**
     * Sets the layer visibility to the value of the passed boolean. Will return true if the layer visibility changes, and False if it does not.
     * @param visibility The visibility to set.
     * @returns A value indicating if the visibility on the layer changed or not.
     */
    EsriLayer.prototype.setVisibility = function (visibility) {
      var changed = false;
      if (
        this._serviceLayer instanceof esri.layers.ArcGISTiledMapServiceLayer
      ) {
        var tiled = this._serviceLayer;
        tiled.setVisibility(visibility);
        changed = true;
      } else if (
        this._serviceLayer instanceof esri.layers.ArcGISDynamicMapServiceLayer
      ) {
        var dynamic = this._serviceLayer;
        var visibleLayers = dynamic.visibleLayers;
        var indexOfLayer = visibleLayers.indexOf(this.id);
        if (visibility) {
          // make sure the array contains the ID
          if (indexOfLayer < 0) {
            visibleLayers.push(this.id);
            changed = true;
          }
        } else {
          // remove the id if it exists
          if (indexOfLayer > -1) {
            visibleLayers.splice(indexOfLayer, 1);
            changed = true;
            if (visibleLayers.length === 0) {
              visibleLayers.push(-1);
            }
          }
        }
        if (changed) {
          dynamic.setVisibleLayers(visibleLayers);
        }
      } else if (this._serviceLayer instanceof esri.layers.FeatureLayer) {
        var featureLayer = this._serviceLayer;
        var currentVis = featureLayer.visible;
        if (currentVis !== visibility) {
          featureLayer.setVisibility(visibility);
          changed = true;
        }
      }
      return changed;
    };
    /**
     * Gets the layers fields.
     * @returns The layers fields.
     */
    EsriLayer.prototype.getLayerFields = function () {
      return this._fields;
    };
    /**
     * Populates the layers fields.
     */
    EsriLayer.prototype._populateQueryInfo = function () {
      var _this = this;
      var infoQuery = new amanda.map.Query(this.getUrl());
      infoQuery.queryParams.where = '1=0';
      infoQuery.queryParams.outFields.push('*');
      infoQuery.perform().then(
        function (results) {
          if (results && results.fields) {
            _this._fields = results.fields;
          }
        },
        function (error) {
          //console.log("Something went wrong while populating layer info " + error);
        }
      );
    };
    /**
     * Creates a {@link EsriLayer} for a dynamic layer.
     * @param esriLayer The {@link esri.layers.Layer}.
     * @param info The {@link esri.layers.LayerInfo}.
     * @returns The created {@link EsriLayer}.
     */
    EsriLayer.createFromLayerInfo = function (esriLayer, info) {
      var layer = null;
      if (esriLayer && info) {
        layer = new EsriLayer();
        layer.url = esriLayer.url;
        layer.name = info.name;
        layer.id = info.id;
        layer._serviceLayer = esriLayer;
        layer._populateQueryInfo();
      }
      return layer;
    };
    /**
     * Creates a {@link EsriLayer} for a feature layer.
     * @param esriLayer The {@link esri.layers.FeatureLayer}.
     * @returns The created {@link EsriLayer}.
     */
    EsriLayer.createFromFeatureLayer = function (esriLayer) {
      var layer = null;
      if (esriLayer) {
        layer = new EsriLayer();
        layer.url = esriLayer.url;
        layer.id = parseInt(esriLayer.id);
        layer.name = esriLayer.name;
        layer._serviceLayer = esriLayer;
        layer._fields = esriLayer.fields;
      }
      return layer;
    };
    return EsriLayer;
  })();
  amanda.EsriLayer = EsriLayer;
})(amanda || (amanda = {}));
var amanda;
(function (amanda) {
  var map;
  (function (map) {
    /**
     * A wrapper for an Esri Geometry Service Task which performs a Buffer.
     */
    var Buffer = (function () {
      /**
       * Constructs a new instance of {@link Buffer}.
       * @param url The url of the Esri Geometry Service.
       */
      function Buffer(url) {
        this._bufferTask = new esri.tasks.GeometryService(url);
        var bufferParams = new esri.tasks.BufferParameters();
        bufferParams.unit = esri.tasks.GeometryService.UNIT_METER;
        bufferParams.unionResults = true;
        if (!bufferParams.geometries) {
          bufferParams.geometries = [];
        }
        if (!bufferParams.distances) {
          bufferParams.distances = [];
        }
        this.bufferParams = bufferParams;
      }
      /**
       * Performs the buffer.
       * @returns A Promise.
       */
      Buffer.prototype.perform = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
          _this._bufferTask.buffer(_this.bufferParams, resolve, reject);
        });
      };
      /**
       * Converts 'meter' or 'foot' to the Esri service equivalent.
       * @param unit The AMANDA distance unit.
       * @returns A value representing the Esri unit..
       */
      Buffer.toEsriUnit = function (unit) {
        switch ('{0}'.format(unit).toUpperCase()) {
          case map.DistanceUnit.foot:
            return esri.tasks.GeometryService.UNIT_FOOT;
          default:
            return esri.tasks.GeometryService.UNIT_METER;
        }
      };
      return Buffer;
    })();
    map.Buffer = Buffer;
  })((map = amanda.map || (amanda.map = {})));
})(amanda || (amanda = {}));
var amanda;
(function (amanda) {
  var map;
  (function (map_1) {
    /**
     * Wrapper for an Esri Map based GIS viewer.
     */
    var EsriMap = (function () {
      /**
       * Constructs a new instance of {@link EsriMap}.
       * @param app The {@link AmandaApp}.
       * @param map The underlying {@link esri.Map}.
       * @param options Optional options object.
       */
      function EsriMap(app, map, options) {
        var _this = this;
        /**
         * If the map has been initialized or not.
         */
        this.initialized = false;
        /**
         * Geometry service URL
         */
        this.geometryServiceUrl = null;
        this._defaultGeometryServiceUrl =
          'http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer';
        this._drawingActive = false;
        this._defaultProxyUrl = 'proxy.ashx';
        this._pushpinLayerName = 'pushpins';
        this._hpushpinLayerName = 'highlighted_pushpins';
        this._serviceToken = null;
        this._serviceUrl = null;
        this._expandRatio = 2;
        // handles map initialization
        this._mapInitialized = function () {
          //this._injectToken();
          // add pushpin graphics layers
          _this._pushpinLayer = new esri.layers.GraphicsLayer();
          _this._pushpinLayer.id = _this._pushpinLayerName;
          _this._highlightLayer = new esri.layers.GraphicsLayer();
          _this._highlightLayer.id = _this._hpushpinLayerName;
          // attach extent change handler
          _this._esriMap.on('extent-change', function (extentChange) {
            return _this._handleExtentChanged(extentChange);
          });
          // attach layer-add handler
          _this._esriMap.on('layer-add', function (args) {
            return _this._handleLayerAdded(args);
          });
          // add pushpin layer event listeners
          _this._pushpinLayer.on('click', function (event) {
            return _this._handlePushpinClick(event);
          });
          // attach pushpin mouse-over handler
          _this._pushpinLayer.on('mouse-over', function (event) {
            if (event && event.graphic) {
              var tags = amanda.utils.GraphicHelper.extractTags(event.graphic);
              event.graphic.setSymbol(
                amanda.utils.GraphicHelper.getHighlightedSymbol(
                  _this.app.configOptions.highlightedPushpinImage
                )
              );
              _this.app.events.featureHover(tags.layerName, tags.gisId);
            }
          });
          // attach pushpin mouse-over handler
          _this._pushpinLayer.on('mouse-out', function (event) {
            if (event && event.graphic) {
              var tags = amanda.utils.GraphicHelper.extractTags(event.graphic);
              event.graphic.setSymbol(
                amanda.utils.GraphicHelper.getSelectedSymbol(
                  _this.app.configOptions.pushpinImage
                )
              );
            }
          });
          // attach highlight click handler
          _this._highlightLayer.on('click', function (event) {
            return _this._handlePushpinClick(event);
          });
          // attach highlight mouse-over handler
          _this._highlightLayer.on('mouse-over', function (event) {
            if (event && event.graphic) {
              var tags = amanda.utils.GraphicHelper.extractTags(event.graphic);
              _this.app.events.featureHover(tags.layerName, tags.gisId);
            }
          });
          // add pushpin layers to map
          _this._esriMap.addLayer(_this._pushpinLayer);
          _this._esriMap.addLayer(_this._highlightLayer);
          _this._drawingTool = new esri.toolbars.Draw(_this._esriMap);
          _this._esriMap.setInfoWindowOnClick(false);
          _this.initialized = true;
          // fire map initialized event
          _this.app.events.mapReady();
        };
        this._esriMap = map;
        this.app = app;
        this.layers = [];
        esri.config.defaults.io.proxyUrl = this._defaultProxyUrl;
        this._parseOptions(options);
        if (!this.geometryServiceUrl) {
          this.geometryServiceUrl = this._defaultGeometryServiceUrl;
          this.app.trace.log(
            "Using default geometry service: '{0}'".format(
              this._defaultGeometryServiceUrl
            ),
            amanda.diagnostics.LogLevel.debug
          );
        }
        var paramToken = amanda.utils.Extensions.getParameterByName('token');
        if (paramToken) {
          this._serviceToken = paramToken;
          this.app.trace.log(
            'Service token loaded from parent window URL',
            amanda.diagnostics.LogLevel.debug
          );
        }
        this._initialize();
      }
      // calls or subscribes the map initialized function
      EsriMap.prototype._initialize = function () {
        var _this = this;
        if (this._esriMap.loaded) {
          // since the map has already initialized, crawl layers and fire added event
          if (this._esriMap && this._esriMap.graphicsLayerIds) {
            for (var i = 0; i < this._esriMap.graphicsLayerIds.length; i++) {
              var args = {};
              args.target = this._esriMap;
              args.layer = this._esriMap.getLayer(
                this._esriMap.graphicsLayerIds[i]
              );
              this._handleLayerAdded(args);
            }
          }
          if (this._esriMap && this._esriMap.layerIds) {
            for (var i = 0; i < this._esriMap.layerIds.length; i++) {
              var args = {};
              args.target = this._esriMap;
              args.layer = this._esriMap.getLayer(this._esriMap.layerIds[i]);
              this._handleLayerAdded(args);
            }
          }
          this._mapInitialized();
        } else {
          this._esriMap.on('load', function (event) {
            _this._mapInitialized();
          });
        }
      };
      EsriMap.prototype._parseOptions = function (options) {
        if (options) {
          if (options['proxyUrl']) {
            var url = options['proxyUrl'];
            esri.config.defaults.io.proxyUrl = url;
            this.app.trace.log(
              'Proxy URL set to: {0}'.format(url),
              amanda.diagnostics.LogLevel.debug
            );
          }
          // prefer the token in the url if it exists in both config and the url
          if (!!options['serviceToken'] && !this._serviceToken) {
            this._serviceToken = options['serviceToken'];
            this.app.trace.log(
              'Service token loaded from configuration',
              amanda.diagnostics.LogLevel.debug
            );
          }
          if (options['serviceUrl']) {
            this._serviceUrl = options['serviceUrl'];
            this.app.trace.log(
              'Service URL loaded from configuration',
              amanda.diagnostics.LogLevel.debug
            );
          }
          if (options['expandRatio']) {
            this._expandRatio = options['expandRatio'];
            this.app.trace.log(
              'Expand ration loaded from configuration',
              amanda.diagnostics.LogLevel.debug
            );
          }
          if (options['geometryServiceUrl']) {
            this.geometryServiceUrl = options.geometryServiceUrl;
            this.app.trace.log(
              'Geometry Service Url set to {0} from configuration'.format(
                this.geometryServiceUrl
              ),
              amanda.diagnostics.LogLevel.debug
            );
          }
        } else {
          this.app.trace.log(
            'Service URL was not specified. CSDC Feature Service tokens cannot be replaced.',
            amanda.diagnostics.LogLevel.warning
          );
        }
      };
      /**
       * Sets the map to an extent which is expanded to the configured extent ratio.
       * @param extent The extent.
       */
      EsriMap.prototype.setExtent = function (extent) {
        if (extent) {
          extent = extent.expand(this._expandRatio);
          this._esriMap.setExtent(extent);
          this.app.trace.log(
            'Setting extent with expand ratio of {0}'.format(this._expandRatio),
            amanda.diagnostics.LogLevel.debug
          );
        }
      };
      EsriMap.prototype._handleLayerAdded = function (args) {
        var layer = args.layer;
        var amandaLayer = null;
        // determine the type of layer and create an EsriLayer accordingly
        // Only Feature and Dynamic Layers supported
        if (layer instanceof esri.layers.ArcGISDynamicMapServiceLayer) {
          var dynamic = layer;
          var infos = dynamic.layerInfos;
          for (var i = 0; i < infos.length; i++) {
            var info = infos[i];
            // Do not create layer item for folders
            if (!info.subLayerIds) {
              amandaLayer = amanda.EsriLayer.createFromLayerInfo(layer, info);
              this._handleAddLayer(amandaLayer, layer);
            }
          }
        } else if (layer instanceof esri.layers.FeatureLayer) {
          var featureLayer = layer;
          featureLayer.setInfoTemplate(null);
          // sometimes feature layers do not have a name. they will run through here twice and be caught on second time with a name.
          // adding layers without a name causes issues down the road since layers are keyed by name.
          if (featureLayer.name) {
            amandaLayer = amanda.EsriLayer.createFromFeatureLayer(featureLayer);
            this._handleAddLayer(amandaLayer, layer);
          }
        }
      };
      EsriMap.prototype._handleAddLayer = function (amandaLayer, layer) {
        if (amandaLayer) {
          // determine if the token from the url should be removed
          if (
            this._serviceToken &&
            this._serviceUrl &&
            layer &&
            layer._url &&
            layer.url.toLowerCase().indexOf(this._serviceUrl.toLowerCase()) >
              -1 &&
            layer.url.toLowerCase().indexOf('token') > -1
          ) {
            // _url is private, this is definitely not safe
            var _url = layer._url;
            if (_url.query) {
              _url.query.token = this._serviceToken;
              var queryString = dojo.objectToQuery(_url.query);
              layer.url = _url.path + (queryString ? '?' + queryString : '');
              this.app.trace.log(
                "Replacing AMANDA Cloud URL token on layer: '{0}'".format(
                  amandaLayer.name
                ),
                amanda.diagnostics.LogLevel.debug
              );
            }
            if (layer instanceof esri.layers.FeatureLayer) {
              // _task is private, this is definitely not safe
              var _task = layer._task;
              if (_task && _task._url && _task._url.query) {
                _task._url.query.token = this._serviceToken;
                this.app.trace.log(
                  "Replacing AMANDA Cloud token on FeatureService task on layer: '{0}'".format(
                    amandaLayer.name
                  ),
                  amanda.diagnostics.LogLevel.debug
                );
              }
            }
          }
          this.layers.push(amandaLayer);
          this.app.trace.log(
            "Layer '{0}' was added and will be available to participate in AMANDA GIS operations.".format(
              amandaLayer.name
            ),
            amanda.diagnostics.LogLevel.debug
          );
        }
      };
      EsriMap.prototype._handlePushpinClick = function (event) {
        if (event && event.graphic) {
          var tags = amanda.utils.GraphicHelper.extractTags(event.graphic);
          this.app.events.selectedClick(tags.layerName, tags.gisId);
        }
      };
      EsriMap.prototype._handleExtentChanged = function (extentChanged) {
        if (extentChanged && extentChanged.extent) {
          var extent = extentChanged.extent;
          // check if the map needs to tell AMANDA about any visible pushpins
          if (this._mapHasActivePushpins()) {
            // active pushpins in the map, so tell AMANDA if any are visible
            var visibleFeatures = [];
            var pushpins = this._getPushpinGraphics();
            for (var i = 0; i < pushpins.length; i++) {
              var pushpin = pushpins[i];
              var point = pushpin.geometry;
              // does map extent contain the pushpin?
              if (extent.contains(point)) {
                var tags = amanda.utils.GraphicHelper.extractTags(pushpin);
                var insertIndex = this._getVisibleResultsLayerIndex(
                  tags.layerName,
                  visibleFeatures
                );
                // if index is less than 0, create new layer resultset
                if (insertIndex < 0) {
                  visibleFeatures.push({
                    layerName: tags.layerName,
                    features: [tags.gisId],
                  });
                } else {
                  // append to layer resultset
                  visibleFeatures[insertIndex].features.push(tags.gisId);
                }
              }
            }
            // fire visible feature on map event
            this.app.events.selectedFeaturesVisibleOnMap(visibleFeatures);
          }
          // fire map extent chagned event to tell AMANDA
          this.app.events.mapExtentChanged();
        }
      };
      // if this returns a -1, the layers resultset was not found as needs to be created
      EsriMap.prototype._getVisibleResultsLayerIndex = function (
        layerName,
        visibleFeatures
      ) {
        var existsAtIndex = -1;
        if (layerName && visibleFeatures && visibleFeatures.length) {
          for (var i = 0; i < visibleFeatures.length; i++) {
            var visLayerName = visibleFeatures[i].layerName;
            if (
              visLayerName &&
              visLayerName.toLowerCase() === layerName.toLowerCase()
            ) {
              // found it, return index
              existsAtIndex = i;
              break;
            }
          }
        }
        return existsAtIndex;
      };
      /**
       * If the map has been initialized or not.
       * @returns The command implementation for the map.
       */
      EsriMap.prototype.getMapCommandImplementation = function () {
        return new amanda.commands.EsriCommandImpl(this.app);
      };
      /**
       * Gets a layer by layer name.
       * @param name The name of the layer to find.
       * @returns The found {@link ErsiLayer}.
       */
      EsriMap.prototype.getLayerByName = async function (name) {
        var layer = null;
        if (!name) {
          return null;
        }

        const MAX_RETRIES = 10;
        var retries = 0;

        while (this.layers.length === 0) {
          // wait for layers to be populated
          retries++;

          if (retries > MAX_RETRIES) {
            break;
          }

          await new Promise(r => setTimeout(r, 1000));
        }

        for (var i = 0; i < this.layers.length; i++) {
          if (
            name.toLowerCase().trim() ===
            this.layers[i].name.toLowerCase().trim()
          ) {
            //found the layer
            layer = this.layers[i];
            break;
          }
        }

        // none found
        if (!layer) {
          this.app.trace.log(
            "Could not find a layer with name: '{0}'. Cannot execute command.".format(
              name
            ),
            amanda.diagnostics.LogLevel.error
          );
        }
        return layer;
      };
      /**
       * Gets the underlying Ersi Map.
       * @returns The Esri Map.
       */
      EsriMap.prototype.getGISMap = function () {
        return this._esriMap;
      };
      EsriMap.prototype._mapHasActivePushpins = function () {
        if (this._getPushpinGraphics().length > 0) {
          return true;
        } else {
          return false;
        }
      };
      EsriMap.prototype._getPushpinGraphics = function () {
        if (this._pushpinLayer && this._pushpinLayer.graphics) {
          return this._pushpinLayer.graphics;
        }
        return [];
      };
      /**
       * Add a pushpin to the map.
       * @param graphic The Esri graphic to add as a pushpin.
       */
      EsriMap.prototype.addPushpin = function (graphic) {
        if (graphic && graphic.geometry) {
          var newGeometry = amanda.utils.GraphicHelper.getCentroid(graphic);
          graphic.setGeometry(newGeometry);
          graphic.setSymbol(
            amanda.utils.GraphicHelper.getSelectedSymbol(
              this.app.configOptions.pushpinImage
            )
          );
          this._pushpinLayer.add(graphic);
        }
      };
      /**
       * Add a highlight to the map.
       * @param graphic The Esri graphic to add as a highlighted pushpin.
       */
      EsriMap.prototype.addHighlight = function (graphic) {
        if (graphic && graphic.geometry) {
          var newGeometry = amanda.utils.GraphicHelper.getCentroid(graphic);
          graphic.setGeometry(newGeometry);
          graphic.setSymbol(
            amanda.utils.GraphicHelper.getHighlightedSymbol(
              this.app.configOptions.highlightedPushpinImage
            )
          );
          this._highlightLayer.add(graphic);
        }
      };
      /**
       * Clears the added pushpins from the map.
       */
      EsriMap.prototype.clearPushpins = function () {
        this._pushpinLayer.clear();
      };
      /**
       * Clears the added highlighted pushpins from the map.
       */
      EsriMap.prototype.clearHighlights = function () {
        this._highlightLayer.clear();
      };
      EsriMap.prototype._activateSelection = function (esriMode) {
        this.app.trace.log(
          'Activating draw toolbar: {0}'.format(esriMode),
          amanda.diagnostics.LogLevel.debug
        );
        this._drawingTool.activate(esriMode);
        this._drawingActive = true;
      };
      EsriMap.prototype._deactivateSelection = function () {
        this.app.trace.log(
          'Deactivating draw toolbar',
          amanda.diagnostics.LogLevel.debug
        );
        this._drawingTool.deactivate();
        this._drawingActive = false;
        if (this._drawEventHandle) {
          this._drawEventHandle.remove();
          this._drawEventHandle = null;
        }
      };
      /**
       * Makes sure that the highlight pushpins are on top on the pushpins, and
       * that all pushpins are on top of all other graphics layers.
       */
      EsriMap.prototype.ensurePushpinsOntop = function () {
        if (this._esriMap.graphicsLayerIds) {
          var index = this._esriMap.graphicsLayerIds.length - 1;
          var pushpinIx = this._esriMap.graphicsLayerIds.indexOf(
            this._pushpinLayer.id
          );
          var hpushpinIx = this._esriMap.graphicsLayerIds.indexOf(
            this._highlightLayer.id
          );
          // no need to reorder them if they are in correct order
          if (pushpinIx !== index - 1 || hpushpinIx !== index) {
            // reorder to the end
            this._esriMap.reorderLayer(this._pushpinLayer, index);
            // reorder to the end - highlights always on top
            this._esriMap.reorderLayer(this._highlightLayer, index);
          }
        }
      };
      EsriMap.prototype.clearMapMode = function () {
        this._deactivateSelection();
      };
      /**
       * Puts the map into selection mode and returns a geometry via the callback.
       * @param mode The {@link SelectionType} to set the map in.
       * @param selectedCallback The callback which will be fired upon user geometry capture.
       */
      EsriMap.prototype.captureSelection = function (
        mode,
        selectedCallback,
        options
      ) {
        var _this = this;
        var draw = true;
        if (this._drawingActive) {
          this.app.trace.log(
            'Selection already active, deactivating previous selection',
            amanda.diagnostics.LogLevel.debug
          );
          this._deactivateSelection();
        }
        if (mode) {
          this.app.events.mapModeChanged(mode);
          this.app.trace.log(
            "'{0}' selection mode received".format(mode),
            amanda.diagnostics.LogLevel.debug
          );
          mode = mode.toUpperCase();
          var esriMode = null;
          if (mode === map_1.SelectionType.rectSelect) {
            esriMode = esri.toolbars.Draw.RECTANGLE;
          } else if (mode === map_1.SelectionType.polySelect) {
            esriMode = esri.toolbars.Draw.POLYGON;
          } else if (mode === map_1.SelectionType.pointSelect) {
            esriMode = esri.toolbars.Draw.POINT;
          } else {
            // default
            this._deactivateSelection();
            draw = false;
          }
          if (draw) {
            if (this._drawEventHandle) {
              this._drawEventHandle.remove();
              this._drawEventHandle = null;
            }
            this._drawEventHandle = this._drawingTool.on(
              'draw-complete',
              function (drawEvent) {
                _this.app.trace.log(
                  'Draw completed',
                  amanda.diagnostics.LogLevel.debug
                );
                _this
                  ._performMapModeBuffer(
                    drawEvent.geometry,
                    options.bufferUnit,
                    options.bufferDistance
                  )
                  .then(function (geometry) {
                    var payload = new amanda.events.Payload();
                    payload.messageType =
                      amanda.events.EventType.geometrySelectionCaptured;
                    payload.mapMode = mode.toLowerCase();
                    _this.app.events.emitEvent(payload);
                    selectedCallback(geometry);
                  })
                  .catch(function (error) {
                    _this.app.trace.logError(
                      'Failed to buffer the map selection point.',
                      error
                    );
                  });
              }
            );
            this._activateSelection(esriMode);
          }
        } else {
          this.app.trace.log(
            'Selection mode was null or undefined',
            amanda.diagnostics.LogLevel.error
          );
        }
      };
      EsriMap.prototype.zoomToSelection = function (extent) {
        var toZoom = extent
          ? extent
          : esri.graphicsExtent(this._pushpinLayer.graphics).expand(1.6);
        this._esriMap.setExtent(toZoom);
      };
      EsriMap.prototype._performMapModeBuffer = function (
        geometry,
        bufferUnit,
        bufferDistance
      ) {
        var _this = this;
        return new Promise(function (resolve, reject) {
          if (!bufferUnit || !bufferDistance) {
            _this.app.trace.log(
              'Selection will not be buffered, no unit or distance specified.',
              amanda.diagnostics.LogLevel.debug
            );
            resolve(geometry);
          } else {
            var bufferTask = new map.Buffer(_this.geometryServiceUrl);
            bufferTask.bufferParams.distances.push(bufferDistance);
            bufferTask.bufferParams.geometries.push(geometry);
            bufferTask.bufferParams.outSpatialReference =
              _this._esriMap.spatialReference;
            bufferTask.bufferParams.unit = map_1.Buffer.toEsriUnit(bufferUnit);
            bufferTask
              .perform()
              .then(function (bufferedGeometries) {
                resolve(bufferedGeometries[0]);
              })
              .catch(function (error) {
                reject(error);
              });
          }
        });
      };
      return EsriMap;
    })();
    map_1.EsriMap = EsriMap;
  })((map = amanda.map || (amanda.map = {})));
})(amanda || (amanda = {}));
var amanda;
(function (amanda) {
  var map;
  (function (map) {
    /**
     * A wrapper for an Esri QueryTask.
     */
    var Query = (function () {
      /**
       * Constructs a new instance of {@link Query}.
       * @param url The url of the Esri Query REST endpoint.
       */
      function Query(url) {
        this.queryParams = new esri.tasks.Query();
        this.queryParams.outFields = [];
        this.queryParams.returnGeometry = true;
        this._queryTask = new esri.tasks.QueryTask(url);
      }
      /**
       * Performs the Query. Access results via the deferred object.
       * @returns A Promise.
       */
      Query.prototype.perform = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
          _this._queryTask.execute(_this.queryParams, resolve, reject);
        });
      };
      return Query;
    })();
    map.Query = Query;
  })((map = amanda.map || (amanda.map = {})));
})(amanda || (amanda = {}));
var amanda;
(function (amanda) {
  var commands;
  (function (commands) {
    /**
     * Class used for initializing message handling and passing messages to the wrapping AMANDA 7 instance.
     */
    var CommandHandler = (function () {
      /**
       * Constructs a new {@link CommandHandler} object.
       * @param app The appication.
       */
      function CommandHandler(app) {
        /**
         * Map object of commands held in this registry.
         */
        this.namedCommands = {};
        this.app = app;
        this.messageHandlerRegistered = false;
        this.initialized = false;
      }
      /**
       * Initializes the object from an {@link InitializationOptions}.
       * @param options The {@link InitializationOptions}.
       */
      CommandHandler.prototype.initialize = function (options) {
        this.initialized = true;
      };
      /**
       * Registers the message handler.
       */
      CommandHandler.prototype.registerMessageHandler = function () {
        var _this = this;
        if (window.addEventListener) {
          window.addEventListener(
            'message',
            function (event) {
              return _this._handleAMANDACommand(event);
            },
            false
          ); // FF,SA,CH,OP,IE9+
          this.app.trace.log(
            'FF,SA,CH,OP,IE9+ message handler registered',
            amanda.diagnostics.LogLevel.debug
          );
          this.messageHandlerRegistered = true;
        } else if (window.attachEvent) {
          window.attachEvent('onmessage', function (event) {
            return _this._handleAMANDACommand(event);
          }); // IE8 although we do not officially support this in AMANDA 7
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
      };
      /**
       * Created and registers a command with the command framework.
       * @param commandName The name of the command. Must be unique or commands will be overwritten.
       * @param scope The scope of 'This' when the command is executed.
       * @param func The imeplementation of the command.
       */
      CommandHandler.prototype.registerCommand = function (
        commandName,
        scope,
        func
      ) {
        if (!commandName || !scope || !func) {
          this.app.trace.log(
            "'commandName', 'scope' and 'func' are required for creating commands".format(
              commandName
            ),
            amanda.diagnostics.LogLevel.error
          );
          return;
        }
        commandName = commandName.toLowerCase();
        if (this._commandExists(commandName)) {
          this.app.trace.log(
            "Overwriting the command '{0}'".format(commandName),
            amanda.diagnostics.LogLevel.warning
          );
        }
        var command = new commands.Command(this.app, commandName, scope, func);
        this.namedCommands[commandName] = command;
        this.app.trace.log(
          "Command '{0}' added to the registry".format(commandName),
          amanda.diagnostics.LogLevel.debug
        );
      };
      /**
       * Unregisters a command from the command framework.
       * @param commandName The name of the command to remove.
       */
      CommandHandler.prototype.unregisterCommand = function (commandName) {
        if (commandName && this._commandExists(commandName)) {
          commandName = commandName.toLowerCase();
          delete this.namedCommands[commandName];
          this.app.trace.log(
            "Unregistered command '{0}'".format(commandName),
            amanda.diagnostics.LogLevel.debug
          );
        }
      };
      CommandHandler.prototype._commandExists = function (commandName) {
        if (this.namedCommands[commandName]) {
          return true;
        }
        return false;
      };
      CommandHandler.prototype._handleAMANDACommand = function (browserEvent) {
        if (!browserEvent || !browserEvent.data) {
          this.app.trace.log(
            'Command or Command data not found',
            amanda.diagnostics.LogLevel.warning
          );
          return;
        }
        var commandPayload = commands.Payload.fromJson(browserEvent.data);
        if (!commandPayload || !commandPayload.messageType) {
          this.app.trace.log(
            'Command received, but did not contain a messageType key. Cannot execute any command',
            amanda.diagnostics.LogLevel.error
          );
          return;
        } else {
          this.app.trace.log(
            "Command '{0}' received from AMANDA".format(
              commandPayload.messageType
            ),
            amanda.diagnostics.LogLevel.debug
          );
        }
        var commandName = commandPayload.messageType.toLowerCase();
        if (this.namedCommands[commandName]) {
          this.namedCommands[commandName].execute(commandPayload);
        } else {
          this.app.trace.log(
            "Command '{0}' not handled".format(commandName),
            amanda.diagnostics.LogLevel.error
          );
        }
      };
      return CommandHandler;
    })();
    commands.CommandHandler = CommandHandler;
  })((commands = amanda.commands || (amanda.commands = {})));
})(amanda || (amanda = {}));
var amanda;
(function (amanda) {
  var utils;
  (function (utils) {
    /**
     * Class which contains helper methods for working with ESRI graphics.
     */
    var GraphicHelper = (function () {
      function GraphicHelper() {}
      /**
       * Returns a graphic which has a selected style symbol.
       * @param point The point associated with the pushpin.
       * @returns An ESRI graphic with the symbol and the point
       */
      GraphicHelper.createPushpinGraphic = function (point, image) {
        return new esri.Graphic(
          point,
          GraphicHelper.getSelectedSymbol(image),
          null
        );
      };
      /**
       * Returns a highlighted symbol.
       * @returns A highlighted symbol.
       */
      GraphicHelper.getHighlightedSymbol = function (imageUrl) {
        if (imageUrl === void 0) {
          imageUrl = null;
        }
        var defaultImageUrl =
          './resources/images/pushpins/map-marker-blue-32.png';
        if (!imageUrl) {
          imageUrl = defaultImageUrl;
        }
        return new esri.symbol.PictureMarkerSymbol({
          angle: 0,
          xoffset: 0,
          yoffset: 16,
          type: 'esriPMS',
          url: imageUrl,
          contentType: 'image/png',
          width: 32,
          height: 32,
        });
      };
      /**
       * Returns a selected symbol.
       * @returns A selected symbol.
       */
      GraphicHelper.getSelectedSymbol = function (imageUrl) {
        if (imageUrl === void 0) {
          imageUrl = null;
        }
        var defaultImageUrl =
          './resources/images/pushpins/map-marker-red-32.png';
        if (!imageUrl) {
          imageUrl = defaultImageUrl;
        }
        return new esri.symbol.PictureMarkerSymbol({
          angle: 0,
          xoffset: 0,
          yoffset: 16,
          type: 'esriPMS',
          url: imageUrl,
          contentType: 'image/png',
          width: 32,
          height: 32,
        });
      };
      /**
       * Tags a graphic with Amanda attributes for identification later.
       * @param graphic The Graphic which the tags will be set to.
       * @param layerName The name of the layer which the graphic belongs to.
       * @param commandName The name of the command which created this graphic.
       * @param gisId The ID of the feature to which this graphic represents.
       */
      GraphicHelper.setTags = function (
        graphic,
        layerName,
        commandName,
        gisId
      ) {
        if (!graphic) {
          return;
        }
        if (layerName) {
          graphic['__amandaLayerName'] = layerName;
        }
        if (commandName) {
          graphic['__amandaCommand'] = commandName;
        }
        if (gisId) {
          graphic['__amandaGISID'] = gisId;
        }
      };
      /**
       * Extracts AMANDA tags from a graphic.
       * @param graphic The graphic to extract tags from.
       * @returns The extracted tags.
       */
      GraphicHelper.extractTags = function (graphic) {
        var layerName = null;
        var commandName = null;
        var gisId = null;
        if (!graphic) {
          return null;
        }
        if (graphic['__amandaLayerName']) {
          layerName = graphic['__amandaLayerName'];
        }
        if (graphic['__amandaCommand']) {
          commandName = graphic['__amandaCommand'];
        }
        if (graphic['__amandaGISID']) {
          gisId = graphic['__amandaGISID'];
        }
        var tags = {
          layerName: layerName,
          commandName: commandName,
          gisId: gisId,
        };
        return tags;
      };
      /**
       * Gets the centroid of a graphic. Supports Point, Polygon, Extent and Polyline.
       * @param graphic The graphic to find the centroid of.
       * @returns The calculated centroid.
       */
      GraphicHelper.getCentroid = function (graphic) {
        var point = null;
        if (graphic && graphic.geometry) {
          var geometry = graphic.geometry;
          if (geometry instanceof esri.geometry.Point) {
            point = geometry;
          } else if (geometry instanceof esri.geometry.Polygon) {
            point = geometry.getCentroid();
          } else if (geometry instanceof esri.geometry.Extent) {
            point = geometry.getCenter();
          } else if (geometry instanceof esri.geometry.Polyline) {
            var polyline = geometry;
            point = polyline.getExtent().getCenter();
          }
        }
        return point;
      };
      return GraphicHelper;
    })();
    utils.GraphicHelper = GraphicHelper;
  })((utils = amanda.utils || (amanda.utils = {})));
})(amanda || (amanda = {}));
var amanda;
(function (amanda) {
  var utils;
  (function (utils) {
    /**
     * Class which contains helper methods relating to query.
     */
    var QueryHelper = (function () {
      function QueryHelper() {}
      /**
       * Creates a where clause using the supplied parameters
       * @param field The field name to use.
       * @param ids The ids to include.
       * @param isString Options parameter if the field uses string values or not.
       * @returns The generated where clause.
       */
      QueryHelper.generateWhereClause = function (field, ids, isString) {
        var concatIds = '';
        var clause = '';
        if (isString) {
          concatIds = ids.join("','");
          clause = field + " in ('" + concatIds + "')";
        } else {
          concatIds = ids.join(',');
          clause = field + ' in (' + concatIds + ')';
        }
        return clause;
      };
      /**
       * Creates a where clause using the supplied parameters.
       * @param layer The layer.
       * @param fieldName The field name.
       * @returns If the field is of string type or not.
       */
      QueryHelper.isFieldStringType = function (layer, fieldName) {
        var isString = false;
        if (layer && layer.getLayerFields() && fieldName) {
          fieldName = fieldName.toUpperCase();
          var fields = layer.getLayerFields();
          for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            if (
              field.name.toUpperCase() === fieldName ||
              field.alias.toUpperCase() === fieldName
            ) {
              if (field.type === 'esriFieldTypeString') {
                isString = true;
              }
              break;
            }
          }
        }
        return isString;
      };
      return QueryHelper;
    })();
    utils.QueryHelper = QueryHelper;
  })((utils = amanda.utils || (amanda.utils = {})));
})(amanda || (amanda = {}));
///<reference path="../../_defs/gvhsdk.d.ts" />
///<reference path="../../_defs/bluebird.d.ts" />
var _this = this;
// legacy dojo require
dojo.require('esri.map');
dojo.require('esri.config');
dojo.require('esri.toolbars.draw');
dojo.require('esri.tasks.query');
dojo.require('esri.layers.ArcGISDynamicMapServiceLayer');
dojo.require('esri.layers.FeatureLayer');
dojo.require('esri.layers.ArcGISTiledMapServiceLayer');
dojo.require('esri.tasks.GeometryService');
dojo.require('esri.tasks.BufferParameters');
var amandaApp = null;
var amanda;
(function (amanda) {
  amanda.version = '1.0.3';
})(amanda || (amanda = {}));
// define a method called amanda.initialize on the window
// this is the main point of entry for the library
amanda.initialize = function (map, options) {
  return new Promise(function (resolve, reject) {
    dojo.ready(function () {
      amandaApp = new amanda.AmandaApp();
      amandaApp.initialize(map, options);
      resolve(_this.amandaApp);
    });
  });
};
var amanda;
(function (amanda) {
  var events;
  (function (events) {
    /**
     * Event types which are passed back from the AMANDA GIS Widgets library to wrapping AMANDA 7 instance.
     */
    var EventType;
    (function (EventType) {
      /**
       * Map Ready / Map Initialized event.
       * Is fired when the first layer is available in the {@link map.IMap}.
       * Value: "INITIALIZED"
       */
      EventType.initialized = 'INITIALIZED';
      /**
       * Feature Hover.
       * Is fired when a pushpin is hovered over with the mouse.
       * Value: "FEATURE_HOVER"
       */
      EventType.featureHover = 'SELECTED_HOVER';
      /**
       * Selected Click.
       * Is fired when a pushpin is clicked on.
       * Value: "SELECTED_CLICKED"
       */
      EventType.selectedclick = 'SELECTED_CLICKED';
      /**
       * Map Mode Changed.
       * Is fired when the maps selection mode changes.
       * Value: "MAP_MODE_CHANGED"
       */
      EventType.mapModeChanged = 'MAP_MODE_CHANGED';
      /**
       * Features Selected.
       * Is fired when features are selected on the map.
       * Value: "FEATURES_SELECTED"
       */
      EventType.featuresSelected = 'FEATURES_SELECTED';
      /**
       * Features Selected by Geometry.
       * Is fired when features are selected on the map.
       * Value: "FEATURES_SELECTED"
       */
      EventType.featuresSelectedByGeometry = 'FEATURES_SELECTED_BY_GEOMETRY';
      /**
       * Selected Features Visible on Map.
       * Is fired when selected features are visible on the map.
       * Value: "SELECTED_FEATURES_VISIBLE_ON_MAP"
       */
      EventType.selectedFeaturesVisible = 'SELECTED_FEATURES_VISIBLE_ON_MAP';
      /**
       * Deselected.
       * Is fired when features are delected on the map.
       * Value: "DESELECTED"
       */
      EventType.deselected = 'DESELECTED';
      /**
       * Buffer Search Results.
       * Is fired when features are found using the Buffer Search operation.
       * Value: "BUFFER_SEARCH_RESULTS"
       */
      EventType.bufferSearchResults = 'BUFFER_SEARCH_RESULTS';
      /**
       * Visibility Changed.
       * Is fired when a layer's visibility is changed.
       * Value: "VISIBILITY_CHANGED"
       */
      EventType.visibilitySet = 'VISIBILITY_CHANGED';
      /**
       * Map Extent Changed.
       * Is fired when a map's extent is changed.
       * Value: "MAP_EXTENT_CHANGED"
       */
      EventType.mapExtentChanged = 'MAP_EXTENT_CHANGED';
      /**
       * Geometry Selection Captured.
       * Fired when a user makes a geometry selection, before an action is performed.
       * Value: "GEOMETRY_SELECTION_CAPTURED"
       */
      EventType.geometrySelectionCaptured = 'GEOMETRY_SELECTION_CAPTURED';
    })((EventType = events.EventType || (events.EventType = {})));
  })((events = amanda.events || (amanda.events = {})));
})(amanda || (amanda = {}));
var amanda;
(function (amanda) {
  var commands;
  (function (commands) {
    /**
     * Represents command structure which are passed from AMANDA 7 to the embedded AMANDA GIS Widgets enabled map viewer.
     * When passing a {@link Payload} for a custom command, take advantage of the 'custom' member as a container for <any> values.
     */
    var Payload = (function () {
      /**
       * Constructs a new instance of {@link Payload}.
       */
      function Payload() {
        /**
         * Optional: Whether Select features is limited on the current map extent or not.
         * Default is False.
         */
        this.filterByCurrentMapExtent = false;
      }
      /**
       * Returns a new instance of {@link Payload} created from serialized JSON.
       * @param json The JSON to deserialize.
       * @returns The created {@link Payload}.
       */
      Payload.fromJson = function (json) {
        var jsonRep = JSON.parse(json);
        var payload = new Payload();
        if (jsonRep['messageType']) {
          payload.messageType = jsonRep.messageType;
        }
        if (jsonRep['layerName']) {
          payload.layerName = jsonRep.layerName;
        }
        if (jsonRep['fieldName']) {
          payload.fieldName = jsonRep.fieldName;
        }
        if (jsonRep['scale']) {
          payload.scale = jsonRep.scale;
        }
        if (jsonRep['filterByCurrentMapExtent']) {
          payload.filterByCurrentMapExtent = jsonRep.filterByCurrentMapExtent;
        }
        if (jsonRep['where']) {
          payload.where = jsonRep.where;
        }
        if (jsonRep['features']) {
          payload.features = jsonRep.features;
        }
        if (jsonRep['feature']) {
          payload.feature = jsonRep.feature;
        }
        if (jsonRep['mapMode']) {
          payload.mapMode = jsonRep.mapMode;
        }
        if (jsonRep['sourceLayerName']) {
          payload.sourceLayerName = jsonRep.sourceLayerName;
        }
        if (jsonRep['infoTitle']) {
          payload.infoTitle = jsonRep.infoTitle;
        }
        if (jsonRep['infoContent']) {
          payload.infoContent = jsonRep.infoContent;
        }
        if (jsonRep['distance']) {
          payload.distance = jsonRep.distance;
        }
        if (jsonRep['sourceFieldName']) {
          payload.sourceFieldName = jsonRep.sourceFieldName;
        }
        if (jsonRep['visibility']) {
          payload.visibility = jsonRep.visibility;
        }
        if (jsonRep['custom']) {
          payload.custom = jsonRep.custom;
        }
        if (jsonRep['bufferUnit']) {
          payload.bufferUnit = jsonRep.bufferUnit;
        }
        return payload;
      };
      return Payload;
    })();
    commands.Payload = Payload;
  })((commands = amanda.commands || (amanda.commands = {})));
})(amanda || (amanda = {}));
var amanda;
(function (amanda) {
  var map;
  (function (map) {
    /**
     * The types of map selections which can be made.
     */
    var SelectionType;
    (function (SelectionType) {
      /**
       * Value: POLYGON
       */
      SelectionType.polySelect = 'POLYGON';
      /**
       * Value: POINT
       */
      SelectionType.pointSelect = 'POINT';
      /**
       * Value: RECTANGLE
       */
      SelectionType.rectSelect = 'RECTANGLE';
      /**
       * Value: DEFAULT
       */
      SelectionType.defaultSelect = 'DEFAULT';
    })((SelectionType = map.SelectionType || (map.SelectionType = {})));
    var DistanceUnit;
    (function (DistanceUnit) {
      /**
       * Value: METER
       */
      DistanceUnit.meter = 'METER';
      /**
       * Value: FOOT
       */
      DistanceUnit.foot = 'FOOT';
    })((DistanceUnit = map.DistanceUnit || (map.DistanceUnit = {})));
  })((map = amanda.map || (amanda.map = {})));
})(amanda || (amanda = {}));
var amanda;
(function (amanda) {
  var diagnostics;
  (function (diagnostics) {
    /**
     * Represents a {@link Logger} which is used for logging messages and errors to the browser's console.
     */
    var Logger = (function () {
      /**
       * Constructs a new instance of {@link Logger}.
       * @param app The {@link AmandaApp} which this component is linked to.
       */
      function Logger(app) {
        this.logLevelMap = [
          { level: diagnostics.LogLevel.debug, order: 1 },
          { level: diagnostics.LogLevel.warning, order: 2 },
          { level: diagnostics.LogLevel.error, order: 3 },
        ];
        this._logStart = 'AMANDA GIS Widgets';
        this._logLevel = diagnostics.LogLevel.warning;
        /**
         * Indicates if the {@link InitializationOptions} have been applied.
         */
        this.initialized = false;
        this.app = app;
      }
      /**
       * Logs a simple string message with a log level.
       * Will only log if the specified {@link LogLevel} is the same or greater than what is specified on the {@link AmandaApp}.
       * @param message The message to publish.
       * @param messageLogLevel The {@link LogLevel} of the message.
       */
      Logger.prototype.log = function (message, messageLogLevel) {
        if (
          this._getLogLevel(messageLogLevel) >=
          this._getLogLevel(this._logLevel)
        ) {
          if (messageLogLevel) {
            this._writeLog(
              '{0} {1}: [{2}] {3}'.format(
                this._logStart,
                this.getDate(),
                messageLogLevel,
                message
              )
            );
          } else {
            this._writeLog(this._logStart + Date() + ': ' + message);
            this._writeLog(
              '{0} {1}: {2})'.format(this._logStart, this.getDate(), message)
            );
          }
        }
      };
      /**
       * Logs a message with an {@link Error} object.
       * Will log under {@link LogLevel} error level.
       * @param message The message to publish.
       * @param error The {@link Error}.
       */
      Logger.prototype.logError = function (message, error) {
        this._writeLog(
          '{0} {1}: [{2}] {3} Reason: {4}'.format(
            this._logStart,
            this.getDate(),
            diagnostics.LogLevel.error,
            message,
            error ? error.message : 'No details available'
          )
        );
      };
      Logger.prototype.getDate = function () {
        var date = new Date();
        return '{0}:{1}:{2}.{3}'.format(
          this._padDigits(date.getHours(), 2),
          this._padDigits(date.getMinutes(), 2),
          this._padDigits(date.getSeconds(), 2),
          this._padDigits(date.getMilliseconds(), 3)
        );
      };
      Logger.prototype._writeLog = function (message) {
        console.log(message);
      };
      Logger.prototype._getLogLevel = function (level) {
        for (var i = 0; i < this.logLevelMap.length; i++) {
          if (level === this.logLevelMap[i].level) {
            return this.logLevelMap[i].order;
          }
        }
      };
      Logger.prototype._padDigits = function (num, totalDigits, left) {
        if (left == null) {
          left = true;
        }
        var numString = num.toString();
        var padding = '';
        if (totalDigits > numString.length) {
          for (var i = 0; i < totalDigits - numString.length; i++) {
            padding += '0';
          }
        }
        return left
          ? padding.toString() + numString
          : numString + padding.toString();
      };
      /**
       * Initializes the object from an {@link InitializationOptions}.
       * @param options The {@link InitializationOptions}.
       */
      Logger.prototype.initialize = function (options) {
        if (options && !!options['logLevel']) {
          var level = options.logLevel;
          if (
            level === diagnostics.LogLevel.debug ||
            level === diagnostics.LogLevel.warning ||
            level === diagnostics.LogLevel.error
          ) {
            this._logLevel = level;
            this.log(
              'Log level set to {0} from configuration'.format(level),
              diagnostics.LogLevel.debug
            );
          } else {
            this.log(
              'Specified log level of {0} was not recognized. Values must be {1}, {2} or {3}'.format(
                level,
                diagnostics.LogLevel.debug,
                diagnostics.LogLevel.warning,
                diagnostics.LogLevel.error
              ),
              diagnostics.LogLevel.warning
            );
          }
        }
        this.initialized = true;
      };
      return Logger;
    })();
    diagnostics.Logger = Logger;
  })((diagnostics = amanda.diagnostics || (amanda.diagnostics = {})));
})(amanda || (amanda = {}));
var amanda;
(function (amanda) {
  var utils;
  (function (utils) {
    /**
     * Class which holds extension methods.
     */
    var Extensions = (function () {
      function Extensions() {}
      /**
       * Checks to make sure required extension methods exist.
       */
      Extensions.checkExtensionMethods = function () {
        if (!String.format) {
          String.prototype.format = function () {
            var formatted = this;
            for (var i = 0; i < arguments.length; i++) {
              var regexp = new RegExp('\\{' + i + '\\}', 'gi');
              formatted = formatted.replace(regexp, arguments[i]);
            }
            return formatted;
          };
        }
      };
      Extensions.getParameterByName = function (name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
          results = regex.exec(location.search);
        return results === null
          ? ''
          : decodeURIComponent(results[1].replace(/\+/g, ' '));
      };
      return Extensions;
    })();
    utils.Extensions = Extensions;
  })((utils = amanda.utils || (amanda.utils = {})));
})(amanda || (amanda = {}));
var amanda;
(function (amanda) {
  var diagnostics;
  (function (diagnostics) {
    /**
     * Strings which are used for log levels.
     */
    var LogLevel;
    (function (LogLevel) {
      /**
       * Represents the Error level.
       * Value: "ERROR"
       * Represents a priority of 3.
       */
      LogLevel.error = 'ERROR';
      /**
       * Represents the Warning level.
       * Value: "WARN"
       * Represents a priority of 2.
       */
      LogLevel.warning = 'WARN';
      /**
       * Represents the Debug level.
       * Value: "DEBUG"
       * Represents a priority of 1.
       */
      LogLevel.debug = 'DEBUG';
    })((LogLevel = diagnostics.LogLevel || (diagnostics.LogLevel = {})));
  })((diagnostics = amanda.diagnostics || (amanda.diagnostics = {})));
})(amanda || (amanda = {}));
