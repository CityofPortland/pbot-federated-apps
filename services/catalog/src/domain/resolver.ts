import { BaseEntity, BaseEntityUserChanges } from '@pbotapps/common';
import DataLoader from 'dataloader';

import knex from '../data-source';
import { DataDomain } from './type';
import { FindDataDomainInput } from './input';

const source = knex<DataDomain>('data_domain');

export const loader = new DataLoader<string, DataDomain>(
  async keys => await source.whereIn('uuid', keys).select('*')
);

const resolvers: Record<string, any> = {
  DataDomain: {
    __resolveReference({ uuid }) {
      return loader.load(uuid);
    },
  },
  Query: {
    dataDomains: async (_, { input }: { input: FindDataDomainInput }) => {
      const { uuid, ...rest } = input;

      let query = source;

      if (uuid) {
        return loader.load(uuid);
      }

      if (rest) {
        const { name } = rest;

        if (name) query = query.whereILike({ name });
      }

      const results = await query
        .select({ uuid })
        .then(values => loader.loadMany(values.map(({ uuid }) => uuid)));

      return results;
    },
  },
  Mutation: {
    addDataDomain: (
      _,
      { input }: { input: Omit<DataDomain, keyof BaseEntityUserChanges> }
    ) =>
      source
        .insert({ ...input })
        .returning('uuid')
        .then(values => loader.loadMany(values.map(({ uuid }) => uuid)))
        .catch(() => {
          throw new Error();
        }),
    updateDataDomain: (
      _,
      {
        uuid,
        input,
      }: { uuid: string; input: Omit<DataDomain, keyof BaseEntityUserChanges> }
    ) =>
      source
        .where({ uuid })
        .update({ ...input })
        .returning('uuid')
        .then(values => loader.loadMany(values.map(({ uuid }) => uuid))),
    deleteDataset: (_, { uuid }: Pick<DataDomain, keyof BaseEntity>) =>
      source.where({ uuid }).delete(),
  },
};

export default resolvers;
