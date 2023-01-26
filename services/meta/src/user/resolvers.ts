import { GraphQLResolverMap } from '@apollo/subgraph/dist/schema-helper';
import { Context } from '@pbotapps/graphql';
import { ok } from 'assert';

import knex from '../data-source.js';
import { User } from './type.js';
import { UserInput } from './input.js';

const tableName = 'user';

export async function me(_root, _args, context) {
  return knex<User>(tableName).where({ oauthId: context.token.oid }).first();
}

export const resolvers: GraphQLResolverMap<Context> = {
  Query: {
    me,
    users: () => knex<User>(tableName),
  },
  Mutation: {
    createUser: async (_, data: UserInput) => {
      const { _id } = await knex<User>(tableName)
        .insert({ ...data })
        .returning('_id')
        .first();

      return knex<User>(tableName).where({ _id }).first();
    },
    updateUser: async (_, { _id, data }: { _id: string; data: UserInput }) => {
      const user = await knex<User>('user').where({ _id }).first();

      ok(user, `User with id '${_id}' not found!`);

      return knex<User>('user')
        .where({ _id })
        .update(data)
        .returning('*')
        .first();
    },
  },
};

export default resolvers;
