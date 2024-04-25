import { Context } from '@pbotapps/graphql';
import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

export const GraphQLRuleType = new GraphQLObjectType({
  name: 'Rule',
  fields: {
    action: { type: GraphQLString },
    subject: { type: GraphQLString },
    application: { type: GraphQLString },
  },
});

export const GraphQLRuleSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields() {
      return {
        rules: {
          type: new GraphQLList(GraphQLRuleType),
          async resolve(_parent, _args, { rules }: Context) {
            return rules;
          },
        },
      };
    },
  }),
  types: [GraphQLRuleType],
});
