import { CommandType } from '../enums/command-type.js';
import { AmandaApp } from './amanda-app.js';

export class EsriCommandImpl {
  private app: AmandaApp;

  constructor(app: AmandaApp) {
    this.app = app;
  }

  registerCommands() {
    this.app.commands.registerCommand(CommandType.select, this, this.select);
    this.app.commands.registerCommand(
      CommandType.activate,
      this,
      this.activate
    );
    this.app.commands.registerCommand(
      CommandType.bufferSearch,
      this,
      this.bufferSearch
    );
    this.app.commands.registerCommand(
      CommandType.deactivate,
      this,
      this.deactivate
    );
    this.app.commands.registerCommand(
      CommandType.deselect,
      this,
      this.deselect
    );
    this.app.commands.registerCommand(
      CommandType.highlight,
      this,
      this.highlight
    );
    this.app.commands.registerCommand(
      CommandType.setLayerVisibility,
      this,
      this.setLayerVisibility
    );
    this.app.commands.registerCommand(
      CommandType.setMapMode,
      this,
      this.setMapMode
    );
    this.app.commands.registerCommand(
      CommandType.unhighlight,
      this,
      this.unhighlight
    );
    this.app.commands.registerCommand(
      CommandType.setScale,
      this,
      this.setScale
    );
  }

  setScale(payload) {
    const scale = payload.scale;
    if (!scale) {
      this.app.trace.log(
        'Invalid payload for the scale command: Missing a valid scale.',
        amanda.diagnostics.LogLevel.error
      );
      return;
    }
    const map = this.app.map.getGISMap();
    map.setScale(scale);
  }

  select(payload) {
    const layerName = payload.layerName;
    const fieldName = payload.fieldName;
    const filterByCurrentMapExtent = payload.filterByCurrentMapExtent;

    if (!payload || !layerName || !fieldName) {
      this.app.trace.log(
        'Invalid payload for the select command. Missing layerName and/or fieldName.',
        amanda.diagnostics.LogLevel.error
      );
      return;
    }

    const layer = this.app.map.getLayerByName(layerName);
    if (!layer) {
      this.app.trace.log(
        `Can not find a layer for ${layerName}.`,
        amanda.diagnostics.LogLevel.error
      );
      return;
    }

    let whereClause = '';
    const whereCustom = payload.where;
    let whereAuto = null;

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

    const selectQuery = new amanda.map.Query(layer.getUrl());
    selectQuery.queryParams.outFields.push('*');
    selectQuery.queryParams.outSpatialReference =
      this.app.map.getGISMap().spatialReference;

    if (filterByCurrentMapExtent) {
      selectQuery.queryParams.geometry = this.app.map.getGISMap().extent;
    }

    if (whereCustom) {
      whereClause = whereCustom;
    } else if (whereAuto) {
      whereClause = whereAuto;
    }

    selectQuery.queryParams.where = whereClause;
    selectQuery
      .perform()
      .then(results => {
        const features = [];
        if (results && results.features) {
          results.features.forEach(graphic => {
            const id = this._getPropertyByName(graphic.attributes, fieldName);
            if (id) {
              features.push(id);
            }
          });
          this.app.events.featuresSelected(
            layerName,
            features,
            results.exceededTransferLimit
          );
          this._selectFeatures(layerName, fieldName, results.features);
        } else {
          this.app.trace.log(
            'Select query returned no features',
            amanda.diagnostics.LogLevel.warning
          );
        }
      })
      .catch(error => {
        this.app.trace.logError('Select query failed', error);
      });
  }

  deselect() {
    this.app.map.clearPushpins();
  }

  unhighlight() {
    this.app.map.clearHighlights();
  }

  deactivate() {
    const infoWindow = this.app.map.getGISMap().infoWindow;
    infoWindow.hide();
  }

