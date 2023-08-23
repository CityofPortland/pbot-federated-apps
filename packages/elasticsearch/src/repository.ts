import { Client as ElasticsearchClient } from '@elastic/elasticsearch';
import { BaseType, Repository } from '@pbotapps/objects';

import { scrollSearch } from './index.js';

export async function createRepository<T extends Partial<BaseType>>(
  index: string
): Promise<Repository<T>> {
  const client = new ElasticsearchClient({
    node: process.env.ELASTICSEARCH_HOST,
  });

  if (!(await client.indices.exists({ index }))) {
    await client.indices.create({ index });
  }

  return {
    async add(item: T) {
      const { _id, ...rest } = item;
      await client.index<Omit<T, '_id'>>({
        index,
        id: _id,
        document: rest,
      });
      return item;
    },
    async delete(_id) {
      await client.delete({
        index,
        id: _id,
      });

      return true;
    },
    async edit(_id, item) {
      const existing = await this.get(_id);
      const { _id: _, ...rest } = item;
      await client.index<Omit<T, '_id'>>({
        index,
        id: _id,
        document: {
          ...existing,
          ...rest,
        },
      });
      const updated = await this.get(_id);

      return updated;
    },
    async exists(_id) {
      const res = await client.get<Omit<T, '_id'>>({
        index,
        id: _id,
      });

      return res.found;
    },
    async get(_id) {
      const res = await client.get<Omit<T, '_id'>>({
        index,
        id: _id,
      });

      return { _id, ...res._source } as T;
    },
    async getAll() {
      const results = new Array<T>();
      for await (const hit of scrollSearch<T>(client, {
        index,
        scroll: '30s',
        size: 1000,
        query: {
          match_all: {},
        },
      })) {
        const { _id, _source } = hit;
        results.push({ _id, ..._source });
      }
      return results;
    },
    async query() {
      return undefined;
    },
  };
}
