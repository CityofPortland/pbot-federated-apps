import { GraphQLResolverMap } from '@apollo/subgraph/dist/schema-helper';

import sources from '../data-source.js';
import { ZONES } from '../zone/types.js';
import { Table } from '../table/types.js';

export const resolvers: GraphQLResolverMap<{ zone: (typeof ZONES)[number] }> = {
  Table: {
    columns: async (table: Table) =>
      sources[table.schema.zone.name as string]
        .column({
          id: 'COLUMNS_V2.CD_ID',
          name: 'COLUMN_NAME',
          description: 'COMMENT',
          type: 'TYPE_NAME',
          index: 'INTEGER_IDX',
        })
        .select()
        .from('COLUMNS_V2')
        .innerJoin('CDS', 'COLUMNS_V2.CD_ID', 'CDS.CD_ID')
        .innerJoin('SDS', 'CDS.CD_ID', 'SDS.CD_ID')
        .innerJoin('TBLS', 'SDS.SD_ID', 'TBLS.SD_ID')
        .where('TBLS.TBL_ID', table.id)
        .then(columns => columns.map(column => ({ ...column, table }))),
  },
};

export default resolvers;
