import { GraphQLObjectType, GraphQLFloat, GraphQLNonNull, GraphQLInt } from 'graphql';

import { SpatialReference } from './types';

export type Location = {
  x: number;
  y: number;
  spatialReference?: SpatialReference;
};

const spatialReferenceType: GraphQLObjectType = new GraphQLObjectType({
  name: 'SpatialReference',
  description: 'An object representing a well-known projection',
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  fields: {
    wkid: {
      type: GraphQLInt,
      description: 'A well-known identifier for this spatial reference.'
    },
    latestWkid: {
      type: GraphQLInt,
      description: 'The latest (and greatest?) well-known identifier for this spatial reference.'
    }
  }
});

export const locationType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Location',
  description: 'A coordinate pair, or Point',
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  fields: {
    x: {
      type: GraphQLNonNull(GraphQLFloat),
      description: 'The location along the x axis.'
    },
    y: {
      type: GraphQLNonNull(GraphQLFloat),
      description: 'The location along the y axis.'
    },
    spatialReference: {
      type: spatialReferenceType,
      description: 'The spatial reference these coordinates are in.'
    }
  }
});
