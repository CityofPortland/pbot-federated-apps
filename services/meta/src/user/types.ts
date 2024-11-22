import { GraphQLObjectType, GraphQLString } from 'graphql';
import { baseFields } from '../base/types.js';

const userFields = () => {
  return {
    oauthId: { type: GraphQLString },
    email: { type: GraphQLString },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
  };
};

export const GraphQLUserType = new GraphQLObjectType({
  name: 'User',
  description: 'A user of applications with rules associated to them',
  fields() {
    return {
      ...baseFields(),
      ...userFields(),
    };
  },
});
