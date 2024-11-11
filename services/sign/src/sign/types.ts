import { Context } from '@pbotapps/graphql';
import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { Base, baseFields } from '../base/types.js';
import { GraphQLEmailAddress } from 'graphql-scalars';

export enum SignColor {
  'black',
  'brown',
  'green',
  'orange',
  'pink',
  'red',
  'white',
  'yellow',
}

const GraphQLSignColor = new GraphQLEnumType({
  name: 'SignColor',
  values: {
    BLACK: { value: 'black' },
    BROWN: { value: 'brown' },
    GREEN: { value: 'green' },
    ORANGE: { value: 'orange' },
    PINK: { value: 'pink' },
    RED: { value: 'red' },
    WHITE: { value: 'white' },
    YELLOW: { value: 'yellow' },
  },
});

export enum SignShape {
  'diamond',
  'octagon',
  'rectangle',
  'square',
  'triangle',
}

export enum SignStatus {
  'in_use',
  'obsolete',
}

export enum SignType {
  'bike',
  'construction',
  'guide',
  'parking',
  'pedestrian',
  'regulatory',
  'school',
  'warning',
}

export type SignImage = {
  thumbnail: string;
  full: string;
  design: string;
};

export const GraphQLSignImageType = new GraphQLObjectType<SignImage>({
  name: 'SignImage',
  description: 'URLs for various sign image formats',
  fields() {
    return {
      design: { type: GraphQLString },
      full: { type: GraphQLString },
      thumbnail: { type: GraphQLString },
    };
  },
});

export type Sign = Base & {
  _revisions: Array<Partial<Omit<Sign, '_revisions'>>>;
  code: string;
  color: Array<SignColor>;
  comment?: string;
  height: number;
  image?: SignImage;
  legend: string;
  mutcdCode?: string;
  obsoletePolicy: string;
  replacedBy: string;
  shape: SignShape;
  source: string;
  status: SignStatus;
  type: Array<SignType>;
  width: number;
};

export const GraphQLSignType = new GraphQLObjectType<Sign>({
  name: 'Sign',
  description: 'A sign that can reserve a bus parking zone',
  fields() {
    return {
      ...baseFields(),
      _revisions: Array<Partial<Omit<Sign, '_revisions'>>>,
      code: new GraphQLNonNull(GraphQLString),
      color: Array<SignColor>,
      comment: GraphQLString,
      height: new GraphQLNonNull(GraphQLInt),
      image: GraphQLSignImageType,
      legend: new GraphQLNonNull(GraphQLString),
      mutcdCode: GraphQLString,
      obsoletePolicy: GraphQLString,
      replacedBy: GraphQLString,
      shape: SignShape,
      source: GraphQLString,
      status: SignStatus,
      type: Array<SignType>,
      width: GraphQLInt,
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

export const GraphQLHotelDeleteInputType = new GraphQLInputObjectType({
  name: 'HotelDeleteInput',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
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
