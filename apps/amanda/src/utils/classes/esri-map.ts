import esri = require('esri');
import amanda = require('amanda');

export class EsriMap {
  private initialized = false;
  private geometryServiceUrl: string | null = null;
  private _defaultGeometryServiceUrl =
    'http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer';
  private _drawingActive = false;
  private _defaultProxyUrl = 'proxy.ashx';
  private _pushpinLayerName = 'pushpins';
  private _hpushpinLayerName = 'highlighted_pushpins';
  private _serviceToken: string | null = null;
  private _serviceUrl: string | null = null;
  private _expandRatio = 2;
  private _esriMap: esri.Map;
  private app: any;
  private layers: any[] = [];
  private _pushpinLayer: esri.layers.GraphicsLayer;
  private _highlightLayer: esri.layers.GraphicsLayer;
  private _drawingTool: esri.toolbars.Draw;
  private _drawEventHandle: any;

  constructor(app: any, map: esri.Map, options?: any) {
    this._esriMap = map;
    this.app = app;
    esri.config.defaults.io.proxyUrl = this._defaultProxyUrl;
    this._parseOptions(options);
    if (!this.geometryServiceUrl) {
      this.geometryServiceUrl = this._defaultGeometryServiceUrl;
      this.app.trace.log(
        `Using default geometry service: '${this._defaultGeometryServiceUrl}'`,
        amanda.diagnostics.LogLevel.debug
      );
    }
    const paramToken = amanda.utils.Extensions.getParameterByName('token');
    if (paramToken) {
      this._serviceToken = paramToken;
      this.app.trace.log(
        'Service token loaded from parent window URL',
        amanda.diagnostics.LogLevel.debug
      );
    }
    this._initialize();
  }

  private _initialize() {
    if (this._esriMap.loaded) {
      this._initializeLayers();
      this._mapInitialized();
    } else {
      this._esriMap.on('load', () => this._mapInitialized());
    }
  }

  private _initializeLayers() {
    if (this._esriMap.graphicsLayerIds) {
      this._esriMap.graphicsLayerIds.forEach((layerId: string) => {
        const args = {
          target: this._esriMap,
          layer: this._esriMap.getLayer(layerId),
        };
        this._handleLayerAdded(args);
      });
    }
    if (this._esriMap.layerIds) {
      this._esriMap.layerIds.forEach((layerId: string) => {
        const args = {
          target: this._esriMap,
          layer: this._esriMap.getLayer(layerId),
        };
        this._handleLayerAdded(args);
      });
    }
  }

  private _mapInitialized() {
    this._pushpinLayer = new esri.layers.GraphicsLayer();
    this._pushpinLayer.id = this._pushpinLayerName;
    this._highlightLayer = new esri.layers.GraphicsLayer();
    this._highlightLayer.id = this._hpushpinLayerName;
    this._esriMap.on('extent-change', (extentChange: any) =>
      this._handleExtentChanged(extentChange)
    );
    this._esriMap.on('layer-add', (args: any) => this._handleLayerAdded(args));
    this._pushpinLayer.on('click', (event: any) =>
      this._handlePushpinClick(event)
    );
    this._pushpinLayer.on('mouse-over', (event: any) =>
      this._handlePushpinMouseOver(event)
    );
    this._pushpinLayer.on('mouse-out', (event: any) =>
      this._handlePushpinMouseOut(event)
    );
    this._highlightLayer.on('click', (event: any) =>
      this._handlePushpinClick(event)
    );
    this._highlightLayer.on('mouse-over', (event: any) =>
      this._handleHighlightMouseOver(event)
    );
    this._esriMap.addLayer(this._pushpinLayer);
    this._esriMap.addLayer(this._highlightLayer);
    this._drawingTool = new esri.toolbars.Draw(this._esriMap);
    this._esriMap.setInfoWindowOnClick(false);
    this.initialized = true;
    this.app.events.mapReady();
  }

