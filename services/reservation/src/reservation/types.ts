import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';

import { Base, baseFields } from '../base/types.js';
import { GraphQLZoneType, Zone } from '../zone/types.js';
import { GraphQLHotelType, Hotel } from '../hotel/types.js';
import { GraphQLDateTime } from 'graphql-scalars';
import { createRepository } from '@pbotapps/cosmos';

export type Reservation = Base & {
  hotelId: string;
  zoneId: string;
  start: Date;
  end: Date;
};

export const GraphQLReservationType = new GraphQLObjectType<Reservation>({
  name: 'Reservation',
  description: 'A Reservation for a bus parking zone',
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
      zone: {
        type: new GraphQLNonNull(GraphQLZoneType),
        resolve: async res => {
          const repo = await createRepository<Zone>('reservations', 'zone');
          return repo.get(res.zoneId);
        },
      },
      start: { type: new GraphQLNonNull(GraphQLDateTime) },
      end: { type: new GraphQLNonNull(GraphQLDateTime) },
    };
  },
});

export const GraphQLReservationAddInputType = new GraphQLInputObjectType({
  name: 'ReservationAddInput',
  fields: {
    hotelId: { type: new GraphQLNonNull(GraphQLID) },
    zoneId: { type: new GraphQLNonNull(GraphQLID) },
    start: { type: new GraphQLNonNull(GraphQLDateTime) },
    end: { type: new GraphQLNonNull(GraphQLDateTime) },
  },
});

export const GraphQLReservationEditInputType = new GraphQLInputObjectType({
  name: 'ReservationEditInput',
  fields: {
    hotelId: { type: GraphQLID },
    zoneId: { type: GraphQLID },
    start: { type: GraphQLDateTime },
    end: { type: GraphQLDateTime },
  },
});
