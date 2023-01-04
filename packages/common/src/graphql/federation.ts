import { buildFederatedSchema as buildApolloFederationSchema } from '@apollo/federation';
import { printSubgraphSchema } from '@apollo/subgraph';
import { knownSubgraphDirectives } from '@apollo/subgraph/dist/directives';
import { addResolversToSchema, GraphQLResolverMap } from 'apollo-graphql';
import { specifiedDirectives } from 'graphql';
import gql from 'graphql-tag';
import {
  buildSchema,
  BuildSchemaOptions,
  createResolversMap,
} from 'type-graphql';

export async function buildFederatedSchema(
  options: BuildSchemaOptions,
  referenceResolvers?: GraphQLResolverMap<any>
) {
  const schema = await buildSchema({
    ...options,
    directives: [
      ...specifiedDirectives,
      ...knownSubgraphDirectives,
      ...(options.directives || []),
    ],
    skipCheck: true,
  });

  const federatedSchema = buildApolloFederationSchema({
    typeDefs: gql(printSubgraphSchema(schema)),
    resolvers: createResolversMap(schema) as any,
  });

  if (referenceResolvers) {
    addResolversToSchema(federatedSchema, referenceResolvers);
  }

  return federatedSchema;
}
