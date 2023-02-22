import { buildSubgraphSchema } from '@apollo/subgraph';
import { GraphQLSchemaModule } from '@apollo/subgraph/dist/schema-helper';
import { handleUser, RuleType } from '@pbotapps/authorization';
import { createServer } from '@pbotapps/graphql';
import { User } from '@pbotapps/objects';
import graphqlUpload from 'graphql-upload/graphqlUploadExpress.mjs';

import { elasticsearchClient } from './client.js';
import { typeDefs } from './types.js';
import { resolvers } from './resolvers.js';
import { handleRules } from '../../../packages/authorization/dist/middleware.js';

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
    handleRules(
      {
        getRules: async ({ user, application }) => {
          let rules = await elasticsearchClient
            .get<{ rules: Array<RuleType & { applicationId: string }> }>({
              index: 'metabase_user',
              id: user._id,
            })
            .then(res => ({ _id: res._id, ...res._source }))
            .then(user => user.rules);

          if (rules) {
            rules = await Promise.all(
              rules.map(r =>
                elasticsearchClient
                  .get<RuleType & { applicationId: string }>({
                    index: 'metabase_rule',
                    id: r._id,
                  })
                  .then(res => ({ _id: res._id, ...res._source }))
              )
            );

            rules = rules.filter(r => r.applicationId == application._id);
          }

          return rules;
        },
      },
      { _id: 'sign' }
    ),
    graphqlUpload(),
  ],
  loaderCallback: undefined,
});
