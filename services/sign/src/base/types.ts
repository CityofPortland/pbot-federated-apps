import { Context } from '@pbotapps/graphql';
import { GraphQLID, GraphQLNonNull, GraphQLString } from 'graphql';
import { GraphQLDateTime } from 'graphql-scalars';

export type Base = {
  id: string;
  created: Date;
  creator: string;
  updated: Date;
  updater: string;
};

export const baseFields = ({ required }: { required: boolean }) => {
  return {
    id: { type: required ? new GraphQLNonNull(GraphQLID) : GraphQLID },
    creator: {
      type: GraphQLString,
      resolve: (parent: Base, _: unknown, context: Context) => {
        if (!context.user) {
          return null;
        }
        return parent.creator;
      },
    },
    created: {
      type: required ? new GraphQLNonNull(GraphQLDateTime) : GraphQLDateTime,
    },
    updater: {
      type: GraphQLString,
      resolve: (parent: Base, _: unknown, context: Context) => {
        if (!context.user) {
          return null;
        }
        return parent.updater;
      },
    },
    updated: {
      type: required ? new GraphQLNonNull(GraphQLDateTime) : GraphQLDateTime,
    },
  };
};
