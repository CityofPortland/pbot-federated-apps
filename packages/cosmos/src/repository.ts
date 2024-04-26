import { CosmosClient, ItemDefinition, SqlParameter } from '@azure/cosmos';
import { BaseType } from '@pbotapps/objects';

export async function createRepository<
  T extends ItemDefinition & Partial<BaseType>
>(databaseId: string, containerId: string, partitionKey = '/id') {
  if (!process.env.AZURE_COSMOS_URL) {
    throw new Error(
      "You must provide 'AZURE_COSMOS_URL' environment variable!"
    );
  }

  const client = new CosmosClient({
    endpoint: process.env.AZURE_COSMOS_URL,
    key: process.env.AZURE_COSMOS_KEY,
  });

  const { database } = await client.databases.createIfNotExists({
    id: databaseId,
  });

  const { container } = await database.containers.createIfNotExists({
    id: containerId,
    partitionKey: partitionKey,
  });

  return {
    client,
    container,
    database,
    async add(item: T) {
      const { resource } = await container.items.create<T>({
        id: item.id,
        ...item,
      });
      return resource;
    },
    async delete(id: string, partition?: string) {
      const { statusCode } = await container
        .item(id, partition || id)
        .delete<T>();
      return statusCode == 204;
    },
    async edit(item: T, id: string, partition?: string) {
      const existing = await this.get(id, partition);
      await container.item(id, partition || id).replace<T>({
        ...existing,
        ...item,
      });
      const updated = await this.get(id, partition);
      return updated;
    },
    async exists(id: string, partition?: string) {
      const { resource, statusCode } = await container
        .item(id, partition || id)
        .read<T>();
      if (resource) return true;
      return statusCode == 200;
    },
    async get(id: string, partition?: string) {
      const { resource: existing } = await container
        .item(id, partition || id)
        .read<T>();
      return existing;
    },
    async getAll() {
      const results = new Array<T>();
      const iter = container.items.readAll<T>().getAsyncIterator();

      for await (const { resources } of iter) {
        results.push(...resources);
      }

      return results;
    },
    async query(statement: string, parameters: Array<SqlParameter>) {
      const results = new Array<T>();

      const iter = container.items
        .query<T>({
          query: statement,
          parameters,
        })
        .getAsyncIterator();

      for await (const { resources } of iter) {
        results.push(...resources);
      }

      return results;
    },
  };
}
