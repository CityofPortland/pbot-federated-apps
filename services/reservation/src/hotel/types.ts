import { Context } from '@pbotapps/graphql';
import {
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { Base, baseFields } from '../base/types.js';
import { GraphQLEmailAddress } from 'graphql-scalars';

export type Hotel = Base & {
  email: string;
  enabled: boolean;
  label: string;
};

export const GraphQLHotelType = new GraphQLObjectType<Hotel>({
  name: 'Hotel',
  description: 'A hotel that can reserve a bus parking zone',
  fields() {
    return {
      ...baseFields(),
      email: {
        type: new GraphQLNonNull(GraphQLEmailAddress),
        resolve: (source, _args, { rules }: Context) => {
          if (
            !rules ||
            !rules.some(rule => {
              rule.subject == 'hotel' && ['write'].includes(rule.action);
            })
          ) {
            return source.email;
          }

          return null;
        },
      },
      enabled: {
        type: new GraphQLNonNull(GraphQLBoolean),
      },
      label: {
        type: new GraphQLNonNull(GraphQLString),
      },
    };
  },
});

export const GraphQLHotelAddInputType = new GraphQLInputObjectType({
  name: 'HotelAddInput',
  fields: {
    email: {
      type: new GraphQLNonNull(GraphQLEmailAddress),
    },
    enabled: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    label: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
});

export const GraphQLHotelEditInputType = new GraphQLInputObjectType({
  name: 'HotelEditInput',
  fields: {
    email: {
      type: GraphQLEmailAddress,
    },
    enabled: {
      type: GraphQLBoolean,
    },
    label: {
      type: GraphQLString,
    },
  },
});
