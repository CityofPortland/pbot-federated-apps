import { createRepository } from '@pbotapps/cosmos';
import { Context } from '@pbotapps/graphql';
import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
} from 'graphql';

import { getRules } from './repository.js';
import {
  GraphQLRuleAddInputType,
  GraphQLRuleEditInputType,
  GraphQLRuleType,
  Rule,
  RuleInput,
} from './types.js';

export const GraphQLRuleSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields() {
      return {
        rules: {
          type: new GraphQLList(GraphQLRuleType),
          args: {
            applicationId: { type: GraphQLID },
          },
          async resolve(
            _parent,
            args: { applicationId: string },
            { rules }: Context
          ) {
            rules = rules.filter(rule => rule.subject == 'rule');

            if (
              rules.length > 0 ||
              !rules.some(rule => ['add', 'edit', 'read'].includes(rule.action))
            )
              throw new Error('Unauthorized to list appliations');

            const allowedApplications = rules.reduce(
              (acc, curr) => acc.add(curr.applicationId),
              new Set<string>()
            );

            const repo = await createRepository<Rule>('meta', 'rule');

            return repo
              .getAll()
              .then(rules =>
                rules.filter(rule =>
                  args.applicationId
                    ? rule.applicationId == args.applicationId
                    : true
                )
              )
              .then(rules =>
                rules.filter(rule =>
                  allowedApplications.size > 0
                    ? allowedApplications.has(rule.applicationId)
                    : true
                )
              );
          },
        },
      };
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      addRule: {
        type: GraphQLRuleType,
        args: {
          payload: {
            type: new GraphQLNonNull(GraphQLRuleAddInputType),
          },
        },
        async resolve(
          _,
          args: { payload: RuleInput<unknown> },
          { user, rules }: Context
        ) {
          if (!user) {
            throw new Error('Must be logged in to add applications');
          }

          if (
            !rules ||
            !rules.some(
              rule =>
                rule.subject == 'application' && ['add'].includes(rule.action)
            )
          )
            throw new Error('Unauthorized to add applications');

          return createRepository<Partial<Rule>>('meta', 'rule').then(repo =>
            repo.add({
              created: new Date(),
              creator: user.id,
              updated: new Date(),
              updater: user.id,
              ...args.payload,
            })
          );
        },
      },
      editRule: {
        type: GraphQLRuleType,
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
          payload: {
            type: new GraphQLNonNull(GraphQLRuleEditInputType),
          },
        },
        async resolve(
          _,
          args: {
            id: string;
            payload: RuleInput<unknown>;
          },
          { user, rules }: Context
        ) {
          if (!user) {
            throw new Error('Must be logged in to edit applications');
          }

          if (
            !rules ||
            !rules.some(
              rule =>
                rule.subject == 'application' && ['edit'].includes(rule.action)
            )
          )
            throw new Error('Unauthorized to edit applications');

          return createRepository<Partial<Rule>>('meta', 'application').then(
            repo =>
              repo.edit(
                {
                  updated: new Date(),
                  updater: user.id,
                  ...args.payload,
                },
                args.id
              )
          );
        },
      },
    },
  }),
  types: [GraphQLRuleType],
});
