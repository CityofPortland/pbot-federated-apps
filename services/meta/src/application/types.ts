import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { Base, baseFields } from '../base/types.js';
import { createRepository } from '@pbotapps/cosmos';

export type Application = Base & {
  description: string;
  name: string;
  slug: string;
};

export const GraphQLApplicationType = new GraphQLObjectType<Application>({
  name: 'Application',
  description: 'A managed application',
  fields() {
    return {
      ...baseFields(),
      name: {
        type: new GraphQLNonNull(GraphQLString),
      },
      slug: {
        type: new GraphQLNonNull(GraphQLString),
      },
      description: {
        type: new GraphQLNonNull(GraphQLString),
      },
      rules: {
        type: new GraphQLList(GraphQLString),
        resolve: async (app: Application) => {
          const repo = await createRepository('meta', 'rules');
          const rules = await repo.query(
            'select * from rules a where a.id = @id',
            [{ name: 'id', value: app.id }]
          );
          return rules;
        },
      },
    };
  },
});

export const GraphQLApplicationAddInputType = new GraphQLInputObjectType({
  name: 'ApplicationAddInput',
  fields: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    description: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
});

export const GraphQLApplicationEditInputType = new GraphQLInputObjectType({
  name: 'ApplicationEditInput',
  fields: {
    name: {
      type: GraphQLString,
    },
    description: {
      type: GraphQLString,
    },
  },
});
