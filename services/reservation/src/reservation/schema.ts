import { User } from '@pbotapps/authorization';
import { createRepository } from '@pbotapps/cosmos';
import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
} from 'graphql';

import {
  GraphQLReservationAddInputType,
  GraphQLReservationEditInputType,
  GraphQLReservationType,
  Reservation,
} from './types.js';
import { GraphQLDateTime } from 'graphql-scalars';

const repository = () =>
  createRepository<Partial<Reservation>>(
    'reservations',
    'reservation',
    'zoneId'
  );

export const GraphQLReservationSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields() {
      return {
        reservations: {
          type: new GraphQLList(GraphQLReservationType),
          args: {
            start: { type: GraphQLDateTime },
            end: { type: GraphQLDateTime },
          },
          async resolve(_query, { start, end }: { start?: Date; end?: Date }) {
            const now = new Date();
            const repo = await repository();

            const iterable = repo.container.items
              .readAll<Reservation>()
              .getAsyncIterator();

            const results = new Array<Reservation>();

            for await (let { resources } of iterable) {
              if (!start && !end) {
                resources = resources.filter(r => new Date(r.end) >= now);
              }

              if (start) {
                resources = resources.filter(r => new Date(r.end) >= start);
              }

              if (end) {
                resources = resources.filter(r => new Date(r.start) <= end);
              }

              results.push(...resources);
            }

            return results;
          },
        },
      };
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      addReservation: {
        type: GraphQLReservationType,
        args: {
          payload: {
            type: new GraphQLNonNull(GraphQLReservationAddInputType),
          },
        },
        async resolve(
          _,
          args: {
            payload: Pick<Reservation, 'hotelId' | 'zoneId' | 'start' | 'end'>;
          },
          context: { user: User }
        ) {
          if (!context.user) {
            throw new Error('Must be logged in to add reservations');
          }

          const res: Partial<Reservation> = {
            created: new Date(),
            creator: context.user.email,
            updated: new Date(),
            updater: context.user.email,
            ...args.payload,
          };

          return repository()
            .then(repo => repo.add(res))
            .then(Reservation => Reservation);
        },
      },
      editReservation: {
        type: GraphQLReservationType,
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
          payload: {
            type: new GraphQLNonNull(GraphQLReservationEditInputType),
          },
        },
        async resolve(
          _,
          args: {
            id: string;
            payload: Pick<Reservation, 'hotelId' | 'zoneId' | 'start' | 'end'>;
          },
          context: { user: User }
        ) {
          if (!context.user) {
            throw new Error('Must be logged in to edit reservations');
          }

          const repo = await repository();

          let res = {
            updated: new Date(),
            updater: context.user.email,
            ...args.payload,
          };

          res = await repo.edit(args.id, res);

          return res;
        },
      },
    },
  }),
  types: [GraphQLReservationType],
});
