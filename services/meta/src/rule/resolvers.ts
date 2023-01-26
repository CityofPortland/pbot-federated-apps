import { GraphQLResolverMap } from '@apollo/subgraph/dist/schema-helper/resolverMap.js';
import { Context } from '@pbotapps/graphql';

import knex from '../data-source.js';
import { Application } from '../application/type.js';
import { RuleInput } from './input.js';
import { Rule } from './type.js';
import { ok } from 'assert';
import { User } from '@pbotapps/objects';

export const resolvers: GraphQLResolverMap<Context> = {
  Mutation: {
    addRule: (_, data: RuleInput<unknown>) => knex<Rule>('rule').insert(data),
    updateRule: (
      _,
      { _id, data }: { _id: string; data: RuleInput<unknown> }
    ) => {
      const rule = knex<Rule>('rule').where({ _id }).first();
      ok(rule, `No rule with id '${_id}' found!`);

      knex<Rule>('rule').where({ _id }).update(data);
    },
    removeRule: (_, { _id }: { _id: string }) => {
      const rule = knex<Rule>('rule').where({ _id }).first();
      ok(rule, `No rule with id '${_id}' found!`);

      knex('user_rule').where({ rule_id: _id }).delete();
      rule.delete();
    },
    addRuleToUser: (
      _,
      { rule_id, user_id }: { rule_id: string; user_id: string }
    ) => {
      const rule = knex<Rule>('rule').where({ _id: rule_id }).first();
      ok(rule, `No rule with id '${rule_id}' found!`);
      const user = knex<User>('user').where({ _id: user_id }).first();
      ok(user, `No rule with id '${user_id}' found!`);

      knex('user_rule').insert({ user_id, rule_id });
    },
    removeRuleFromUser: (
      _,
      { rule_id, user_id }: { rule_id: string; user_id: string }
    ) => {
      const rule = knex<Rule>('rule').where({ _id: rule_id }).first();
      ok(rule, `No rule with id '${rule_id}' found!`);
      const user = knex<User>('user').where({ _id: user_id }).first();
      ok(user, `No rule with id '${user_id}' found!`);

      return knex('user_rule').where({ user_id, rule_id }).delete();
    },
  },
  Application: {
    rules: (application: Application) =>
      knex<Rule>('rule')
        .where({ application_id: application._id })
        .then(rules => rules),
  },
};

export default resolvers;
