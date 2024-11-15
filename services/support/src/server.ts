import { buildSubgraphSchema } from '@apollo/subgraph';
import { GraphQLSchemaModule } from '@apollo/subgraph/dist/schema-helper';
import { createServer } from '@pbotapps/graphql';
import dotenv from 'dotenv';

import { typeDefs } from './types.js';
import { resolvers } from './resolvers.js';

if (process.env.NODE_ENV == 'development') dotenv.config();

const schema: GraphQLSchemaModule = { typeDefs, resolvers };

createServer({
  application: 'support',
  requireToken: true,
  schema: buildSubgraphSchema(schema),
  handlers: [],
  loaderCallback: undefined,
});
