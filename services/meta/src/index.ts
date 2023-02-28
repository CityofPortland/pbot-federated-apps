import { createServer } from '@pbotapps/graphql';
import { GraphQLSchemaModule } from '@apollo/subgraph/dist/schema-helper';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { config as loadenv } from 'dotenv';
import { DateTimeResolver } from 'graphql-scalars';
import gql from 'graphql-tag';

import Application from './application/index.js';
import { elasticsearchClient } from './client.js';
import RuleModule from './rule/index.js';
import UserModule from './user/index.js';
import { User } from './user/type.js';
import { handleRules, handleUser } from '@pbotapps/authorization';
import { scrollSearch } from '@pbotapps/elasticsearch';
import { Rule } from './rule/type.js';

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

const resolvers = {
  DateTime: DateTimeResolver,
};

const schema = [
  { typeDefs, resolvers },
  Application,
  RuleModule,
  UserModule,
] as GraphQLSchemaModule[];

createServer({
  application: 'meta',
  handlers: [
    handleUser({
      getUser: async user => {
        const { _id, ...rest } = user;

        const exists = await elasticsearchClient.exists({
          index: 'metabase_user',
          id: _id,
        });

        if (!exists) {
          await elasticsearchClient.index<Partial<Omit<User, '_id'>>>({
            index: 'metabase_user',
            id: _id,
            document: {
              _changed: new Date(),
              _changedBy: _id,
              _created: new Date(),
              _createdBy: _id,
              ...rest,
            },
          });
        }

        return elasticsearchClient
          .get<User>({
            index: 'metabase_user',
            id: _id,
          })
          .then(hit => ({ _id: hit._id, ...hit._source }));
      },
    }),
    handleRules(
      {
        getRules: async where => {
          const user = await elasticsearchClient
            .get<User>({
              index: 'metabase_user',
              id: where.user._id,
            })
            .then(hit => ({ _id: hit._id, ...hit._source }));

          if (!user.rules) return null;

          const results = [];

          // get the applications rules
          for await (const hit of scrollSearch<Omit<Rule, '_id'>>(
            elasticsearchClient,
            {
              index: 'metabase_rule',
              query: {
                match: {
                  applicationId: where.application._id,
                },
              },
            }
          )) {
            // return the application rules in the user rules array
            if (user.rules.some(r => r == hit._id)) {
              results.push({ _id: hit._id, ...hit._source });
            }
          }

          return results.length ? results : null;
        },
      },
      { _id: 'meta' }
    ),
  ],
  loaderCallback: () => ({}),
  requireToken: true,
  schema: buildSubgraphSchema(schema),
});
