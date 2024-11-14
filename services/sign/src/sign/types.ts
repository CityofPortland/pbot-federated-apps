import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { Base, baseFields } from '../base/types.js';
import { FileUpload } from 'graphql-upload/processRequest.mjs';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';

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

// const GraphQLSignColorType = new GraphQLEnumType({
//   name: 'SignColor',
//   values: {
//     black: { value: 'black' },
//     blue: { value: 'blue' },
//     brown: { value: 'brown' },
//     green: { value: 'green' },
//     orange: { value: 'orange' },
//     pink: { value: 'pink' },
//     red: { value: 'red' },
//     white: { value: 'white' },
//     yellow: { value: 'yellow' },
//   },
// });

export enum SignShape {
  'diamond',
  'octagon',
  'rectangle',
  'square',
  'triangle',
}

const GraphQLSignShapeType = new GraphQLEnumType({
  name: 'SignShape',
  values: {
    diamond: { value: 'diamond' },
    octagon: { value: 'octagon' },
    rectangle: { value: 'rectangle' },
    square: { value: 'square' },
    triangle: { value: 'triangle' },
  },
});

export enum SignStatus {
  'in_use',
  'obsolete',
}

const GraphQLSignStatusType = new GraphQLEnumType({
  name: 'SignStatus',
  values: {
    in_use: { value: 'in_use' },
    obsolete: { value: 'obsolete' },
  },
});

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

const GraphQLSignTypeType = new GraphQLEnumType({
  name: 'SignType',
  values: {
    bike: { value: 'bike' },
    construction: { value: 'construction' },
    guide: { value: 'guide' },
    parking: { value: 'parking' },
    pedestrian: { value: 'pedestrian' },
    regulatory: { value: 'regulatory' },
    school: { value: 'school' },
    warning: { value: 'warning' },
  },
});

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

const signFields = ({ required }: { required: boolean }) => {
  return {
    code: {
      type: required ? new GraphQLNonNull(GraphQLString) : GraphQLString,
    },
    color: { type: new GraphQLList(GraphQLString) },
    comment: { type: GraphQLString },
    height: { type: required ? new GraphQLNonNull(GraphQLInt) : GraphQLInt },
    image: { type: GraphQLSignImageType },
    legend: {
      type: required ? new GraphQLNonNull(GraphQLString) : GraphQLString,
    },
    mutcdCode: { type: GraphQLString },
    obsoletePolicy: { type: GraphQLString },
    odotCode: { type: GraphQLString },
    replacedBy: { type: GraphQLString },
    shape: { type: GraphQLSignShapeType },
    source: { type: GraphQLString },
    status: { type: GraphQLSignStatusType },
    type: { type: new GraphQLList(GraphQLSignTypeType) },
    width: { type: required ? new GraphQLNonNull(GraphQLInt) : GraphQLInt },
  };
};

const GraphQLSignInterfaceType = new GraphQLInterfaceType({
  name: 'SignInterface',
  fields() {
    return {
      ...baseFields({ required: false }),
      ...signFields({ required: false }),
    };
  },
});

export const GraphQLSignType = new GraphQLObjectType<Sign>({
  name: 'Sign',
  description: 'A sign existing on the ',
  interfaces: [GraphQLSignInterfaceType],
  fields() {
    return {
      ...baseFields({ required: true }),
      _revisions: {
        type: new GraphQLList(
          new GraphQLObjectType({
            name: 'SignRevision',
            interfaces: [GraphQLSignInterfaceType],
            fields() {
              return {
                ...baseFields({ required: false }),
                ...signFields({ required: false }),
              };
            },
          })
        ),
      },
      ...signFields({ required: true }),
    };
  },
});

export type SignInput = Omit<Sign, keyof Base | '_revisions' | 'image'> & {
  image: Promise<FileUpload>;
  design: Promise<FileUpload>;
};

export const GraphQLSignAddInputType = new GraphQLInputObjectType({
  name: 'SignAddInput',
  fields() {
    const { image, ...rest } = signFields({ required: true });

    return {
      ...rest,
      design: { type: GraphQLUpload },
      image: { type: GraphQLUpload },
    };
  },
});

export const GraphQLSignEditInputType = new GraphQLInputObjectType({
  name: 'SignEditInput',
  fields() {
    const { image, ...rest } = signFields({ required: false });

    return {
      ...rest,
      design: { type: GraphQLUpload },
      image: { type: GraphQLUpload },
    };
  },
});
