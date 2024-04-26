import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';

import { Base, baseFields } from '../base/types.js';
import { GraphQLSpotType, Spot } from '../spot/types.js';
import { GraphQLHotelType, Hotel } from '../hotel/types.js';
import { GraphQLDateTime } from 'graphql-scalars';
import { createRepository } from '@pbotapps/cosmos';

export type Reservation = Base & {
  hotelId: string;
  spotId: string;
  start: Date;
  end: Date;
  active: boolean;
};

export const GraphQLReservationType = new GraphQLObjectType<Reservation>({
  name: 'Reservation',
  description: 'A Reservation for a bus parking spot',
  fields() {
    return {
      ...baseFields(),
      hotel: {
        type: new GraphQLNonNull(GraphQLHotelType),
        resolve: async res => {
          const repo = await createRepository<Hotel>('reservations', 'hotel');
          return repo.get(res.hotelId);
        },
      },
      spot: {
        type: new GraphQLNonNull(GraphQLSpotType),
        resolve: async res => {
          const repo = await createRepository<Spot>('reservations', 'spot');
          return repo.get(res.spotId);
        },
      },
      start: { type: new GraphQLNonNull(GraphQLDateTime) },
      end: { type: new GraphQLNonNull(GraphQLDateTime) },
      active: { type: new GraphQLNonNull(GraphQLBoolean) },
    };
  },
});

export const GraphQLReservationAddInputType = new GraphQLInputObjectType({
  name: 'ReservationAddInput',
  fields: {
    hotelId: { type: new GraphQLNonNull(GraphQLID) },
    spotId: { type: new GraphQLNonNull(GraphQLID) },
    start: { type: new GraphQLNonNull(GraphQLDateTime) },
    end: { type: new GraphQLNonNull(GraphQLDateTime) },
  },
});

export const GraphQLReservationEditInputType = new GraphQLInputObjectType({
  name: 'ReservationEditInput',
  fields: {
    hotelId: { type: GraphQLID },
    spotId: { type: GraphQLID },
    start: { type: GraphQLDateTime },
    end: { type: GraphQLDateTime },
    active: { type: GraphQLBoolean },
  },
});
