import { createRepository } from '@pbotapps/cosmos';
import {
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { Base, baseFields } from '../base/types.js';
import { GraphQLUserType } from '../user/types.js';
import { GraphQLApplicationType } from '../application/types.js';

export type Rule = Base & {
  applicationId: string;
  inverted: boolean;
  action: string;
  subject: string;
  conditions: object;
  fields: object;
};

export type RuleAddInput = Pick<
  Rule,
  'inverted' | 'action' | 'subject' | 'conditions' | 'fields'
>;
export type RuleEditInput = Partial<RuleAddInput>;

export const GraphQLRuleType = new GraphQLObjectType<Rule>({
  name: 'Rule',
  description: 'A rule for an application',
  fields() {
    return {
      ...baseFields(),
      inverted: {
        type: new GraphQLNonNull(GraphQLBoolean),
      },
      action: {
        type: new GraphQLNonNull(GraphQLString),
      },
      subject: {
        type: new GraphQLNonNull(GraphQLString),
      },
      conditions: {
        type: GraphQLString,
      },
      fields: {
        type: GraphQLString,
      },
      application: {
        type: GraphQLApplicationType,
        async resolve(rule: Rule) {
          const repo = await createRepository('meta', 'application');

          return repo.get(rule.applicationId);
        },
      },
      users: {
        type: new GraphQLList(GraphQLUserType),
        async resolve(rule: Rule) {
          const repo = await createRepository('meta', 'user');

          return repo.query(
            'select * from u where ARRAY_CONTAINS(u.rules, @id)',
            [{ name: '@id', value: rule.id }]
          );
        },
      },
    };
  },
});

export const GraphQLRuleAddInputType = new GraphQLInputObjectType({
  name: 'RuleAddInput',
  fields: {
    inverted: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    action: {
      type: new GraphQLNonNull(GraphQLString),
    },
    subject: {
      type: new GraphQLNonNull(GraphQLString),
    },
    conditions: {
      type: GraphQLString,
    },
    fields: {
      type: GraphQLString,
    },
  },
});

export const GraphQLRuleEditInputType = new GraphQLInputObjectType({
  name: 'RuleEditInput',
  fields: {
    inverted: {
      type: GraphQLBoolean,
    },
    action: {
      type: GraphQLString,
    },
    subject: {
      type: GraphQLString,
    },
    conditions: {
      type: GraphQLString,
    },
    fields: {
      type: GraphQLString,
    },
  },
});
