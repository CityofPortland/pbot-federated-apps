import { GraphQLResolverMap } from '@apollo/subgraph/dist/schema-helper';
import { Context } from '@pbotapps/graphql';

import { Zone } from './types.js';

const zones = new Array<Zone>({ name: 'raw' }, { name: 'enriched' });

export const resolvers: GraphQLResolverMap<Context> = {
  Query: {
    zone: (_root, { name }) => zones.filter(z => z.name == name),
    zones: () => zones,
  },
};

export default resolvers;
