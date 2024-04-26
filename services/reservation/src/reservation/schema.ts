import { createRepository } from '@pbotapps/cosmos';
import { Context } from '@pbotapps/graphql';
import {
  GraphQLBoolean,
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
    '/spotId'
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
            active: { type: GraphQLBoolean },
          },
          async resolve(
            _query,
            {
              active,
              start,
              end,
            }: { start?: Date; end?: Date; active: boolean }
          ) {
            const now = new Date();
            const repo = await repository();

            const iterable = repo.container.items
              .readAll<Reservation>()
              .getAsyncIterator();

            const results = new Array<Reservation>();

            for await (let { resources } of iterable) {
              // if not set, only get upcoming reservations
              if (!start && !end) {
                resources = resources.filter(r => new Date(r.end) >= now);
              }

              if (start) {
                resources = resources.filter(r => new Date(r.end) >= start);
              }

              if (end) {
                resources = resources.filter(r => new Date(r.start) <= end);
              }

              if (active != undefined) {
                resources = resources.filter(r => r.active == active);
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
            payload: Pick<Reservation, 'hotelId' | 'spotId' | 'start' | 'end'>;
          },
          { user, rules }: Context
        ) {
          if (!user) {
            throw new Error('Must be logged in to add reservations');
          }

          if (
            !rules ||
            !rules.some(
              rule =>
                rule.subject == 'reservation' && ['write'].includes(rule.action)
            )
          )
            throw new Error('Unauthorized to add reservations');

          const res: Partial<Reservation> = {
            created: new Date(),
            creator: user._id,
            updated: new Date(),
            updater: user._id,
            active: true,
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
          spotId: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'The previous spot id of the reservation to modify',
          },
          payload: {
            type: new GraphQLNonNull(GraphQLReservationEditInputType),
          },
        },
        async resolve(
          _,
          args: {
            id: string;
            spotId: string;
            payload: Pick<
              Reservation,
              'active' | 'hotelId' | 'spotId' | 'start' | 'end'
            >;
          },
          { user, rules }: Context
        ) {
          if (!user) {
            throw new Error('Must be logged in to edit reservations');
          }

          if (
            !rules ||
            !rules.some(
              rule =>
                rule.subject == 'reservation' && ['write'].includes(rule.action)
            )
          )
            throw new Error('Unauthorized to edit reservations');

          const repo = await repository();

          const existing = await repo.get(args.id, args.spotId);

          if (!existing.active) {
            throw new Error('Cannot modify cancelled reservation');
          }

          let res = {
            updated: new Date(),
            updater: user._id,
            ...args.payload,
          };

          res = await repo.edit(res, args.id, args.spotId);

          return res;
        },
      },
    },
  }),
  types: [GraphQLReservationType],
});