  private _parseOptions(options: any) {
    if (options) {
      if (options['proxyUrl']) {
        const url = options['proxyUrl'];
        esri.config.defaults.io.proxyUrl = url;
        this.app.trace.log(
          `Proxy URL set to: ${url}`,
          amanda.diagnostics.LogLevel.debug
        );
      }
      if (options['serviceToken'] && !this._serviceToken) {
        this._serviceToken = options['serviceToken'];
        this.app.trace.log(
          'Service token loaded from configuration',
          amanda.diagnostics.LogLevel.debug
        );
      }
      if (options['serviceUrl']) {
        this._serviceUrl = options['serviceUrl'];
        this.app.trace.log(
          `Service URL loaded from configuration`,
          amanda.diagnostics.LogLevel.debug
        );
      }
      if (options['expandRatio']) {
        this._expandRatio = options['expandRatio'];
        this.app.trace.log(
          `Expand ratio loaded from configuration`,
          amanda.diagnostics.LogLevel.debug
        );
      }
      if (options['geometryServiceUrl']) {
        this.geometryServiceUrl = options.geometryServiceUrl;
        this.app.trace.log(
          `Geometry Service Url set to ${this.geometryServiceUrl} from configuration`,
          amanda.diagnostics.LogLevel.debug
        );
      }
    } else {
      this.app.trace.log(
        'Service URL was not specified. CSDC Feature Service tokens cannot be replaced.',
        amanda.diagnostics.LogLevel.warning
      );
    }
  }

  public setExtent(extent: any) {
    if (extent) {
      extent = extent.expand(this._expandRatio);
      this._esriMap.setExtent(extent);
      this.app.trace.log(
        `Setting extent with expand ratio of ${this._expandRatio}`,
        amanda.diagnostics.LogLevel.debug
      );
    }
  }

  private _handleLayerAdded(args: any) {
    const layer = args.layer;
    let amandaLayer = null;
    if (layer instanceof esri.layers.ArcGISDynamicMapServiceLayer) {
      const dynamic = layer;
      const infos = dynamic.layerInfos;
      infos.forEach((info: any) => {
        if (!info.subLayerIds) {
          amandaLayer = amanda.EsriLayer.createFromLayerInfo(layer, info);
          this._handleAddLayer(amandaLayer, layer);
        }
      });
    } else if (layer instanceof esri.layers.FeatureLayer) {
      const featureLayer = layer;
      featureLayer.setInfoTemplate(null);
      if (featureLayer.name) {
        amandaLayer = amanda.EsriLayer.createFromFeatureLayer(featureLayer);
        this._handleAddLayer(amandaLayer, layer);
      }
    }
  }

  private _handleAddLayer(amandaLayer: any, layer: any) {
    if (amandaLayer) {
      if (
        this._serviceToken &&
        this._serviceUrl &&
        layer &&
        layer._url &&
        layer.url.toLowerCase().indexOf(this._serviceUrl.toLowerCase()) > -1 &&
        layer.url.toLowerCase().indexOf('token') > -1
      ) {
        const _url = layer._url;
        if (_url.query) {
          _url.query.token = this._serviceToken;
          const queryString = dojo.objectToQuery(_url.query);
          layer.url = _url.path + (queryString ? `?${queryString}` : '');
          this.app.trace.log(
            `Replacing AMANDA Cloud URL token on layer: '${amandaLayer.name}'`,
            amanda.diagnostics.LogLevel.debug
          );
        }
        if (layer instanceof esri.layers.FeatureLayer) {
          const _task = layer._task;
          if (_task && _task._url && _task._url.query) {
            _task._url.query.token = this._serviceToken;
            this.app.trace.log(
              `Replacing AMANDA Cloud token on FeatureService task on layer: '${amandaLayer.name}'`,
              amanda.diagnostics.LogLevel.debug
            );
          }
        }
      }
      this.layers.push(amandaLayer);
      this.app.trace.log(
        `Layer '${amandaLayer.name}' was added and will be available to participate in AMANDA GIS operations.`,
        amanda.diagnostics.LogLevel.debug
      );
    }
  }

