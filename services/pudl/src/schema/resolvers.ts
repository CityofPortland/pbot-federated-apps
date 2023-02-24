import { GraphQLResolverMap } from '@apollo/subgraph/dist/schema-helper';
import { Context } from '@pbotapps/graphql';

import { Zone } from '../zone/types.js';
import sources from '../data-source.js';

export const resolvers: GraphQLResolverMap<Context> = {
  Zone: {
    schemas: (zone: Zone) =>
      sources[zone.name]
        .column({
          id: 'DB_ID',
          name: 'NAME',
          description: 'DESC',
          locationUri: 'DB_LOCATION_URI',
        })
        .select()
        .from('DBS')
        .then(schemas => schemas.map(schema => ({ ...schema, zone: zone }))),
  },
};

export default resolvers;
