import { GraphQLList, GraphQLObjectType, GraphQLSchema } from 'graphql';

import { GraphQLSpotType, Spot } from './types.js';
import { createRepository } from '@pbotapps/cosmos';

export const GraphQLSpotSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields() {
      return {
        spots: {
          type: new GraphQLList(GraphQLSpotType),
          async resolve() {
            const repo = await createRepository<Spot>('reservations', 'spot');
            return repo.getAll();
          },
        },
      };
    },
  }),
  types: [GraphQLSpotType],
});
