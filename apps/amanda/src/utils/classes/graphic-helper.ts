import esri = __esri;

export class GraphicHelper {
  constructor() {}

  /**
   * Returns a graphic which has a selected style symbol.
   * @param point The point associated with the pushpin.
   * @returns An ESRI graphic with the symbol and the point
   */
  static createPushpinGraphic(point: esri.Point, image?: string): esri.Graphic {
    return new esri.Graphic(
      point,
      GraphicHelper.getSelectedSymbol(image),
      null
    );
  }

  /**
   * Returns a highlighted symbol.
   * @returns A highlighted symbol.
   */
  static getHighlightedSymbol(
    imageUrl = './resources/images/pushpins/map-marker-blue-32.png'
  ): esri.symbol.PictureMarkerSymbol {
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
  }

  /**
   * Returns a selected symbol.
   * @returns A selected symbol.
   */
  static getSelectedSymbol(
    imageUrl = './resources/images/pushpins/map-marker-red-32.png'
  ): esri.symbol.PictureMarkerSymbol {
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
  }

  /**
   * Tags a graphic with Amanda attributes for identification later.
   * @param graphic The Graphic which the tags will be set to.
   * @param layerName The name of the layer which the graphic belongs to.
   * @param commandName The name of the command which created this graphic.
   * @param gisId The ID of the feature to which this graphic represents.
   */
  static setTags(
    graphic: esri.Graphic,
    layerName?: string,
    commandName?: string,
    gisId?: string
  ): void {
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
  }

  /**
   * Extracts AMANDA tags from a graphic.
   * @param graphic The graphic to extract tags from.
   * @returns The extracted tags.
   */
  static extractTags(graphic: esri.Graphic): {
    layerName: string | null;
    commandName: string | null;
    gisId: string | null;
  } | null {
    if (!graphic) {
      return null;
    }
    const layerName = graphic['__amandaLayerName'] || null;
    const commandName = graphic['__amandaCommand'] || null;
    const gisId = graphic['__amandaGISID'] || null;

    return { layerName, commandName, gisId };
  }

  /**
   * Gets the centroid of a graphic. Supports Point, Polygon, Extent and Polyline.
   * @param graphic The graphic to find the centroid of.
   * @returns The calculated centroid.
   */
  static getCentroid(graphic: esri.Graphic): esri.geometry.Point | null {
    if (!graphic || !graphic.geometry) {
      return null;
    }

    const geometry = graphic.geometry;
    if (geometry instanceof esri.geometry.Point) {
      return geometry;
    } else if (geometry instanceof esri.geometry.Polygon) {
      return geometry.getCentroid();
    } else if (geometry instanceof esri.geometry.Extent) {
      return geometry.getCenter();
    } else if (geometry instanceof esri.geometry.Polyline) {
      return geometry.getExtent().getCenter();
    }

    return null;
  }
}
