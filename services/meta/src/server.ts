import { GraphQLSchemaModule } from '@apollo/subgraph/dist/schema-helper';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { handleRules, handleUser } from '@pbotapps/authorization/middleware';
import { createServer } from '@pbotapps/graphql';
import { config as loadenv } from 'dotenv';
import { DateTimeResolver } from 'graphql-scalars';
import { gql } from 'graphql-tag';

import Application from './application/index.js';
import { elasticsearchClient } from './client.js';
import RuleModule from './rule/index.js';
import UserModule from './user/index.js';
import { User } from './user/type.js';
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
        const { id, ...rest } = user;

        const exists = await elasticsearchClient.exists({
          index: 'metabase_user',
          id: id,
        });

        if (!exists) {
          await elasticsearchClient.index<Partial<Omit<User, 'id'>>>({
            index: 'metabase_user',
            id: id,
            document: {
              _changed: new Date(),
              _changedBy: id,
              _created: new Date(),
              _createdBy: id,
              ...rest,
            },
          });
        }

        return elasticsearchClient
          .get<User>({
            index: 'metabase_user',
            id: id,
          })
          .then(hit => ({ id: hit.id, ...hit._source }));
      },
    }),
    handleRules(
      {
        getRules: async where => {
          const user = await elasticsearchClient
            .get<User>({
              index: 'metabase_user',
              id: where.user.id,
            })
            .then(hit => ({ id: hit.id, ...hit._source }));

          if (!user.rules) return null;

          const results = [];

          // get the applications rules
          for await (const hit of scrollSearch<Omit<Rule, 'id'>>(
            elasticsearchClient,
            {
              index: 'metabase_rule',
              query: {
                match: {
                  applicationId: where.application.id,
                },
              },
            }
          )) {
            // return the application rules in the user rules array
            if (user.rules.some(r => r == hit.id)) {
              results.push({ id: hit.id, ...hit._source });
            }
          }

          return results.length ? results : null;
        },
      },
      { id: 'meta' }
    ),
  ],
  loaderCallback: () => ({}),
  requireToken: true,
  schema: buildSubgraphSchema(schema),
});
