import { createRepository } from '@pbotapps/cosmos';
import { Context } from '@pbotapps/graphql';
import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import { FileUpload } from 'graphql-upload/processRequest.mjs';

import {
  GraphQLSignAddInputType,
  GraphQLSignEditInputType,
  GraphQLSignType,
  SignInput,
  Sign,
} from './types.js';
import { blobServiceClient } from '../client.js';
import sharp from 'sharp';

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

  await designClient.uploadStream(createReadStream()).then(() =>
    designClient.setHTTPHeaders({
      blobCacheControl: 'public, max-age=31536000',
    })
  );

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
    fullClient
      .uploadData(
        await sharp(new Uint8Array(await buffer))
          .resize({
            fit: 'contain',
            width: 2048,
          })
          .toFormat('png')
          .toBuffer()
      )
      .then(() =>
        fullClient.setHTTPHeaders({
          blobContentType: 'image/png',
          blobCacheControl: 'public, max-age=31536000',
        })
      ),
    thumbnailClient
      .uploadData(
        await sharp(new Uint8Array(await buffer))
          .resize({
            fit: 'contain',
            width: 128,
          })
          .toFormat('png')
          .toBuffer()
      )
      .then(() =>
        thumbnailClient.setHTTPHeaders({
          blobContentType: 'image/png',
          blobCacheControl: 'public, max-age=31536000',
        })
      ),
  ]);

  return { full: fullClient.url, thumbnail: thumbnailClient.url };
}

export const GraphQLSignSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields() {
      return {
        getSign: {
          type: GraphQLSignType,
          args: {
            code: {
              type: GraphQLString,
            },
          },
          resolve: async (_root, { code }: { code: string }) =>
            repository().then(repo => repo.get(code)),
        },
        signs: {
          type: new GraphQLList(GraphQLSignType),
          resolve: async () => repository().then(repo => repo.getAll()),
        },
      };
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      addSign: {
        type: GraphQLSignType,
        args: {
          payload: {
            type: new GraphQLNonNull(GraphQLSignAddInputType),
          },
        },
        async resolve(
          _,
          args: { payload: SignInput },
          { user, rules }: Context
        ) {
          if (
            !rules.find(
              rule => rule.action == 'create' && rule.subject == 'sign'
            )
          ) {
            throw new Error('You are not authorized to add signs');
          }

          const { code, design, image, ...rest } = args.payload;

          const repo = await repository();

          if (await repo.exists(code))
            throw new Error(`Sign with code '${code}' already exists!`);

          const created = new Date();
          const creator = user.id;

          const sign: Omit<Sign, 'id'> = {
            created,
            creator,
            updated: created,
            updater: creator,
            _revisions: [
              {
                id: code,
                created,
                creator,
                updated: created,
                updater: creator,
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

          await repo.add({ id: code, ...sign });

          return { id: code, ...sign };
        },
      },
      editSign: {
        type: GraphQLSignType,
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
          payload: {
            type: new GraphQLNonNull(GraphQLSignEditInputType),
          },
        },
        async resolve(
          _root,
          {
            id,
            payload,
          }: {
            id: string;
            payload: SignInput;
          },
          { user, rules }: Context
        ) {
          if (
            !rules.find(rule => rule.action == 'edit' && rule.subject == 'sign')
          ) {
            throw new Error('You are not authorized to edit signs');
          }

          const repo = await repository();

          if (!(await repo.exists(id)))
            throw new Error(`Sign with id '${id}' does not exist!`);

          const result = await repo.get(id);

          const { design, image, ...rest } = payload;

          const updated = new Date();
          const updater = user.id;
          const _revisions = result._revisions;

          _revisions.push({ ...rest, updated, updater });

          if (design) {
            result.image = {
              ...result.image,
              design: await uploadDesignFile(design, { code: id }),
            };
          }

          if (image) {
            result.image = {
              ...result.image,
              ...(await uploadImageFiles(image, { code: id })),
            };
          }

          const { id: _, ...sign } = {
            ...result,
            ...rest,
            updated,
            updater,
            _revisions,
          };

          await repo.edit(sign, id);

          return { id, ...sign };
        },
      },
    },
  }),
  types: [GraphQLSignType],
});
