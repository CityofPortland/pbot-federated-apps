import {
  BaseUserChangeableType,
  BaseType,
  User as BaseUser,
} from '@pbotapps/objects';
import { gql } from 'graphql-tag';

export const typeDefs = gql(`
  type User @key(fields: "_id") {
    _id: ID!
    _created: DateTime!
    _changed: DateTime!
    oauthId: String!
    email: String!
    firstName: String
    lastName: String
  }

  input UserInput {
    oauthId: String
    email: String
    firstName: String
    lastName: String
  }

  extend type Query {
    me: User
    user(email: String!): User
    users: [User]
  }

  extend type Mutation {
    createUser(input: UserInput!): User
    updateUser( _id: ID!, input: UserInput!): User
  }
`);

export type User = BaseUser &
  BaseUserChangeableType & {
    email: string;
    firstName: string;
    lastName: string;
    applications?: Array<BaseType>;
    rules?: Array<string>;
  };

export default typeDefs;
