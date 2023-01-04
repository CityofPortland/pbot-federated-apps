import {
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
  GraphQLEnumType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLUnionType,
  GraphQLNonNull
} from 'graphql';

function coerceCoordinates(value: any): any {
  return value;
}

function parseCoordinates(valueAST: any): any {
  return valueAST.value;
}

function coerceObject(value: any): any {
  return JSON.parse(value);
}

function parseObject(valueAST: any): string {
  return JSON.stringify(valueAST.value);
}

export const TypeEnum = new GraphQLEnumType({
  name: 'GeoJSONType',
  description: 'Enumeration of all GeoJSON object types.',
  values: {
    Point: { value: 'Point' },
    MultiPoint: { value: 'MultiPoint' },
    LineString: { value: 'LineString' },
    MultiLineString: { value: 'MultiLineString' },
    Polygon: { value: 'Polygon' },
    MultiPolygon: { value: 'MultiPolygon' },
    GeometryCollection: { value: 'GeometryCollection' },
    Feature: { value: 'Feature' },
    FeatureCollection: { value: 'FeatureCollection' }
  }
});

export const CoordinatesScalar = new GraphQLScalarType({
  name: 'GeoJSONCoordinates',
  description: 'A (multidimensional) set of coordinates following x, y, z order.',
  serialize: coerceCoordinates,
  parseValue: coerceCoordinates,
  parseLiteral: parseCoordinates
});

export const JsonScalar = new GraphQLScalarType({
  name: 'JSONObject',
  description: 'Arbitrary JSON value',
  serialize: coerceObject,
  parseValue: coerceObject,
  parseLiteral: parseObject
});

export const CRSTypeEnum = new GraphQLEnumType({
  name: 'GeoJSONCRSType',
  description: 'Enumeration of all GeoJSON CRS object types.',
  values: {
    name: { value: 'name' },
    link: { value: 'link' }
  }
});

export const NamedCRSPropertiesObject = new GraphQLObjectType({
  name: 'GeoJSONNamedCRSProperties',
  description: 'Properties for name based CRS object.',
  fields: () => ({
    name: { type: GraphQLNonNull(GraphQLString) }
  })
});

export const LinkedCRSPropertiesObject = new GraphQLObjectType({
  name: 'GeoJSONLinkedCRSProperties',
  description: 'Properties for link based CRS object.',
  fields: () => ({
    href: { type: GraphQLNonNull(GraphQLString) },
    type: { type: GraphQLString }
  })
});

export const CRSPropertiesUnion = new GraphQLUnionType({
  name: 'GeoJSONCRSProperties',
  description: 'CRS object properties.',
  types: () => [NamedCRSPropertiesObject, LinkedCRSPropertiesObject],
  resolveType: (value) => {
    if (value.name) return NamedCRSPropertiesObject;
    if (value.href) return LinkedCRSPropertiesObject;
  }
});

export const CoordinateReferenceSystemObject = new GraphQLObjectType({
  name: 'GeoJSONCoordinateReferenceSystem',
  description: 'Coordinate Reference System (CRS) object.',
  fields: () => ({
    type: { type: GraphQLNonNull(CRSTypeEnum) },
    properties: { type: GraphQLNonNull(CRSPropertiesUnion) }
  })
});

export const GeometryObject = new GraphQLObjectType({
  name: 'GeoJSONGeometryObject',
  fields: () => ({
    type: { type: GraphQLNonNull(TypeEnum) },
    crs: { type: CoordinateReferenceSystemObject },
    bbox: { type: GraphQLList(GraphQLFloat) },
    coordinates: { type: CoordinatesScalar }
  })
});

export const GeometryCollectionObject = new GraphQLObjectType({
  name: 'GeoJSONGeometryCollection',
  description: 'A set of multiple geometries, possibly of various types.',
  fields: () => ({
    type: { type: GraphQLNonNull(TypeEnum) },
    crs: { type: CoordinateReferenceSystemObject },
    bbox: { type: GraphQLList(GraphQLFloat) },
    geometries: { type: GraphQLNonNull(GraphQLList(GraphQLNonNull(GeometryObject))) }
  })
});

export const FeatureObject = new GraphQLObjectType({
  name: 'GeoJSONFeature',
  description: 'An object that links a geometry to properties in order to provide context.',
  fields: () => ({
    type: { type: GraphQLNonNull(TypeEnum) },
    crs: { type: CoordinateReferenceSystemObject },
    bbox: { type: GraphQLList(GraphQLFloat) },
    geometry: { type: GeometryObject },
    properties: { type: JsonScalar },
    id: { type: GraphQLString }
  })
});

export const FeatureCollectionObject = new GraphQLObjectType({
  name: 'GeoJSONFeatureCollection',
  description: 'A set of multiple features.',
  fields: () => ({
    type: { type: GraphQLNonNull(TypeEnum) },
    crs: { type: CoordinateReferenceSystemObject },
    bbox: { type: GraphQLList(GraphQLFloat) },
    features: { type: GraphQLNonNull(GraphQLList(GraphQLNonNull(FeatureObject))) }
  })
});
