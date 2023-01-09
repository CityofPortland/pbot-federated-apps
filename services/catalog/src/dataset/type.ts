import { BaseEntityUserChanges } from '@pbotapps/common';
import { DocumentNode } from 'graphql';
import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Dataset @key(fields: "uuid") {
    uuid: ID!
    name: String!
    slug: String!
    summary: String
  }

  extend type User {
    datasets: [Dataset]
  }

  input DatasetInput {
    name: String
    slug: String
    summary: String
  }

  input FindDatasetInput {
    query: String
    uuid: String
  }

  extend type Query {
    datasets(input: FindDatasetInput): [Dataset]
  }

  extend type Mutation {
    addDataset(input: DatasetInput): Dataset
    updateDataset(uuid: ID!, input: DatasetInput): Dataset
  }
` as DocumentNode;

export class Dataset extends BaseEntityUserChanges {
  name: string;
  slug: string;
  summary: string;
}
