import { BaseUserChangeableType } from '@pbotapps/objects';
import gql from 'graphql-tag';

export const typeDefs = gql(`
  type Rule @key(fields: "_id") {
    _id: ID!
    _created: DateTime!
    _changed: DateTime!
    _createdBy: ID!
    _changedBy: ID!
    application: Application!
    inverted: Boolean!
    action: String!
    subject: String!
    conditions: String
    fields: String
    users: [User]
  }

  input RuleInput {
    inverted: Boolean!
    action: String!
    subject: String!
    conditions: String
    fields: String
  }

  extend type Application {
    rules: [Rule]
  }

  extend type User {
    rules: [Rule]
  }

  extend type Mutation {
    addRule(applicationId: ID!, input: RuleInput): Rule
    updateRule(_id: ID!, input: RuleInput): Rule
    removeRule(_id: ID!): ID
    addRuleToUser(user_id: ID!, rule_id: ID!): ID
    removeRuleFromUser(user_id: ID!, rule_id: ID!): ID
  }

  extend type Query {
    rule(id: ID!): Rule
  }
`);

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

export default typeDefs;
