import { createRepository } from '@pbotapps/cosmos';
import { Context } from '@pbotapps/graphql';
import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
} from 'graphql';

import {
  GraphQLRuleAddInputType,
  GraphQLRuleEditInputType,
  GraphQLRuleType,
  Rule,
  RuleAddInput,
  RuleEditInput,
} from './types.js';

export const GraphQLRuleSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields() {
      return {
        rule: {
          type: GraphQLRuleType,
          args: {
            id: { type: new GraphQLNonNull(GraphQLID) },
          },
          async resolve(_, { id }: { id: string }) {
            const repo = await createRepository<Rule>('meta', 'rule');

            return repo.get(id);
          },
        },
        rules: {
          type: new GraphQLList(GraphQLRuleType),
          args: {
            applicationId: { type: GraphQLID },
          },
          async resolve(
            _parent,
            { applicationId }: { applicationId: string },
            { rules }: Context
          ) {
            if (
              !rules ||
              !rules.some(
                rule =>
                  rule.subject == 'rule' &&
                  ['add', 'edit', 'read'].includes(rule.action)
              )
            )
              throw new Error('Unauthorized to list appliations');

            const repo = await createRepository<Rule>('meta', 'rule');

            return applicationId != undefined
              ? repo.query(
                  'select * from rules a where a.applicationId = @id',
                  [{ name: '@id', value: applicationId }]
                )
              : repo.getAll();
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
          applicationId: { type: new GraphQLNonNull(GraphQLID) },
          payload: {
            type: new GraphQLNonNull(GraphQLRuleAddInputType),
          },
        },
        async resolve(
          _,
          {
            applicationId,
            payload,
          }: {
            applicationId: string;
            payload: RuleAddInput;
          },
          { user, rules }: Context
        ) {
          if (!user) {
            throw new Error('Must be logged in to add applications');
          }

          if (
            !rules ||
            !rules
              .filter(
                rule =>
                  rule.applicationId == undefined ||
                  rule.applicationId == applicationId
              )
              .some(
                rule => rule.subject == 'rule' && ['add'].includes(rule.action)
              )
          )
            throw new Error('Unauthorized to add rules');

          const rule: Partial<Rule> = {
            created: new Date(),
            creator: user.id,
            updated: new Date(),
            updater: user.id,
            applicationId,
            ...payload,
          };

          return createRepository<Partial<Rule>>('meta', 'rule').then(repo =>
            repo.add(rule)
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
            payload: RuleEditInput;
          },
          { user, rules }: Context
        ) {
          if (!user) {
            throw new Error('Must be logged in to edit rules');
          }

          if (
            !rules ||
            !rules.some(
              rule => rule.subject == 'rule' && ['edit'].includes(rule.action)
            )
          )
            throw new Error('Unauthorized to edit rules');

          const app = {
            updated: new Date(),
            updater: user.id,
            ...args.payload,
          };

          return createRepository<Partial<Rule>>('meta', 'rule').then(repo =>
            repo.edit(app, args.id)
          );
        },
      },
    },
  }),
  types: [GraphQLRuleType],
});
