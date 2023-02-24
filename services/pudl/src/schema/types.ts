import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';

import { Zone } from '../zone/types.js';

export const typeDefs: DocumentNode = gql`
  type Schema {
    id: Int!
    name: String!
    description: String
    locationUri: String
    zone: Zone!
  }

  extend type Zone {
    schemas: [Schema]
  }
`;

export type Schema = {
  id: number;
  name: string;
  description: string;
  locationUri: string;
  zone: Zone;
};

export default typeDefs;
