import Layer from '@arcgis/core/layers/Layer';
import DynamicLayer from '@arcgis/core/layers/BaseDynamicLayer';
import ArcGISTiledMapServiceLayer from '@arcgis/core/layers/TiledMapServiceLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import ArcGISDynamicMapServiceLayer from '@arcgis/core/layers/ArcGISDynamicMapServiceLayer';

import { Query } from './esri-query';

export class EsriLayer {
  private _serviceLayer!: Layer;
  private _fields: any;
  public url?: string;
  public id!: number;
  public name?: string;

  /**
   * Gets the formatted URL for the layer.
   */
  getUrl(): string | undefined {
    if (this._serviceLayer instanceof FeatureLayer) {
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
    const changed = this._serviceLayer.visible !== visibility;

    this._serviceLayer.visible = visibility;

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
    const infoQuery = new Query(this.getUrl());
    infoQuery.queryParams.where = '1=0';
    infoQuery.queryParams.outFields.push('*');
    infoQuery.perform().then(
      results => {
        if (results && results.fields) {
          this._fields = results.fields;
        }
      },
      error => {
        console.log(
          'Something went wrong while populating layer info ' + error
        );
      }
    );
  }

  /**
   * Creates a {@link EsriLayer} for a dynamic layer.
   * @param esriLayer The {@link esri.layers.Layer}.
   * @param info The {@link esri.layers.LayerInfo}.
   * @returns The created {@link EsriLayer}.
   */
  static createFromLayerInfo(
    esriLayer: FeatureLayer,
    info: any
  ): EsriLayer | null {
    let layer: EsriLayer | null = null;
    if (esriLayer && info) {
      layer = new EsriLayer();
      layer.url = esriLayer.url || undefined;
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
  static createFromFeatureLayer(esriLayer: FeatureLayer): EsriLayer | null {
    let layer: EsriLayer | null = null;
    if (esriLayer) {
      layer = new EsriLayer();
      layer.url = esriLayer.url || '';
      layer.id = parseInt(esriLayer.id);
      layer.name = esriLayer.title || undefined;
      layer._serviceLayer = esriLayer;
      layer._fields = esriLayer.fields;
    }
    return layer;
  }
}
