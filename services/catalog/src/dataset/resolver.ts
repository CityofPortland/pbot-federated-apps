import { GraphQLResolverMap } from '@apollo/subgraph/dist/schema-helper';
import { BaseEntity, BaseEntityUserChanges } from '@pbotapps/common';
import { Context } from '@pbotapps/graphql';

import knex from '../data-source';
import { Dataset } from './type';
import { FindDatasetInput } from './input';

export const resolvers: GraphQLResolverMap<Context> = {
  Query: {
    datasets: async (_, { input }: { input: FindDatasetInput }, context) => {
      const { uuid, ...rest } = input;

      let query = knex<Dataset>('dataset');

      if (uuid) {
        return context.loaders.dataset.load(uuid);
      }

      if (rest) {
        const { name, slug } = rest;

        if (name) query = query.whereILike({ name });
        if (slug) query = query.where({ slug });
      }

      const results = await query
        .select({ uuid })
        .then(values =>
          context.loaders.dataset.loadMany(values.map(({ uuid }) => uuid))
        );

      return results;
    },
  },
  Mutation: {
    addDataset: (
      _,
      { input }: { input: Omit<Dataset, keyof BaseEntityUserChanges> },
      context
    ) =>
      knex<Dataset>('dataset')
        .insert({ ...input })
        .returning('uuid')
        .then(values =>
          context.loaders.dataset.loadMany(values.map(({ uuid }) => uuid))
        )
        .catch(() => {
          throw new Error();
        }),
    updateDataset: (
      _,
      {
        uuid,
        input,
      }: { uuid: string; input: Omit<Dataset, keyof BaseEntityUserChanges> },
      context
    ) =>
      knex<Dataset>('dataset')
        .where({ uuid })
        .update({ ...input })
        .returning('uuid')
        .then(values =>
          context.loaders.dataset.loadMany(values.map(({ uuid }) => uuid))
        ),
    deleteDataset: (_, { uuid }: Pick<Dataset, keyof BaseEntity>) =>
      knex<Dataset>('dataset').where({ uuid }).delete(),
  },
};

export default resolvers;
