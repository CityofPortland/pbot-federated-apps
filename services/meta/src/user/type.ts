import { BaseChangeableType, User as BaseUser } from '@pbotapps/objects';
import gql from 'graphql-tag';

export const typeDefs = gql(`
  type User @key(fields: "_id") {
    _id: ID!
    _created: DateTime!
    _changed: DateTime!
    _createdBy: ID!
    _changedBy: ID!
    oauthId: String!
    email: String!
    firstName: String
    lastName: String
  }
`);

export type User = BaseUser &
  BaseChangeableType & {
    email: string;
    firstName: string;
    lastName: string;
  };

export default typeDefs;
