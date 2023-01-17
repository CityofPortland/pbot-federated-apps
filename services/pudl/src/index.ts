import { buildSubgraphSchema, printSubgraphSchema } from '@apollo/subgraph';
import { GraphQLResolverMap } from '@apollo/subgraph/dist/schema-helper/resolverMap.js';
import { createServer } from '@pbotapps/graphql';
import cors from 'cors';
import { config as loadenv } from 'dotenv';
import { specifiedDirectives } from 'graphql';
import gql from 'graphql-tag';
import 'reflect-metadata';
import {
  buildSchema,
  BuildSchemaOptions,
  createResolversMap,
} from 'type-graphql';

import { SchemaResolver } from './schema/resolver.js';
import { TableResolver } from './table/resolver.js';
import { ZoneResolver } from './zone/resolver.js';

if (process.env.NODE_ENV !== 'production') {
  const out = loadenv();
  if (out.error) {
    console.error(out.error);
  }
}

const options: BuildSchemaOptions = {
  resolvers: [SchemaResolver, TableResolver, ZoneResolver],
};

const schema = await buildSchema({
  ...options,
  directives: [...specifiedDirectives],
  skipCheck: true,
});

createServer({
  application: 'pudl',
  handlers: [cors()],
  requireToken: false,
  schema: buildSubgraphSchema({
    typeDefs: gql(printSubgraphSchema(schema)),
    resolvers: createResolversMap(schema) as GraphQLResolverMap,
  }),
  loaderCallback: () => ({}),
});
