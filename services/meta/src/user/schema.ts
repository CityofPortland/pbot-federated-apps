import { Context } from '@pbotapps/graphql';
import { GraphQLObjectType, GraphQLSchema } from 'graphql';

import { getByOauth } from './repository.js';
import { GraphQLUserType } from './types.js';

export const GraphQLUserSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields() {
      return {
        me: {
          type: GraphQLUserType,
          async resolve(_root, _args, { user }: Context) {
            return getByOauth(user.oauthId);
          },
        },
      };
    },
  }),
});
