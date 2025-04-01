import { EsriLayer } from './esri-layer';

export class QueryHelper {
  /**
   * Creates a where clause using the supplied parameters
   * @param field The field name to use.
   * @param ids The ids to include.
   * @param isString Options parameter if the field uses string values or not.
   * @returns The generated where clause.
   */
  static generateWhereClause(
    field: string,
    ids: string[],
    isString: boolean
  ): string {
    let concatIds = '';
    let clause = '';
    if (isString) {
      concatIds = ids.join("','");
      clause = `${field} in ('${concatIds}')`;
    } else {
      concatIds = ids.join(',');
      clause = `${field} in (${concatIds})`;
    }
    return clause;
  }

  /**
   * Creates a where clause using the supplied parameters.
   * @param layer The layer.
   * @param fieldName The field name.
   * @returns If the field is of string type or not.
   */
  static isFieldStringType(layer: EsriLayer, fieldName?: string): boolean {
    let isString = false;
    if (layer && layer.getLayerFields() && fieldName) {
      fieldName = fieldName.toUpperCase();
      const fields = layer.getLayerFields();
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
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
  }
}
