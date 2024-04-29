import { DocumentNode } from 'graphql';
import { gql } from 'graphql-tag';

export type Page = {
  title: string;
  scripts?: Array<string>;
  content: string;
};

export const typeDefs: DocumentNode = gql`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.0"
      import: ["@key", "@shareable"]
    )

  type Page {
    title: String!
    scripts: [Script]
    content: String!
  }

  type Script {
    src: String
    body: String
  }

  type Query {
    page(tree: [String!]!): Page
  }
`;
