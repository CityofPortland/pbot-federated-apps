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
  GraphQLHotelAddInputType,
  GraphQLHotelEditInputType,
  GraphQLHotelType,
  Hotel,
} from './types.js';

export const GraphQLHotelSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields() {
      return {
        hotels: {
          type: new GraphQLList(GraphQLHotelType),
          async resolve(_, _args, { rules }: Context) {
            if (
              !rules ||
              !rules.some(
                rule =>
                  rule.subject == 'hotel' && ['write'].includes(rule.action)
              )
            )
              throw new Error('Unauthorized to list hotels');

            const repo = await createRepository<Hotel>('reservations', 'hotel');

            const hotels = await repo.getAll();
            return hotels;
          },
        },
      };
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      addHotel: {
        type: GraphQLHotelType,
        args: {
          payload: {
            type: new GraphQLNonNull(GraphQLHotelAddInputType),
          },
        },
        async resolve(
          _,
          args: { payload: Pick<Hotel, 'email' | 'enabled' | 'label'> },
          { user, rules }: Context
        ) {
          if (!user) {
            throw new Error('Must be logged in to add hotels');
          }

          if (
            !rules ||
            !rules.some(
              rule => rule.subject == 'hotel' && ['write'].includes(rule.action)
            )
          )
            throw new Error('Unauthorized to add hotels');

          const hotel: Partial<Hotel> = {
            created: new Date(),
            creator: user.id,
            updated: new Date(),
            updater: user.id,
            ...args.payload,
          };

          return createRepository<Partial<Hotel>>('reservations', 'hotel')
            .then(repo => repo.add(hotel))
            .then(hotel => hotel);
        },
      },
      editHotel: {
        type: GraphQLHotelType,
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
          payload: {
            type: new GraphQLNonNull(GraphQLHotelEditInputType),
          },
        },
        async resolve(
          _,
          args: {
            id: string;
            payload: Pick<Hotel, 'email' | 'enabled' | 'label'>;
          },
          { user, rules }: Context
        ) {
          if (!user) {
            throw new Error('Must be logged in to edit hotels');
          }

          if (
            !rules ||
            !rules.some(
              rule => rule.subject == 'hotel' && ['write'].includes(rule.action)
            )
          )
            throw new Error('Unauthorized to edit hotels');

          const repo = await createRepository<Partial<Hotel>>(
            'reservations',
            'hotel'
          );

          let hotel: Partial<Hotel> = {
            updated: new Date(),
            updater: user.id,
            ...args.payload,
          };

          hotel = await repo.edit(hotel, args.id);

          return hotel;
        },
      },
    },
  }),
  types: [GraphQLHotelType],
});
