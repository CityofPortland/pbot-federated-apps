import { GeometryObject } from '@pbotapps/graphql';
import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { Base, baseFields } from '../base/types.js';

export type Zone = Base & {
  id: string;
  geometry: object;
  label: string;
};

export const GraphQLZoneType = new GraphQLObjectType<Zone>({
  name: 'Zone',
  description: 'A CurbZone CDS implementation',
  fields() {
    return {
      ...baseFields(),
      geometry: {
        type: GeometryObject,
      },
      label: {
        type: new GraphQLNonNull(GraphQLString),
      },
    };
  },
});
