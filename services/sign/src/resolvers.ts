import { GraphQLResolverMap } from '@apollo/subgraph/dist/schema-helper';
import { Context } from '@pbotapps/graphql';
import { DateTimeResolver } from 'graphql-scalars';
import GraphQLUpload, { FileUpload } from 'graphql-upload/GraphQLUpload.mjs';
import sharp from 'sharp';
import { blobServiceClient } from './client.js';
import { FindSignInput, Sign, SignInput } from './types.js';

const signs = new Array<Sign>();

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
    stream.on('end', () => resolve(Buffer.concat(_buf)));
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
    signs: async (
      _root,
      { input }: { input?: FindSignInput }
    ): Promise<Array<Sign>> => {
      let ret = signs;

      if (input) {
        if (input._id) {
          ret = ret.filter(s => s._id == input._id);
        }

        if (input.query) {
          const r = new RegExp(input.query);
          ret = ret.filter(
            s => r.test(s.description) || r.test(s.code) || r.test(s.legend)
          );
        }

        if (input.code) {
          ret = ret.filter(s => s.code == input.code);
        }

        if (input.status) {
          ret = ret.filter(s => s.status == input.status);
        }
      }

      return ret;
    },
  },
  Mutation: {
    async addSign(_root, { input }: { input: SignInput }, context) {
      const { code, design, image, ...rest } = input;

      if (signs.find(s => s.code == code))
        throw new Error(`Sign with code '${code}' already exists!`);

      const _created = new Date();
      const _createdBy = context.user._id;

      const sign: Sign = {
        _id: code,
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

      signs.push(sign);

      return sign;
    },
    async editSign(
      _root,
      { _id, input }: { _id: string; input: SignInput },
      context
    ) {
      const sign = signs.find(s => s._id == _id);

      if (!sign) throw new Error(`Sign with id '${_id}' does not exist!`);

      const { design, image, ...rest } = input;

      const _changed = new Date();
      const _changedBy = context.user._id;
      const _revisions = sign._revisions;

      _revisions.push({ ...rest });

      if (design) {
        sign.image = {
          ...sign.image,
          design: await uploadDesignFile(design, { code: _id }),
        };
      }

      if (image) {
        sign.image = {
          ...sign.image,
          ...(await uploadImageFiles(image, { code: _id })),
        };
      }

      const s = { ...sign, ...rest, _changed, _changedBy, _revisions };

      signs.splice(
        signs.findIndex(s => s._id == _id),
        1,
        s
      );

      return s;
    },
  },
  Sign: {
    async __resolveReference({ _id }: Sign) {
      return await signs.find(s => s._id == _id);
    },
  },
  DateTime: DateTimeResolver,
  Upload: GraphQLUpload,
};
