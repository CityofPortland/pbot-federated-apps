import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';

export const typeDefs: DocumentNode = gql`
  type Zone {
    name: String!
  }

  type Query {
    zone(name: String!): Zone
    zones: [Zone]
  }
`;

export const ZONES = ['enriched', 'raw'] as const;

export type Zone = {
  name: (typeof ZONES)[number];
};

export default typeDefs;
