import ESRIGeometry from '@arcgis/core/geometry/Geometry.js';
import { Geometry as GeoJSONGeometry } from 'geojson';

export function esriGeometryType(
  geometry: GeoJSONGeometry
): string | undefined {
  switch (geometry.type) {
    case 'Point':
      return 'esriGeometryPoint';
    case 'LineString':
      return 'esriGeometryPolyline';
    case 'Polygon':
      return 'esriGeometryPolygon';
    case 'MultiPoint':
      return 'esriGeometryMultipoint';
    case 'MultiLineString':
      return 'esriGeometryPolyline';
    case 'MultiPolygon':
      return 'esriGeometryPolygon';
    default:
      return undefined;
  }
}

export function esriGeometry(
  geometry: GeoJSONGeometry
): ESRIGeometry | undefined {
  const esriProperties: ESRIGeometry = { spatialReference: { wkid: 4326 } };

  switch (geometry.type) {
    case 'Point':
      esriProperties.x = geometry.coordinates[0];
      esriProperties.y = geometry.coordinates[1];
      break;
    case 'LineString':
      esriProperties.paths = [geometry.coordinates];
      break;
    case 'Polygon':
      esriProperties.rings = geometry.coordinates;
      break;
    case 'MultiPoint':
      esriProperties.points = geometry.coordinates;
      break;
    case 'MultiLineString':
      esriProperties.paths = geometry.coordinates;
      break;
    case 'MultiPolygon':
      esriProperties.rings = [geometry.coordinates];
      break;
  }

  return esriProperties as ESRIGeometry;
}
