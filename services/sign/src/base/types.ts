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

export const baseFields = () => {
  return {
    id: { type: new GraphQLNonNull(GraphQLID) },
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
      type: new GraphQLNonNull(GraphQLDateTime),
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
      type: new GraphQLNonNull(GraphQLDateTime),
    },
  };
};
