import { GraphQLSchemaModule } from '@apollo/subgraph/dist/schema-helper';
import { gql } from 'graphql-tag';

import datasetSchema from './dataset/schema';

const typeDefs = gql`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.0"
      import: ["@external", "@key"]
    )

  type User @key(fields: "uuid", resolvable: false) {
    uuid: ID!
  }
`;

export default [{ typeDefs }, datasetSchema] as GraphQLSchemaModule[];
