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
      id: context.user._id,
    })
    .then(res => ({ _id: res._id, ...res._source }))
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
        .then(hit => ({ _id: hit._id, ...hit._source })),
    users: async () => {
      const results = [];

      for await (const hit of scrollSearch<Omit<User, '_id'>>(
        elasticsearchClient,
        {
          index: 'metabase_user',
          query: {
            match_all: {},
          },
        }
      )) {
        results.push({ _id: hit._id, ...hit._source });
      }

      return results;
    },
  },
  Mutation: {
    createUser: async (_, input: UserInput, _context) => {
      const { email, ...rest } = input;

      ok(
        !(await elasticsearchClient.exists({
          index: 'metabase_user',
          id: email,
        })),
        `User with email '${email}' already exists!`
      );

      const _created = new Date();

      const user: Omit<User, '_id'> = {
        _created,
        _changed: _created,
        email,
        ...rest,
      };

      await elasticsearchClient.index<Omit<User, '_id'>>({
        index: 'metabase_user',
        id: email,
        document: user,
      });

      return { _id: email, ...user };
    },
    updateUser: async (
      _,
      { _id, data }: { _id: string; data: UserInput },
      context
    ) => {
      ok(
        await elasticsearchClient.exists({
          index: 'metabase_user',
          id: _id,
        }),
        `User with id '${_id}' does not exists!`
      );

      const result = await elasticsearchClient
        .get<User>({
          index: 'metabase_user',
          id: _id,
        })
        .then(hit => ({ _id: hit._id, ...hit._source }));

      const _changed = new Date();
      const _changedBy = context.user._id;

      const { _id: id, ...user } = {
        ...result,
        ...data,
        _changed,
        _changedBy,
      };

      await elasticsearchClient.index<Omit<User, '_id'>>({
        index: 'metabase_user',
        id: id,
        document: user,
      });

      return { _id: id, ...user };
    },
  },
  Rule: {
    users: async (rule: Rule) => {
      const results = [];

      for await (const hit of scrollSearch<Omit<Rule, '_id'>>(
        elasticsearchClient,
        {
          index: 'metabase_user',
          query: {
            match: {
              rules: rule._id,
            },
          },
        }
      )) {
        results.push({ _id: hit._id, ...hit._source });
      }

      return results.length ? results : undefined;
    },
  },
};

export default resolvers;