  private _handlePushpinClick(event: any) {
    if (event && event.graphic) {
      const tags = amanda.utils.GraphicHelper.extractTags(event.graphic);
      this.app.events.selectedClick(tags.layerName, tags.gisId);
    }
  }

  private _handleExtentChanged(extentChanged: any) {
    if (extentChanged && extentChanged.extent) {
      const extent = extentChanged.extent;
      if (this._mapHasActivePushpins()) {
        const visibleFeatures: any[] = [];
        const pushpins = this._getPushpinGraphics();
        pushpins.forEach((pushpin: any) => {
          const point = pushpin.geometry;
          if (extent.contains(point)) {
            const tags = amanda.utils.GraphicHelper.extractTags(pushpin);
            const insertIndex = this._getVisibleResultsLayerIndex(
              tags.layerName,
              visibleFeatures
            );
            if (insertIndex < 0) {
              visibleFeatures.push({
                layerName: tags.layerName,
                features: [tags.gisId],
              });
            } else {
              visibleFeatures[insertIndex].features.push(tags.gisId);
            }
          }
        });
        this.app.events.selectedFeaturesVisibleOnMap(visibleFeatures);
      }
      this.app.events.mapExtentChanged();
    }
  }

  private _getVisibleResultsLayerIndex(
    layerName: string,
    visibleFeatures: any[]
  ) {
    let existsAtIndex = -1;
    if (layerName && visibleFeatures && visibleFeatures.length) {
      visibleFeatures.forEach((visLayer: any, index: number) => {
        if (
          visLayer.layerName &&
          visLayer.layerName.toLowerCase() === layerName.toLowerCase()
        ) {
          existsAtIndex = index;
        }
      });
    }
    return existsAtIndex;
  }

  public getMapCommandImplementation() {
    return new amanda.commands.EsriCommandImpl(this.app);
  }

  public async getLayerByName(name: string) {
    if (!name) return null;

    while (this.layers.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const layer = this.layers.find(
      (layer: any) =>
        name.toLowerCase().trim() === layer.name.toLowerCase().trim()
    );
    if (!layer) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.app.trace.log(
        `Could not find a layer with name: '${name}'. Cannot execute command.`,
        amanda.diagnostics.LogLevel.error
      );
    }
    return layer;
  }

  public getGISMap() {
    return this._esriMap;
  }

  private _mapHasActivePushpins() {
    return this._getPushpinGraphics().length > 0;
  }

  private _getPushpinGraphics() {
    return this._pushpinLayer && this._pushpinLayer.graphics
      ? this._pushpinLayer.graphics
      : [];
  }

  public addPushpin(graphic: any) {
    if (graphic && graphic.geometry) {
      const newGeometry = amanda.utils.GraphicHelper.getCentroid(graphic);
      graphic.setGeometry(newGeometry);
      graphic.setSymbol(
        amanda.utils.GraphicHelper.getSelectedSymbol(
          this.app.configOptions.pushpinImage
        )
      );
      this._pushpinLayer.add(graphic);
    }
  }

  public addHighlight(graphic: any) {
    if (graphic && graphic.geometry) {
      const newGeometry = amanda.utils.GraphicHelper.getCentroid(graphic);
      graphic.setGeometry(newGeometry);
      graphic.setSymbol(
        amanda.utils.GraphicHelper.getHighlightedSymbol(
          this.app.configOptions.highlightedPushpinImage
        )
      );
      this._highlightLayer.add(graphic);
    }
  }

  public clearPushpins() {
    this._pushpinLayer.clear();
  }

  public clearHighlights() {
    this._highlightLayer.clear();
  }

