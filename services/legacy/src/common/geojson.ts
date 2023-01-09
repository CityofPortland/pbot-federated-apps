import { Geometry } from '@turf/helpers';

export function esriGeometryType(geometry: Geometry): string | undefined {
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

export function esriGeometry(geometry: Geometry): __esri.Geometry | undefined {
  let esriProperties = { spatialReference: { wkid: 4326 } };

  switch (geometry.type) {
    case 'Point':
      esriProperties = Object.assign(esriProperties, { x: geometry.coordinates[0], y: geometry.coordinates[1] });
      break;
    case 'LineString':
      esriProperties = Object.assign(esriProperties, { paths: [geometry.coordinates] });
      break;
    case 'Polygon':
      esriProperties = Object.assign(esriProperties, { rings: geometry.coordinates });
      break;
    case 'MultiPoint':
      esriProperties = Object.assign(esriProperties, { points: geometry.coordinates });
      break;
    case 'MultiLineString':
      esriProperties = Object.assign(esriProperties, { paths: geometry.coordinates });
      break;
    case 'MultiPolygon':
      esriProperties = Object.assign(esriProperties, { rings: [geometry.coordinates] });
      break;
  }

  return esriProperties as __esri.Geometry;
}
