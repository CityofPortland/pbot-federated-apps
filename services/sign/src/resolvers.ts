import { GraphQLResolverMap } from '@apollo/subgraph/dist/schema-helper';
import { createRepository } from '@pbotapps/cosmos';
import { Context } from '@pbotapps/graphql';
import { DateTimeResolver } from 'graphql-scalars';
import GraphQLUpload, { FileUpload } from 'graphql-upload/GraphQLUpload.mjs';
import sharp from 'sharp';
import { blobServiceClient } from './client.js';
import { FindSignInput, Sign, SignInput } from './types.js';

const repository = () =>
  createRepository<Partial<Sign>>('sign-library', 'sign');

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

export const resolvers: GraphQLResolverMap<Context> = {
  Query: {
    rules: (_root, _args, context) => {
      return context.rules;
    },
    signs: async (
      _root,
      { input }: { input?: FindSignInput }
    ): Promise<Array<Sign>> => {
      const repo = await repository();

      const iterable = repo.container.items.readAll<Sign>().getAsyncIterator();

      const results = new Array<Sign>();

      for await (let { resources } of iterable) {
        // if not set, only get upcoming reservations
        if (input) {
          if (input._id) {
            resources = resources.filter(r => r.code == input._id);
          }

          if (input.code) {
            resources = resources.filter(r => r.code == input.code);
          }

          if (input.status) {
            resources = resources.filter(r => r.status == input.status);
          }

          if (input.query) {
            resources = resources.filter(
              r => r.code.match(input.query) || r.legend.match(input.query)
            );
          }
        }

        results.push(...resources);
      }

      return results;
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

      const repo = await repository();

      if (await repo.exists(input.code))
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

      await repo.add(sign);

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

      const repo = await repository();

      if (!(await repo.exists(input.code)))
        throw new Error(`Sign with id '${_id}' does not exist!`);

      const result = await repo.get(input.code);

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

      await repo.edit(sign, id);

      return { _id: id, ...sign };
    },
  },
  Sign: {
    async __resolveReference({ _id }: Sign) {
      return await repository().then(repo => repo.get(_id));
    },
    _changedBy(sign: Sign, _args, context) {
      if (!context.user) {
        return null;
      } else {
        return sign._changedBy;
      }
    },
    _createdBy(sign: Sign, _args, context) {
      if (!context.user) {
        return null;
      } else {
        return sign._createdBy;
      }
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
