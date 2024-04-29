import { DocumentNode } from 'graphql';
import { gql } from 'graphql-tag';

import { Table } from '../table/types.js';

export const typeDefs: DocumentNode = gql`
  type Column {
    id: Int!
    name: String!
    description: String
    type: String!
    index: Int!
  }

  extend type Table {
    columns: [Column]
  }
`;

export type Column = {
  id: number;
  name: string;
  description: string;
  type: string;
  index: number;
  table: Table;
};

export default typeDefs;