  setMapMode(payload) {
    const layerName = payload.layerName;
    const selectionType = payload.mapMode;
    const layer = this.app.map.getLayerByName(payload.layerName);
    const fieldName = payload.fieldName;

    if (
      selectionType.toUpperCase() === amanda.map.SelectionType.defaultSelect
    ) {
      this.app.map.clearMapMode();
    }

    if (layer && fieldName && selectionType) {
      const geometrySelected = geometry => {
        const selectQuery = new amanda.map.Query(layer.getUrl());
        selectQuery.queryParams.geometry = geometry;
        selectQuery.queryParams.outFields.push('*');
        selectQuery.queryParams.outSpatialReference =
          this.app.map.getGISMap().spatialReference;
        selectQuery
          .perform()
          .then(results => {
            const ids = [];
            const attributes = [];
            if (results && results.features) {
              results.features.forEach(feature => {
                const id = this._getPropertyByName(
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
                this.app.trace.log(
                  'Select by geometry returned the first {0} results. Server limit exceeded.',
                  amanda.diagnostics.LogLevel.warning
                );
              }
              this.app.events.featuresSelectedByGeometry(
                layerName,
                attributes,
                ids,
                results.exceededTransferLimit
              );
            } else {
              this.app.trace.log(
                'Select by geometry returned no features',
                amanda.diagnostics.LogLevel.warning
              );
            }
          })
          .catch(error =>
            this.app.trace.logError('Select by geometry query failed', error)
          );
      };
      this.app.map.captureSelection(selectionType, geometrySelected, {
        bufferUnit: payload.bufferUnit,
        bufferDistance: payload.distance,
      });
    }
  }

  activate(payload) {
    const layerName = payload.layerName;
    const feature = payload.feature;
    const fieldName = payload.fieldName;
    const layer = this.app.map.getLayerByName(layerName);
    const stringType = amanda.utils.QueryHelper.isFieldStringType(
      layer,
      fieldName
    );
    const selectQuery = new amanda.map.Query(layer.getUrl());
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
      .then(results => {
        if (results && results.features) {
          results.features.forEach(graphic => {
            const point = amanda.utils.GraphicHelper.getCentroid(graphic);
            if (point) {
              const pushpin = amanda.utils.GraphicHelper.createPushpinGraphic(
                point,
                this.app.configOptions.pushpinImage
              );
              pushpin.attributes = graphic.attributes;
              const id = this._getPropertyByName(graphic.attributes, fieldName);
              amanda.utils.GraphicHelper.setTags(
                pushpin,
                layerName,
                CommandType.activate,
                id
              );
              this.app.map.addPushpin(pushpin);
              this.app.map.getGISMap().centerAt(point);
              if (payload.infoTitle || payload.infoContent) {
                const infoWindow = this.app.map.getGISMap().infoWindow;
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
          this.app.trace.log(
            'Activate query returned no features',
            amanda.diagnostics.LogLevel.warning
          );
        }
      })
      .catch(error => {
        this.app.trace.logError('Activate query failed', error);
      });
  }

  highlight(payload) {
    const layerName = payload.layerName;
    const feature = payload.feature;
    const fieldName = payload.fieldName;
    const layer = this.app.map.getLayerByName(layerName);
    const stringType = amanda.utils.QueryHelper.isFieldStringType(
      layer,
      fieldName
    );
    const selectQuery = new amanda.map.Query(layer.getUrl());
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
      .then(results => {
        if (results && results.features) {
          results.features.forEach(highlightGraphic => {
            if (highlightGraphic) {
              const id = this._getPropertyByName(
                highlightGraphic.attributes,
                fieldName
              );
              amanda.utils.GraphicHelper.setTags(
                highlightGraphic,
                layerName,
                CommandType.highlight,
                id
              );
              this.app.map.ensurePushpinsOntop();
              this.app.map.addHighlight(highlightGraphic);
            }
          });
        } else {
          this.app.trace.log(
            'Highlight query returned no features',
            amanda.diagnostics.LogLevel.warning
          );
        }
      })
      .catch(error => {
        this.app.trace.logError('Highlight query failed', error);
      });
  }

  bufferSearch(payload) {
    const sourceLayerName = payload.sourceLayerName;
    const sourceFieldName = payload.sourceFieldName;
    const sourceLayer = this.app.map.getLayerByName(sourceLayerName);
    const layerName = payload.layerName;
    const fieldName = payload.fieldName;
    const layer = this.app.map.getLayerByName(layerName);
    const features = payload.features;
    const distance = payload.distance;
    const stringType = amanda.utils.QueryHelper.isFieldStringType(
      sourceLayer,
      sourceFieldName
    );
    const selectQuery = new amanda.map.Query(sourceLayer.getUrl());
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
      .then(results => {
        const buffer = new amanda.map.Buffer(this.app.map.geometryServiceUrl);
        if (results && results.features && results.features.length > 0) {
          results.features.forEach(toBuffer => {
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
          this.app.trace.log(
            'Source layer buffer search query returned no features',
            amanda.diagnostics.LogLevel.warning
          );
          return Promise.resolve([]);
        }
      })
      .then(bufferResults => {
        if (bufferResults && bufferResults.length > 0) {
          const geometryToQueryWith = bufferResults[0];
          const stringType = amanda.utils.QueryHelper.isFieldStringType(
            layer,
            fieldName
          );
          const selectQuery = new amanda.map.Query(layer.getUrl());
          selectQuery.queryParams.outFields.push('*');
          selectQuery.queryParams.outSpatialReference =
            this.app.map.getGISMap().spatialReference;
          selectQuery.queryParams.geometry = geometryToQueryWith;
          return selectQuery.perform();
        } else {
          this.app.trace.log(
            'No buffer could be determined from source input features',
            amanda.diagnostics.LogLevel.warning
          );
          return Promise.resolve(new esri.tasks.FeatureSet());
        }
      })
      .then(foundFeatures => {
        if (
          foundFeatures &&
          foundFeatures.features &&
          foundFeatures.features.length > 0
        ) {
          const idsArray = [];
          foundFeatures.features.forEach(feature => {
            const id = this._getPropertyByName(feature.attributes, fieldName);
            if (id) {
              idsArray.push(id);
            }
          });
          this.app.events.featuresSelected(layerName, idsArray);
          this._selectFeatures(layerName, fieldName, foundFeatures.features);
        } else {
          this.app.trace.log(
            'Buffered query did not return any results',
            amanda.diagnostics.LogLevel.warning
          );
        }
        return Promise.resolve();
      })
      .catch(error => {
        this.app.trace.logError(
          'Failed to perform the buffered selection',
          error
        );
      });
  }

  _selectFeatures(layerName, fieldName, graphics) {
    this.app.map.ensurePushpinsOntop();
    graphics.forEach(graphic => {
      const id = this._getPropertyByName(graphic.attributes, fieldName);
      amanda.utils.GraphicHelper.setTags(
        graphic,
        layerName,
        CommandType.select,
        id
      );
      this.app.map.addPushpin(graphic);
    });
    this.app.map.zoomToSelection(null);
  }

  _getPropertyByName(array, fieldName) {
    let val = null;
    if (array && !!array[fieldName]) {
      val = array[fieldName];
    }
    return val;
  }

  setLayerVisibility(payload) {
    const layerName = payload.layerName;
    const visibility = payload.visibility;
    const layer = this.app.map.getLayerByName(layerName);
    let changed = false;
    if (layer) {
      changed = layer.setVisibility(visibility);
    }
    if (changed) {
      this.app.events.visibilityChanged(layerName, visibility);
    }
  }
}
