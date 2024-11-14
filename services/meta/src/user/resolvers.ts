import { GraphQLResolverMap } from '@apollo/subgraph/dist/schema-helper';
import { scrollSearch } from '@pbotapps/elasticsearch';
import { Context } from '@pbotapps/graphql';
import { ok } from 'assert';

import { elasticsearchClient } from '../client.js';
import { Rule } from '../rule/type.js';
import { User } from './type.js';
import { UserInput } from './input.js';

export async function me(_root, _args, context: Context) {
  if (!context.user) throw new Error('No user in context!');

  return elasticsearchClient
    .get<User>({
      index: 'metabase_user',
      id: context.user.id,
    })
    .then(res => ({ id: res.id, ...res._source }))
    .catch(() => undefined);
}

export const resolvers: GraphQLResolverMap<Context> = {
  Query: {
    me,
    user: (_, { email }: { email: string }) =>
      elasticsearchClient
        .get<User>({
          index: 'metabase_user',
          id: email,
        })
        .then(hit => ({ id: hit.id, ...hit._source })),
    users: async () => {
      const results = [];

      for await (const hit of scrollSearch<Omit<User, 'id'>>(
        elasticsearchClient,
        {
          index: 'metabase_user',
          query: {
            match_all: {},
          },
        }
      )) {
        results.push({ id: hit.id, ...hit._source });
      }

      return results;
    },
  },
  Mutation: {
    createUser: async (_, input: UserInput) => {
      const { email, ...rest } = input;

      ok(
        !(await elasticsearchClient.exists({
          index: 'metabase_user',
          id: email,
        })),
        `User with email '${email}' already exists!`
      );

      const _created = new Date();

      const user: Omit<User, 'id'> = {
        _created,
        _changed: _created,
        email,
        ...rest,
      };

      await elasticsearchClient.index<Omit<User, 'id'>>({
        index: 'metabase_user',
        id: email,
        document: user,
      });

      return { id: email, ...user };
    },
    updateUser: async (
      _,
      { id, data }: { id: string; data: UserInput },
      context
    ) => {
      ok(
        await elasticsearchClient.exists({
          index: 'metabase_user',
          id: id,
        }),
        `User with id '${id}' does not exists!`
      );

      const result = await elasticsearchClient
        .get<User>({
          index: 'metabase_user',
          id: id,
        })
        .then(hit => ({ id: hit.id, ...hit._source }));

      const _changed = new Date();
      const _changedBy = context.user.id;

      const { id: id, ...user } = {
        ...result,
        ...data,
        _changed,
        _changedBy,
      };

      await elasticsearchClient.index<Omit<User, 'id'>>({
        index: 'metabase_user',
        id: id,
        document: user,
      });

      return { id: id, ...user };
    },
  },
  Rule: {
    users: async (rule: Rule) => {
      const results = [];

      for await (const hit of scrollSearch<Omit<Rule, 'id'>>(
        elasticsearchClient,
        {
          index: 'metabase_user',
          query: {
            match: {
              rules: rule.id,
            },
          },
        }
      )) {
        results.push({ id: hit.id, ...hit._source });
      }

      return results.length ? results : undefined;
    },
  },
};

export default resolvers;
