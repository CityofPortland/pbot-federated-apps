import { buildSubgraphSchema } from '@apollo/subgraph';
import { GraphQLResolverMap } from '@apollo/subgraph/dist/schema-helper';
import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient } from '@azure/storage-blob';
import { Client } from '@elastic/elasticsearch';
import {
  QueryDslQueryContainer,
  SearchRequest,
} from '@elastic/elasticsearch/lib/api/types';
import { handleToken } from '@pbotapps/authorization';
import { Context, createServer } from '@pbotapps/graphql';
import { BaseUserChangeableType } from '@pbotapps/objects';
import { json } from 'express';
import { DateTimeResolver } from 'graphql-scalars';
import gql from 'graphql-tag';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import sharp from 'sharp';

enum SignStatus {
  'active',
  'retired',
}

type Sign = BaseUserChangeableType & {
  code: string;
  status: SignStatus;
  description: string;
  image_base_path?: string;
  image?: SignImage;
};

type SignImage = {
  basePath: string;
  thumbnail: string;
  full: string;
  design: string;
};

type SignInput = Pick<Sign, 'code' | 'status' | 'description'> & {
  image: File;
  design: File;
};

type FindSignInput = Pick<Sign, '_id' | 'code' | 'status'> & {
  query: string;
};

const typeDefs = gql`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.0"
      import: ["@key", "@shareable"]
    )

  scalar Upload
  scalar DateTime

  type Query {
    signs(input: FindSignInput): [Sign]
  }

  type Mutation {
    addSign(input: SignInput!): Sign!
    editSign(_id: String!, input: SignInput!): Sign!
  }

  input SignInput {
    code: String
    status: SignStatus
    description: String
    image: Upload
    design: Upload
  }

  input FindSignInput {
    _id: ID
    query: String
    status: SignStatus
  }

  type SignImage {
    thumbnail: String!
    full: String!
    design: String!
  }

  enum SignStatus {
    active
    retired
  }

  type Sign @key(fields: "_id") {
    _id: ID!
    _created: DateTime!
    _changed: DateTime!
    _createdBy: ID!
    _changedBy: ID!
    code: String
    status: SignStatus
    image: SignImage
    description: String!
  }
`;

const client = new Client({
  node: { url: new URL('https://elasticsearch:9200') },
  auth: {
    username: 'elastic',
    password: 'KQLGtG1Se3hUm6OKFquG',
  },
  caFingerprint:
    '62:9D:07:33:66:48:90:D5:BF:45:35:1C:84:9B:6B:AF:B9:FE:4E:13:E7:4E:3B:C3:23:31:8D:2E:30:F3:9A:75',
  tls: {
    // might be required if it's a self-signed certificate
    rejectUnauthorized: false,
  },
});

const blobServiceClient = new BlobServiceClient(
  `https://account.blob.core.windows.net`,
  new DefaultAzureCredential()
);

const resolvers: GraphQLResolverMap<Context> = {
  Query: {
    signs: async (
      _root,
      { input }: { input?: FindSignInput },
      _context,
      _info
    ): Promise<Array<Sign>> => {
      let req: SearchRequest = {
        index: 'sign-library',
      };

      if (input) {
        if (input._id) {
          return await client
            .get<Sign>({
              index: 'sign-library',
              id: input._id,
            })
            .then(res => [{ _id: res._id, ...res._source }]);
        }

        if (input.query) {
          req = {
            ...req,
            query: {
              simple_query_string: {
                query: input.query,
                fields: ['code', 'description'],
                default_operator: 'or',
              },
            },
          };
        }

        let filters = new Array<QueryDslQueryContainer>();

        if (input.code) {
          filters = [...filters, ...[{ term: { code: input.code } }]];
        }

        if (input.status) {
          filters = [...filters, ...[{ term: { status: input.status } }]];
        }

        if (filters.length) {
          req = {
            ...req,
            query: {
              ...req.query,
            },
          };
        }
      }

      return client
        .search<Sign>({
          ...req,
        })
        .then(res =>
          res.hits.hits.map(hit => {
            return { _id: hit._id, ...hit._source } as Sign;
          })
        )
        .catch(err => {
          console.error(err);
          return [];
        });
    },
  },
  Mutation: {
    async addSign(_root, { input }: { input: SignInput }, _context, _info) {
      const { code, design, image, ...rest } = input;

      await client
        .get<Sign>({
          index: 'sign-library',
          id: code,
        })
        .then(res => {
          if (res.found)
            throw new Error(`Sign with code '${code}' already exists!`);
        })
        .catch(() => {
          return;
        });

      const sign: Partial<Sign> = {
        _created: new Date(),
        _createdBy: 'user',
        _changed: new Date(),
        _changedBy: 'user',
        code,
        ...rest,
      };

      // do something with image
      if (image) {
        console.debug('Got an image!');
      }

      await client.index({
        index: 'sign-library',
        id: code,
        document: { ...sign },
      });

      return await client
        .get<Sign>({
          index: 'sign-library',
          id: code,
        })
        .then(res => {
          return {
            _id: res._id,
            ...res._source,
          } as Sign;
        });
    },
    async editSign(
      _root,
      { _id, input }: { _id: string; input: SignInput },
      _context,
      _info
    ) {
      const { design, image, ...rest } = input;

      let sign: Partial<Sign> = {
        _changed: new Date(),
        _changedBy: 'user',
        ...rest,
      };

      if (design) {
        console.debug('Got a design file!');

        const ext = design.name.split('.').pop();

        const containerClient =
          blobServiceClient.getContainerClient('sign-library');

        const designClient = containerClient.getBlockBlobClient(
          `${_id}@design.${ext}`
        );

        designClient.uploadData(await design.arrayBuffer());

        sign.image = {
          ...sign.image,
          design: designClient.url,
        };
      }

      // do something with image
      if (image) {
        console.debug('Got an image!');

        const buffer = await image.arrayBuffer();

        const containerClient =
          blobServiceClient.getContainerClient('sign-library');

        const fullClient = containerClient.getBlockBlobClient(
          `${_id}@2048.png`
        );
        const thumbnailClient = containerClient.getBlockBlobClient(
          `${_id}@128.png`
        );

        fullClient.uploadData(
          await sharp(new Uint8Array(buffer))
            .resize({
              fit: 'contain',
              width: 2048,
            })
            .toFormat('png')
            .toBuffer()
        );

        thumbnailClient.uploadData(
          await sharp(new Uint8Array(buffer))
            .resize({
              fit: 'contain',
              width: 128,
            })
            .toFormat('png')
            .toBuffer()
        );

        // set SignImage properties
        sign.image = {
          basePath: containerClient.url,
          full: fullClient.url,
          thumbnail: thumbnailClient.url,
          ...sign.image,
        };
      }

      await client.update<Sign>({
        index: 'sign-library',
        id: _id,
        doc: { ...sign },
      });

      return client
        .get<Sign>({
          index: 'sign-library',
          id: _id,
        })
        .then(res => {
          return {
            _id: res._id,
            ...res._source,
          } as Sign;
        });
    },
  },
  Sign: {
    async __resolveReference({ _id }: Sign) {
      return await client.get<Sign>({
        index: 'sign-library',
        id: _id,
      });
    },
  },
  DateTime: DateTimeResolver,
  Upload: GraphQLUpload,
};

const schema = { typeDefs, resolvers };

createServer({
  application: 'sign_library',
  schema: buildSubgraphSchema(schema),
  handlers: [json(), handleToken(client, { fail: false })],
  loaderCallback: undefined,
});
