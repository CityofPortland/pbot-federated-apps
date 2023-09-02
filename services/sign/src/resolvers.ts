import { GraphQLResolverMap } from '@apollo/subgraph/dist/schema-helper';
import {
  SearchHit,
  SearchRequest,
} from '@elastic/elasticsearch/lib/api/types.js';
import { scrollSearch } from '@pbotapps/elasticsearch';
import { Context } from '@pbotapps/graphql';
import { DateTimeResolver } from 'graphql-scalars';
import GraphQLUpload, { FileUpload } from 'graphql-upload/GraphQLUpload.mjs';
import sharp from 'sharp';
import { blobServiceClient, elasticsearchClient } from './client.js';
import { FindSignInput, Sign, SignInput } from './types.js';

async function uploadDesignFile(
  file: Promise<FileUpload>,
  { code }: Pick<Sign, 'code'>
) {
  const { filename, createReadStream } = await file;

  const ext = filename.split('.').pop();

  const containerClient = blobServiceClient.getContainerClient('sign-library');

  const designClient = containerClient.getBlockBlobClient(
    `${code}@design.${ext}`
  );

  designClient.uploadStream(createReadStream());

  return designClient.url;
}

async function uploadImageFiles(
  file: Promise<FileUpload>,
  { code }: Pick<Sign, 'code'>
) {
  const { createReadStream } = await file;

  const buffer = new Promise<Buffer>((resolve, reject) => {
    const stream = createReadStream();
    const _buf = Array<Uint8Array>();

    stream.on('data', chunk => _buf.push(chunk));
    stream.on('close', () => resolve(Buffer.concat(_buf)));
    stream.on('error', err => reject(`error converting stream - ${err}`));
  });

  const containerClient = blobServiceClient.getContainerClient('sign-library');

  const fullClient = containerClient.getBlockBlobClient(`${code}@2048.png`);
  const thumbnailClient = containerClient.getBlockBlobClient(`${code}@128.png`);

  await Promise.all([
    fullClient.uploadData(
      await sharp(new Uint8Array(await buffer))
        .resize({
          fit: 'contain',
          width: 2048,
        })
        .toFormat('png')
        .toBuffer()
    ),
    thumbnailClient.uploadData(
      await sharp(new Uint8Array(await buffer))
        .resize({
          fit: 'contain',
          width: 128,
        })
        .toFormat('png')
        .toBuffer()
    ),
  ]);

  return { full: fullClient.url, thumbnail: thumbnailClient.url };
}

function parseHit<T>(hit: SearchHit<T>) {
  const { _id, _source } = hit;
  return { _id, ..._source };
}

export const resolvers: GraphQLResolverMap<Context> = {
  Query: {
    rules: (_root, _args, context) => {
      return context.rules;
    },
    signs: async (
      _root,
      { input }: { input?: FindSignInput }
    ): Promise<Array<Sign>> => {
      const search: SearchRequest = {
        index: 'sign-library',
        scroll: '30s',
        size: 1000,
        query: {
          match_all: {},
        },
      };

      if (input) {
        search.query = {};

        if (input._id) {
          search.query = {
            ...search.query,
            match: {
              code: input._id,
            },
          };
        }

        if (input.query) {
          search.query = {
            ...search.query,
            match: {
              ...search.query.match,
              description: input.query,
              legend: input.query,
            },
          };
        }

        if (input.status) {
          search.query = {
            ...search.query,
            match: {
              ...search.query.match,
              status: input.status,
            },
          };
        }
      }

      const result = new Array<Sign>();

      for await (const hit of scrollSearch<Sign>(elasticsearchClient, search)) {
        result.push(parseHit(hit));
      }

      return result;
    },
  },
  Mutation: {
    async addSign(_root, { input }: { input: SignInput }, context) {
      if (
        !context.rules.find(
          rule => rule.action == 'create' && rule.subject == 'sign'
        )
      ) {
        throw new Error('You are not authorized to add signs');
      }

      const { code, design, image, ...rest } = input;

      if (
        await elasticsearchClient.exists({
          index: 'sign-library',
          id: code,
        })
      )
        throw new Error(`Sign with code '${code}' already exists!`);

      const _created = new Date();
      const _createdBy = context.user._id;

      const sign: Omit<Sign, '_id'> = {
        _created,
        _createdBy,
        _changed: _created,
        _changedBy: _createdBy,
        _revisions: [
          {
            _id: code,
            _created,
            _createdBy,
            _changed: _created,
            _changedBy: _createdBy,
            code,
            ...rest,
          },
        ],
        code,
        ...rest,
      };

      if (design) {
        sign.image = {
          ...sign.image,
          design: await uploadDesignFile(design, { code }),
        };
      }

      if (image) {
        sign.image = {
          ...sign.image,
          ...(await uploadImageFiles(image, { code })),
        };
      }

      await elasticsearchClient.index<Omit<Sign, '_id'>>({
        index: 'sign-library',
        id: code,
        document: sign,
      });

      return { _id: code, ...sign };
    },
    async editSign(
      _root,
      { _id, input }: { _id: string; input: SignInput },
      context
    ) {
      if (
        !context.rules.find(
          rule => rule.action == 'edit' && rule.subject == 'sign'
        )
      ) {
        throw new Error('You are not authorized to edit signs');
      }

      if (
        !(await elasticsearchClient.exists({
          index: 'sign-library',
          id: _id,
        }))
      )
        throw new Error(`Sign with id '${_id}' does not exist!`);

      const result = await elasticsearchClient
        .get<Sign>({
          index: 'sign-library',
          id: _id,
        })
        .then(res => parseHit(res));

      const { design, image, ...rest } = input;

      const _changed = new Date();
      const _changedBy = context.user._id;
      const _revisions = result._revisions;

      _revisions.push({ ...rest, _changed, _changedBy });

      if (design) {
        result.image = {
          ...result.image,
          design: await uploadDesignFile(design, { code: _id }),
        };
      }

      if (image) {
        result.image = {
          ...result.image,
          ...(await uploadImageFiles(image, { code: _id })),
        };
      }

      const { _id: id, ...sign } = {
        ...result,
        ...rest,
        _changed,
        _changedBy,
        _revisions,
      };

      await elasticsearchClient.index<Omit<Sign, '_id'>>({
        index: 'sign-library',
        id: id,
        document: sign,
      });

      return { _id: id, ...sign };
    },
  },
  Sign: {
    async __resolveReference({ _id }: Sign) {
      return await elasticsearchClient
        .get<Sign>({
          index: 'sign-library',
          id: _id,
        })
        .then(hit => parseHit(hit));
    },
    _revisions(sign: Sign, _args, context) {
      if (!context.user) {
        return null;
      } else {
        return sign._revisions;
      }
    },
    comment(sign: Sign, _args, context) {
      if (!context.user) {
        return null;
      } else {
        return sign.comment;
      }
    },
    source(sign: Sign, _args, context) {
      if (!context.user) {
        return null;
      } else {
        return sign.source;
      }
    },
  },
  DateTime: DateTimeResolver,
  Upload: GraphQLUpload,
};
