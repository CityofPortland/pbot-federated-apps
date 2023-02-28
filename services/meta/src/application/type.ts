import { BaseUserChangeableType } from '@pbotapps/objects';
import { DocumentNode } from 'graphql';
import { gql } from 'graphql-tag';

import { Rule } from '../rule/type.js';

export const typeDefs = gql`
  type Application @key(fields: "_id") {
    _id: ID!
    _changed: DateTime!
    _changedBy: ID!
    _created: DateTime!
    _createdBy: ID!
    name: String!
    slug: String!
    description: String
  }

  extend type User {
    applications: [Application]
  }

  input ApplicationInput {
    name: String
    description: String
  }

  input FindApplicationInput {
    _id: ID
  }

  extend type Query {
    applications(input: FindApplicationInput): [Application]
  }

  extend type Mutation {
    addApplication(input: ApplicationInput): Application
    updateApplication(_id: ID!, input: ApplicationInput): Application
  }
` as DocumentNode;

export type Application = BaseUserChangeableType & {
  name: string;
  slug: string;
  description: string;
  rules?: Array<Rule<unknown>>;
};

export default typeDefs;
