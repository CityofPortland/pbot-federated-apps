import { BaseUserChangeableType } from '@pbotapps/objects';
import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { GraphQLJSONObject } from 'graphql-scalars';

import { getApplication } from '../application/repository.js';
import { GraphQLApplicationType } from '../application/types.js';
import { baseFields } from '../base/types.js';

export type Rule<T = unknown> = BaseUserChangeableType & {
  /**
   * Whether the rule is to be considered 'cannot' instead of 'can'.
   */
  inverted: boolean;

  /**
   * What action the user can or cannot perform.
   */
  action: string;

  /**
   * What object this rule applies to.
   */
  subject: string;

  /**
   * Template to evaluate on the context to determine if this rule applies.
   */
  conditions?: Record<keyof T, string>;

  /**
   * Whether this rule is restricted to any fields.
   */
  fields?: Record<keyof T, boolean>;

  applicationId?: string;
};

export type RuleInput<T> = Omit<Rule<T>, keyof BaseUserChangeableType>;

const ruleFields = ({ required }: { required: boolean }) => {
  return {
    applicationId: {
      type: required ? new GraphQLNonNull(GraphQLID) : GraphQLID,
    },
    inverted: {
      type: required ? new GraphQLNonNull(GraphQLBoolean) : GraphQLBoolean,
    },
    action: {
      type: required ? new GraphQLNonNull(GraphQLString) : GraphQLString,
    },
    subject: {
      type: GraphQLString,
    },
    conditions: {
      type: GraphQLJSONObject,
    },
    fields: {
      type: GraphQLJSONObject,
    },
  };
};

export const GraphQLRuleType = new GraphQLObjectType({
  name: 'Rule',
  description: 'A rule applied to an application',
  fields() {
    return {
      ...baseFields(),
      ...ruleFields({ required: true }),
      application: {
        type: GraphQLApplicationType,
        resolve: async (rule: Rule) => {
          return getApplication(rule.applicationId);
        },
      },
    };
  },
});

export const GraphQLRuleAddInputType = new GraphQLInputObjectType({
  name: 'RuleAddInput',
  fields() {
    return {
      ...ruleFields({ required: true }),
    };
  },
});

export const GraphQLRuleEditInputType = new GraphQLInputObjectType({
  name: 'RuleEditInput',
  fields() {
    return {
      ...ruleFields({ required: false }),
    };
  },
});
