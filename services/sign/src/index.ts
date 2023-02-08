import { buildSubgraphSchema } from '@apollo/subgraph';
import { GraphQLSchemaModule } from '@apollo/subgraph/dist/schema-helper';
import { handleUser } from '@pbotapps/authorization';
import { createServer } from '@pbotapps/graphql';
import graphqlUpload from 'graphql-upload/graphqlUploadExpress.mjs';

import { typeDefs } from './types.js';
import { resolvers } from './resolvers.js';

const schema: GraphQLSchemaModule = { typeDefs, resolvers };

createServer({
  application: 'sign_library',
  requireToken: false,
  schema: buildSubgraphSchema(schema),
  handlers: [handleUser(), graphqlUpload()],
  loaderCallback: undefined,
});
