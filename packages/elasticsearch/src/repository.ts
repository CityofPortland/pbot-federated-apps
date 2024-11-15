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
      const { id, ...rest } = item;
      await client.index<Omit<T, 'id'>>({
        index,
        id,
        document: rest,
      });
      return item;
    },
    async delete(id) {
      await client.delete({
        index,
        id,
      });

      return true;
    },
    async edit(id, item) {
      const existing = await this.get(id);
      const { id: _, ...rest } = item;
      await client.index<Omit<T, 'id'>>({
        index,
        id,
        document: {
          ...existing,
          ...rest,
        },
      });
      const updated = await this.get(id);

      return updated;
    },
    async exists(id) {
      const res = await client.get<Omit<T, 'id'>>({
        index,
        id: id,
      });

      return res.found;
    },
    async get(id) {
      const res = await client.get<Omit<T, 'id'>>({
        index,
        id: id,
      });

      return { id, ...res._source } as T;
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
