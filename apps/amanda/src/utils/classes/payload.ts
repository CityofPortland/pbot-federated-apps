export class Payload extends Object {
  messageType!: string;
  layerName!: string;
  features!: unknown[];
  attributes!: Record<string, unknown>;
  exceededTransferLimit!: boolean;
  fieldName?: string;
  scale: unknown;
  filterByCurrentMapExtent: unknown;
  where: unknown;
  feature: unknown;
  mapMode: unknown;
  sourceLayerName: unknown;
  infoTitle: unknown;
  infoContent: unknown;
  distance: unknown;
  sourceFieldName: unknown;
  visibility: unknown;
  custom: unknown;
  bufferUnit: unknown;

  /**
   * Returns a new instance of {@link Payload} created from serialized JSON.
   * @param json The JSON to deserialize.
   * @returns The created {@link Payload}.
   */
  fromJson(json: string) {
    const jsonRep = JSON.parse(json);
    const payload = new Payload();
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
  }

  /**
   * Returns the JSON representation of the object.
   * @returns The JSON.
   */
  toJson(): string {
    return JSON.stringify(this);
  }
}
