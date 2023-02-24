import { GraphQLResolverMap } from '@apollo/subgraph/dist/schema-helper';

import sources from '../data-source.js';
import { Schema } from '../schema/types.js';
import { ZONES } from '../zone/types.js';

export const resolvers: GraphQLResolverMap<{ zone: typeof ZONES }> = {
  Schema: {
    tables: async (schema: Schema) =>
      sources[schema.zone.name]
        .column({
          id: 'TBL_ID',
          name: 'TBL_NAME',
          created: 'CREATE_TIME',
          accessed: 'LAST_ACCESS_TIME',
        })
        .select()
        .from('TBLS')
        .innerJoin('DBS', 'TBLS.DB_ID', 'DBS.DB_ID')
        .where('DBS.DB_ID', schema.id)
        .then(tables => tables.map(table => ({ ...table, schema }))),
  },
};

export default resolvers;
