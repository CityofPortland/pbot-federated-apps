import { createServer } from '@pbotapps/graphql';
import { GraphQLSchemaModule } from '@apollo/subgraph/dist/schema-helper';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { config as loadenv } from 'dotenv';
import gql from 'graphql-tag';

import Application from './application/index.js';
import Rule from './rule/index.js';
import User from './user/index.js';

if (process.env.NODE_ENV !== 'production') {
  loadenv();
}

const typeDefs = gql(`
extend schema
  @link(
    url: "https://specs.apollo.dev/federation/v2.0"
    import: ["@external", "@key"]
  )

  scalar DateTime
`);

const schema = [{ typeDefs }, Application, Rule, User] as GraphQLSchemaModule[];

createServer({
  application: 'meta',
  handlers: [],
  loaderCallback: () => ({}),
  requireToken: true,
  schema: buildSubgraphSchema(schema),
});
