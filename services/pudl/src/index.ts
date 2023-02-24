import { buildSubgraphSchema } from '@apollo/subgraph';
import { GraphQLSchemaModule } from '@apollo/subgraph/dist/schema-helper';
import { createServer } from '@pbotapps/graphql';
import { config as loadenv } from 'dotenv';
import { DateTimeResolver } from 'graphql-scalars';
import gql from 'graphql-tag';

import Zone from './zone/index.js';
import Schema from './schema/index.js';
import Table from './table/index.js';
import Column from './column/index.js';

if (process.env.NODE_ENV !== 'production') {
  const out = loadenv();
  if (out.error) {
    console.error(out.error);
  }
}

const typeDefs = gql`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.0"
      import: ["@external", "@key"]
    )

  scalar DateTime
`;

const resolvers = {
  DateTime: DateTimeResolver,
};

const schema = [
  { typeDefs, resolvers },
  Zone,
  Schema,
  Table,
  Column,
] as GraphQLSchemaModule[];

createServer({
  application: 'pudl',
  handlers: [],
  requireToken: false,
  schema: buildSubgraphSchema(schema),
  loaderCallback: () => ({}),
});
