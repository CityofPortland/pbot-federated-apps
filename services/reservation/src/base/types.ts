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
      type: new GraphQLNonNull(GraphQLString),
      resolve: (parent: Base, _: unknown, context: Context) =>
        context.user ? parent.creator : null,
    },
    created: {
      type: new GraphQLNonNull(GraphQLDateTime),
    },
    updater: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (parent: Base, _: unknown, context: Context) =>
        context.user ? parent.updater : null,
    },
    updated: {
      type: new GraphQLNonNull(GraphQLDateTime),
    },
  };
};
