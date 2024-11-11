import { createRepository } from '@pbotapps/cosmos';
import { Context } from '@pbotapps/graphql';
import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
} from 'graphql';

import {
  GraphQLSignAddInputType,
  GraphQLSignEditInputType,
  GraphQLSignType,
  Sign,
} from './types.js';

export const GraphQLSignSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields() {
      return {
        signs: {
          type: new GraphQLList(GraphQLSignType),
          resolve: async () =>
            createRepository<Sign>('reservations', 'Sign').then(repo =>
              repo.getAll()
            ),
        },
      };
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      addSign: {
        type: GraphQLSignType,
        args: {
          payload: {
            type: new GraphQLNonNull(GraphQLSignAddInputType),
          },
        },
        async resolve(
          _,
          args: { payload: Pick<Sign, 'email' | 'enabled' | 'label'> },
          { user, rules }: Context
        ) {
          if (!user) {
            throw new Error('Must be logged in to add Signs');
          }

          if (
            !rules ||
            !rules.some(
              rule => rule.subject == 'Sign' && ['write'].includes(rule.action)
            )
          )
            throw new Error('Unauthorized to add Signs');

          const Sign: Partial<Sign> = {
            created: new Date(),
            creator: user._id,
            updated: new Date(),
            updater: user._id,
            ...args.payload,
          };

          return createRepository<Partial<Sign>>('reservations', 'Sign')
            .then(repo => repo.add(Sign))
            .then(Sign => Sign);
        },
      },
      editSign: {
        type: GraphQLSignType,
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
          payload: {
            type: new GraphQLNonNull(GraphQLSignEditInputType),
          },
        },
        async resolve(
          _,
          args: {
            id: string;
            payload: Pick<Sign, 'email' | 'enabled' | 'label'>;
          },
          { user, rules }: Context
        ) {
          if (!user) {
            throw new Error('Must be logged in to edit Signs');
          }

          if (
            !rules ||
            !rules.some(
              rule => rule.subject == 'Sign' && ['write'].includes(rule.action)
            )
          )
            throw new Error('Unauthorized to edit Signs');

          const repo = await createRepository<Partial<Sign>>(
            'reservations',
            'Sign'
          );

          let Sign: Partial<Sign> = {
            updated: new Date(),
            updater: user._id,
            ...args.payload,
          };

          Sign = await repo.edit(Sign, args.id);

          return Sign;
        },
      },
    },
  }),
  types: [GraphQLSignType],
});