  private _activateSelection(esriMode: any) {
    this.app.trace.log(
      `Activating draw toolbar: ${esriMode}`,
      amanda.diagnostics.LogLevel.debug
    );
    this._drawingTool.activate(esriMode);
    this._drawingActive = true;
  }

  private _deactivateSelection() {
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
  }

  public ensurePushpinsOntop() {
    if (this._esriMap.graphicsLayerIds) {
      const index = this._esriMap.graphicsLayerIds.length - 1;
      const pushpinIx = this._esriMap.graphicsLayerIds.indexOf(
        this._pushpinLayer.id
      );
      const hpushpinIx = this._esriMap.graphicsLayerIds.indexOf(
        this._highlightLayer.id
      );
      if (pushpinIx !== index - 1 || hpushpinIx !== index) {
        this._esriMap.reorderLayer(this._pushpinLayer, index);
        this._esriMap.reorderLayer(this._highlightLayer, index);
      }
    }
  }

  public clearMapMode() {
    this._deactivateSelection();
  }

  public captureSelection(
    mode: string,
    selectedCallback: (geometry: any) => void,
    options: any
  ) {
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
        `'${mode}' selection mode received`,
        amanda.diagnostics.LogLevel.debug
      );
      mode = mode.toUpperCase();
      let esriMode: any = null;
      if (mode === 'RECTSELECT') {
        esriMode = esri.toolbars.Draw.RECTANGLE;
      } else if (mode === 'POLYSELECT') {
        esriMode = esri.toolbars.Draw.POLYGON;
      } else if (mode === 'POINTSELECT') {
        esriMode = esri.toolbars.Draw.POINT;
      } else {
        this._deactivateSelection();
        return;
      }
      if (this._drawEventHandle) {
        this._drawEventHandle.remove();
        this._drawEventHandle = null;
      }
      this._drawEventHandle = this._drawingTool.on(
        'draw-complete',
        (drawEvent: any) => {
          this.app.trace.log(
            'Draw completed',
            amanda.diagnostics.LogLevel.debug
          );
          this._performMapModeBuffer(
            drawEvent.geometry,
            options.bufferUnit,
            options.bufferDistance
          )
            .then((geometry: any) => {
              const payload = new amanda.events.Payload();
              payload.messageType =
                amanda.events.EventType.geometrySelectionCaptured;
              payload.mapMode = mode.toLowerCase();
              this.app.events.emitEvent(payload);
              selectedCallback(geometry);
            })
            .catch((error: any) => {
              this.app.trace.logError(
                'Failed to buffer the map selection point.',
                error
              );
            });
        }
      );
      this._activateSelection(esriMode);
    } else {
      this.app.trace.log(
        'Selection mode was null or undefined',
        amanda.diagnostics.LogLevel.error
      );
    }
  }

  public zoomToSelection(extent: any) {
    const toZoom = extent
      ? extent
      : esri.graphicsExtent(this._pushpinLayer.graphics).expand(1.6);
    this._esriMap.setExtent(toZoom);
  }

  private _performMapModeBuffer(
    geometry: any,
    bufferUnit: any,
    bufferDistance: any
  ) {
    return new Promise((resolve, reject) => {
      if (!bufferUnit || !bufferDistance) {
        this.app.trace.log(
          'Selection will not be buffered, no unit or distance specified.',
          amanda.diagnostics.LogLevel.debug
        );
        resolve(geometry);
      } else {
        const bufferTask = new map.Buffer(this.geometryServiceUrl);
        bufferTask.bufferParams.distances.push(bufferDistance);
        bufferTask.bufferParams.geometries.push(geometry);
        bufferTask.bufferParams.outSpatialReference =
          this._esriMap.spatialReference;
        bufferTask.bufferParams.unit = map_1.Buffer.toEsriUnit(bufferUnit);
        bufferTask
          .perform()
          .then((bufferedGeometries: any) => {
            resolve(bufferedGeometries[0]);
          })
          .catch((error: any) => {
            reject(error);
          });
      }
    });
  }
}
