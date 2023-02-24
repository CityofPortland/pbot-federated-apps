import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';

import { Schema } from '../schema/types.js';

export const typeDefs: DocumentNode = gql`
  type Table {
    id: Int!
    name: String!
    created: DateTime
    accessed: DateTime
  }

  extend type Schema {
    tables: [Table]
  }
`;

export type Table = {
  id: number;
  name: string;
  created: Date;
  accessed: Date;
  schema: Schema;
};

export default typeDefs;
