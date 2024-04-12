import { GraphQLList, GraphQLObjectType, GraphQLSchema } from 'graphql';

import { GraphQLZoneType, Zone } from './types.js';
import { createRepository } from '@pbotapps/cosmos';

export const GraphQLZoneSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields() {
      return {
        zones: {
          type: new GraphQLList(GraphQLZoneType),
          async resolve() {
            const repo = await createRepository<Zone>('reservations', 'zone');
            return repo.getAll();
          },
        },
      };
    },
  }),
  types: [GraphQLZoneType],
});
