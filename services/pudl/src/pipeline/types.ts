import { DocumentNode } from 'graphql';
import { gql } from 'graphql-tag';

export const typeDefs: DocumentNode = gql`
  extend type Query {
    pipeline(id: String!): Pipeline
    pipelines: [Pipeline]
  }

  type Pipeline {
    id: String!
    tags: [String!]
    schedule: String
    lastRun: PipelineRun
    allRuns: [PipelineRun!]
  }

  enum PipelineStatus {
    failed
    none
    running
    success
  }

  type PipelineRun {
    id: String!
    status: PipelineStatus!
    startTime: DateTime!
    endTime: DateTime
  }

  extend type Table {
    pipelines: [Pipeline]
  }
`;

enum PipelineStatus {
  'failed',
  'success',
}

export type PipelineRun = {
  id: string;
  status: PipelineStatus;
  startTime: Date;
  endTime?: Date;
};

export type Pipeline = {
  id: string;
  schedule?: string;
  tags?: Array<string>;
  lastRun?: PipelineRun;
  allRuns?: Array<PipelineRun>;
};

export default typeDefs;
