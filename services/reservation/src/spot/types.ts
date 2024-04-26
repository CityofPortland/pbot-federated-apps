import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { Base, baseFields } from '../base/types.js';

export type Spot = Base & {
  id: string;
  label: string;
  zone: string;
};

export const GraphQLSpotType = new GraphQLObjectType<Spot>({
  name: 'Spot',
  fields() {
    return {
      ...baseFields(),
      label: {
        type: new GraphQLNonNull(GraphQLString),
      },
      zone: {
        type: new GraphQLNonNull(GraphQLString),
      },
    };
  },
});
