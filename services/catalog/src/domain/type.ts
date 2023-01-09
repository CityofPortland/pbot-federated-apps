import { BaseEntityUserChanges } from '@pbotapps/common';
import gql from 'graphql-tag';

export const typeDefs = gql`
    type Domain @key(fields: "uuid") {
        uuid: ID!
    }

    type DomainConnection {
        total: Int!
        edges: [DomainEdge]
    }

    type DomainEdge {
        node: Domain
        cursor: String
    }

    extend type Dataset {
        domains(): DomainConnection
    }
}`;

export interface DataDomain extends BaseEntityUserChanges {
  name: string;
  slug: string;
  summary: string;
}
