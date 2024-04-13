import { User } from '@pbotapps/authorization';
import { createRepository } from '@pbotapps/cosmos';
import {
  GraphQLBoolean,
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
          args: {
            enabled: { type: GraphQLBoolean },
          },
          async resolve(_, args: { enabled: boolean }) {
            const repo = await createRepository<Hotel>('reservations', 'hotel');
            const hotels = await repo.getAll();
            return hotels.filter(h => h.enabled == args.enabled);
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
          context: { user: User }
        ) {
          if (!context.user) {
            throw new Error('Must be logged in to add hotels');
          }

          const hotel: Partial<Hotel> = {
            created: new Date(),
            creator: context.user.email,
            updated: new Date(),
            updater: context.user.email,
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
          context: { user: User }
        ) {
          if (!context.user) {
            throw new Error('Must be logged in to edit hotels');
          }

          const repo = await createRepository<Partial<Hotel>>(
            'reservations',
            'hotel'
          );

          let hotel = {
            updated: new Date(),
            updater: context.user.email,
            ...args.payload,
          };

          hotel = await repo.edit(args.id, hotel);

          return hotel;
        },
      },
    },
  }),
  types: [GraphQLHotelType],
});
