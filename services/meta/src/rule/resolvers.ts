import { GraphQLResolverMap } from '@apollo/subgraph/dist/schema-helper/resolverMap.js';
import { scrollSearch } from '@pbotapps/elasticsearch';
import { Context } from '@pbotapps/graphql';
import { BaseType } from '@pbotapps/objects';
import { ok } from 'assert';
import { createHash } from 'crypto';

import { Application } from '../application/type.js';
import { elasticsearchClient } from '../client.js';
import { User } from '../user/type.js';
import { RuleInput } from './input.js';
import { Rule } from './type.js';

export const resolvers: GraphQLResolverMap<Context> = {
  Query: {
    rule: async (_, { id }: { id: string }) => {
      ok(
        await elasticsearchClient.exists({
          index: 'metabase_rule',
          id,
        }),
        `Rule with id '${id}' does not exist!`
      );

      return elasticsearchClient
        .get<Rule>({
          index: 'metabase_rule',
          id,
        })
        .then(hit => ({ _id: hit._id, ...hit._source }));
    },
  },
  Mutation: {
    addRule: async (
      _,
      {
        applicationId,
        input,
      }: { applicationId: string; input: RuleInput<unknown> },
      context
    ) => {
      const hash = createHash('sha256')
        .update(JSON.stringify(input))
        .digest('base64url');

      ok(
        !(await elasticsearchClient.exists({
          index: 'metabase_rule',
          id: hash,
        })),
        `The input rule already exists!`
      );

      const _created = new Date();
      const _createdBy = context.user._id;

      const rule: Omit<Rule, '_id'> = {
        _created,
        _createdBy,
        _changed: _created,
        _changedBy: _createdBy,
        applicationId,
        ...input,
      };

      await elasticsearchClient.index<Omit<Rule, '_id'>>({
        index: 'metabase_rule',
        id: hash,
        document: rule,
      });

      return { _id: hash, ...rule };
    },
    updateRule: async (
      _,
      { _id, input }: { _id: string; input: RuleInput<unknown> },
      context
    ) => {
      ok(
        !(await elasticsearchClient.exists({
          index: 'metabase_rule',
          id: _id,
        })),
        `No rule with id '${_id}' found!`
      );

      const result = await elasticsearchClient
        .get<Omit<Rule, '_id'>>({
          index: 'metabase_rule',
          id: _id,
        })
        .then(hit => ({ ...hit._source }));

      const _changed = new Date();
      const _changedBy = context.user._id;

      const rule = {
        ...result,
        ...input,
        _changed,
        _changedBy,
      };

      await elasticsearchClient.index<Omit<Rule, '_id'>>({
        index: 'metabase_application',
        id: _id,
        document: rule,
      });

      return { _id: _id, ...rule };
    },
    removeRule: async (_, { _id }: { _id: string }) => {
      ok(
        !(await elasticsearchClient.exists({
          index: 'metabase_rule',
          id: _id,
        })),
        `No rule with id '${_id}' found!`
      );

      await elasticsearchClient.delete({
        index: 'metabase_application',
        id: _id,
      });
    },
    addRuleToUser: async (
      _,
      { rule_id, user_id }: { rule_id: string; user_id: string }
    ) => {
      const user = await elasticsearchClient
        .get<{ rules: Array<string> }>({
          index: 'metabase_user',
          id: user_id,
        })
        .then(hit => ({ ...hit._source }));
      ok(user, `No user with id '${user_id}' found!`);

      user.rules = user.rules || [];

      ok(
        !user.rules.find(rule => rule == rule_id),
        `User with id '${user_id}' already has rule with id '${rule_id}'.`
      );

      const rule = await elasticsearchClient.exists({
        index: 'metabase_rule',
        id: rule_id,
      });

      ok(rule, `No rule with id '${rule_id}' found!`);

      user.rules.push(rule_id);

      await elasticsearchClient.index({
        index: 'metabase_user',
        id: user_id,
        document: { ...user },
      });

      return rule_id;
    },
    removeRuleFromUser: async (
      _,
      { rule_id, user_id }: { rule_id: string; user_id: string }
    ) => {
      const user = await elasticsearchClient
        .get<User>({
          index: 'metabase_user',
          id: user_id,
        })
        .then(hit => ({ ...hit._source }));
      ok(user, `No user with id '${user_id}' found!`);

      ok(
        !user.rules.find(rule => rule == rule_id),
        `User with id '${user_id}' does not have rule with id '${rule_id}'.`
      );

      const rule = await elasticsearchClient.exists({
        index: 'metabase_rule',
        id: rule_id,
      });

      ok(rule, `No rule with id '${rule_id}' found!`);

      user.rules.splice(
        user.rules.findIndex(rule => rule == rule_id),
        1
      );

      await elasticsearchClient.index({
        index: 'metabase_user',
        id: user_id,
        document: { ...user },
      });

      return rule_id;
    },
  },
  Application: {
    rules: async (application: Application) => {
      const results = [];

      for await (const hit of scrollSearch<Omit<Rule, '_id'>>(
        elasticsearchClient,
        {
          index: 'metabase_rule',
          query: {
            match: {
              applicationId: application._id,
            },
          },
        }
      )) {
        results.push({ _id: hit._id, ...hit._source });
      }

      return results;
    },
  },
  User: {
    rules: async (user: BaseType) => {
      const rules = await elasticsearchClient
        .get<{ rules: Array<string> }>({
          index: 'metabase_user',
          id: user._id,
        })
        .then(hit => hit._source.rules);

      if (!rules || !rules.length) return null;

      const results = new Array<Rule>();

      await Promise.all(
        rules.map(async rule =>
          results.push(
            await elasticsearchClient
              .get<Omit<Rule, '_id'>>({
                index: 'metabase_rule',
                id: rule,
              })
              .then(hit => ({ _id: hit._id, ...hit._source }))
          )
        )
      );

      return results;
    },
  },
};

export default resolvers;
