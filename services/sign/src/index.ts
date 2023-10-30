import { buildSubgraphSchema } from '@apollo/subgraph';
import { GraphQLSchemaModule } from '@apollo/subgraph/dist/schema-helper';
import { handleRules } from '@pbotapps/authorization';
import { createServer } from '@pbotapps/graphql';
import graphqlUpload from 'graphql-upload/graphqlUploadExpress.mjs';

import { typeDefs } from './types.js';
import { resolvers } from './resolvers.js';

const schema: GraphQLSchemaModule = { typeDefs, resolvers };

createServer({
  application: 'sign_library',
  requireToken: false,
  schema: buildSubgraphSchema(schema),
  handlers: [
    handleRules(
      {
        getRules: async ({ user, application }) => {
          const rules = [];

          if (
            [
              'Joel.Hudson@portlandoregon.gov',
              'Michael.McDonald@portlandoregon.gov',
              'Matthew.Machado@portlandoregon.gov',
              'Peter.Wojcicki@portlandoregon.gov',
              'Sabrina.Kao@portlandoregon.gov',
            ].includes(user._id)
          ) {
            rules.push(
              {
                _changed: new Date(),
                _changedBy: 'Michael.McDonald@portlandoregon.gov',
                _created: new Date(),
                _createdBy: 'Michael.McDonald@portlandoregon.gov',
                _id: 'null',
                application,
                action: 'create',
                subject: 'sign',
              },
              {
                _changed: new Date(),
                _changedBy: 'Michael.McDonald@portlandoregon.gov',
                _created: new Date(),
                _createdBy: 'Michael.McDonald@portlandoregon.gov',
                _id: 'null',
                application,
                action: 'edit',
                subject: 'sign',
              }
            );
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
