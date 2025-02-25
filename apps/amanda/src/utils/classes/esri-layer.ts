import esri = __esri;

export class EsriLayer {
  private _serviceLayer: any;
  private _fields: any;
  public url: string;
  public id: number;
  public name: string;

  /**
   * Gets the formatted URL for the layer.
   */
  getUrl(): string {
    if (this._serviceLayer instanceof esri.layers.FeatureLayer) {
      return this.url;
    } else {
      return this.url + '/' + this.id;
    }
  }

  /**
   * Sets the layer visibility to the value of the passed boolean. Will return true if the layer visibility changes, and False if it does not.
   * @param visibility The visibility to set.
   * @returns A value indicating if the visibility on the layer changed or not.
   */
  setVisibility(visibility: boolean): boolean {
    let changed = false;
    if (this._serviceLayer instanceof esri.layers.ArcGISTiledMapServiceLayer) {
      const tiled = this._serviceLayer;
      tiled.setVisibility(visibility);
      changed = true;
    } else if (
      this._serviceLayer instanceof esri.layers.ArcGISDynamicMapServiceLayer
    ) {
      const dynamic = this._serviceLayer;
      const visibleLayers = dynamic.visibleLayers;
      const indexOfLayer = visibleLayers.indexOf(this.id);
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
      const featureLayer = this._serviceLayer;
      const currentVis = featureLayer.visible;
      if (currentVis !== visibility) {
        featureLayer.setVisibility(visibility);
        changed = true;
      }
    }
    return changed;
  }

  /**
   * Gets the layers fields.
   * @returns The layers fields.
   */
  getLayerFields(): any {
    return this._fields;
  }

  /**
   * Populates the layers fields.
   */
  private _populateQueryInfo(): void {
    const infoQuery = new amanda.map.Query(this.getUrl());
    infoQuery.queryParams.where = '1=0';
    infoQuery.queryParams.outFields.push('*');
    infoQuery.perform().then(
      results => {
        if (results && results.fields) {
          this._fields = results.fields;
        }
      },
      error => {
        //console.log("Something went wrong while populating layer info " + error);
      }
    );
  }

  /**
   * Creates a {@link EsriLayer} for a dynamic layer.
   * @param esriLayer The {@link esri.layers.Layer}.
   * @param info The {@link esri.layers.LayerInfo}.
   * @returns The created {@link EsriLayer}.
   */
  static createFromLayerInfo(esriLayer: any, info: any): EsriLayer | null {
    let layer: EsriLayer | null = null;
    if (esriLayer && info) {
      layer = new EsriLayer();
      layer.url = esriLayer.url;
      layer.name = info.name;
      layer.id = info.id;
      layer._serviceLayer = esriLayer;
      layer._populateQueryInfo();
    }
    return layer;
  }

  /**
   * Creates a {@link EsriLayer} for a feature layer.
   * @param esriLayer The {@link esri.layers.FeatureLayer}.
   * @returns The created {@link EsriLayer}.
   */
  static createFromFeatureLayer(esriLayer: any): EsriLayer | null {
    let layer: EsriLayer | null = null;
    if (esriLayer) {
      layer = new EsriLayer();
      layer.url = esriLayer.url;
      layer.id = parseInt(esriLayer.id);
      layer.name = esriLayer.name;
      layer._serviceLayer = esriLayer;
      layer._fields = esriLayer.fields;
    }
    return layer;
  }
}
