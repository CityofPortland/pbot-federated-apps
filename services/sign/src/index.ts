import { buildSubgraphSchema } from '@apollo/subgraph';
import { GraphQLSchemaModule } from '@apollo/subgraph/dist/schema-helper';
import { handleUser } from '@pbotapps/authorization';
import { createServer } from '@pbotapps/graphql';
import { User } from '@pbotapps/objects';
import graphqlUpload from 'graphql-upload/graphqlUploadExpress.mjs';

import { elasticsearchClient } from './client.js';
import { typeDefs } from './types.js';
import { resolvers } from './resolvers.js';

const schema: GraphQLSchemaModule = { typeDefs, resolvers };

createServer({
  application: 'sign_library',
  requireToken: false,
  schema: buildSubgraphSchema(schema),
  handlers: [
    handleUser({
      getUser: where =>
        elasticsearchClient
          .get<User>({
            index: 'metabase_user',
            id: where._id,
          })
          .then(res => ({ _id: res._id, ...res._source })),
    }),
    graphqlUpload(),
  ],
  loaderCallback: undefined,
});
