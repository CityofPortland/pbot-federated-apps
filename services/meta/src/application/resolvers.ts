import { GraphQLResolverMap } from '@apollo/subgraph/dist/schema-helper';
import { BaseType, BaseUserChangeableType, User } from '@pbotapps/objects';
import { Context } from '@pbotapps/graphql';

import knex from '../data-source.js';
import { Application } from './type.js';
import { FindApplicationInput } from './input.js';
import { Rule } from '../rule/type.js';

export const resolvers: GraphQLResolverMap<Context> = {
  Query: {
    applications: async (
      _,
      { input }: { input: FindApplicationInput },
      context
    ) => {
      const { _id } = input;

      if (_id) {
        return context.loaders.application.load(_id);
      } else {
        return knex<Application>('application').then(res => res);
      }
    },
  },
  Mutation: {
    addApplication: (
      _,
      { input }: { input: Omit<Application, keyof BaseUserChangeableType> },
      context
    ) =>
      knex<Application>('application')
        .insert({ ...input })
        .returning('uuid')
        .then(values =>
          context.loaders.application.loadMany(values.map(({ uuid }) => uuid))
        )
        .catch(() => {
          throw new Error();
        }),
    updateApplication: (
      _,
      {
        _id,
        input,
      }: {
        _id: string;
        input: Omit<Application, keyof BaseUserChangeableType>;
      },
      context
    ) =>
      knex<Application>('application')
        .where({ _id })
        .update({ ...input })
        .returning('uuid')
        .then(values =>
          context.loaders.application.loadMany(values.map(({ uuid }) => uuid))
        ),
    deleteApplication: (_, { _id }: Pick<Application, keyof BaseType>) =>
      knex<Application>('application').where({ _id }).delete(),
  },
  Rule: {
    application: (rule: Rule) =>
      knex<Application>('application').where({ _id: rule.application_id }),
  },
  User: {
    applications: (user: User) =>
      knex('user_rule')
        .where({ user_id: user._id })
        .leftJoin<Rule>('rule', { _id: 'user_rule.rule_id' })
        .leftJoin('application', { _id: 'rule.application_id' })
        .select<Array<Application>>('application.*'),
  },
};

export default resolvers;
