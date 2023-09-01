import { BaseUserChangeableType } from '@pbotapps/objects';
import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';
import { FileUpload } from 'graphql-upload/processRequest.mjs';

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

export enum SignShape {
  'diamond',
  'octagon',
  'rectangle',
  'square',
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

export type Sign = BaseUserChangeableType & {
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

export type SignImage = {
  thumbnail: string;
  full: string;
  design: string;
};

export type SignInput = Omit<
  Sign,
  keyof BaseUserChangeableType | '_revisions' | 'image'
> & {
  image: Promise<FileUpload>;
  design: Promise<FileUpload>;
};

export type FindSignInput = Pick<Sign, '_id' | 'code' | 'status'> & {
  query: string;
};

export const typeDefs: DocumentNode = gql`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.0"
      import: ["@key", "@shareable"]
    )

  scalar Upload
  scalar DateTime

  type Query {
    rules: [Rule]
    signs(input: FindSignInput): [Sign]
  }

  type Mutation {
    addSign(input: SignInput!): Sign!
    editSign(_id: ID!, input: SignInput!): Sign!
  }

  input SignInput {
    code: String
    color: [String]
    comment: String
    design: Upload
    height: Int
    image: Upload
    legend: String
    mutcdCode: String
    odotCode: String
    obsoletePolicy: String
    replacedBy: ID
    shape: SignShape
    source: String
    status: SignStatus
    type: [SignType]
    width: Int
  }

  input FindSignInput {
    _id: ID
    query: String
    status: SignStatus
  }

  type SignImage {
    thumbnail: String
    full: String
    design: String
  }

  enum SignShape {
    diamond
    octagon
    rectangle
    square
  }

  enum SignStatus {
    in_use
    obsolete
  }

  enum SignType {
    construction
    guide
    parking
    regulatory
    school
    pedestrian
    bike
    warning
  }

  interface SignInterface {
    _created: DateTime
    _changed: DateTime
    _createdBy: ID
    _changedBy: ID
    code: String
    color: [String]
    comment: String
    height: Int
    image: SignImage
    legend: String
    mutcdCode: String
    odotCode: String
    obsoletePolicy: String
    replacedBy: ID
    shape: SignShape
    source: String
    status: SignStatus
    type: [SignType]
    width: Int
  }

  type SignRevision implements SignInterface {
    _created: DateTime
    _changed: DateTime
    _createdBy: ID
    _changedBy: ID
    code: String
    color: [String]
    comment: String
    height: Int
    image: SignImage
    legend: String
    mutcdCode: String
    odotCode: String
    obsoletePolicy: String
    replacedBy: ID
    shape: SignShape
    source: String
    status: SignStatus
    type: [SignType]
    width: Int
  }

  type Sign implements SignInterface @key(fields: "_id") {
    _id: ID!
    _created: DateTime!
    _changed: DateTime!
    _createdBy: ID!
    _changedBy: ID!
    _revisions: [SignRevision]
    code: String!
    color: [String]
    comment: String
    height: Int
    image: SignImage
    legend: String!
    mutcdCode: String
    odotCode: String
    obsoletePolicy: String
    replacedBy: ID
    shape: SignShape
    source: String
    status: SignStatus
    type: [SignType]
    width: Int
  }

  type Rule @key(fields: "_id") {
    _id: ID!
    _created: DateTime!
    _changed: DateTime!
    _createdBy: ID!
    _changedBy: ID!
    action: String!
    subject: String!
  }
`;
