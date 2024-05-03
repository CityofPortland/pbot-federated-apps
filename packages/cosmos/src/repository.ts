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

  const add = async (item: T) => {
    const { resource } = await container.items.create<T>({
      id: item.id,
      ...item,
    });
    return resource;
  };

  const deleteItem = async (id: string, partition?: string) => {
    const { statusCode } = await container
      .item(id, partition || id)
      .delete<T>();
    return statusCode == 204;
  };

  const edit = async (item: T, id: string, partition?: string) => {
    const existing = await get(id, partition);

    await deleteItem(id, partition || id);

    const updated = await add({
      ...existing,
      ...item,
    });

    return updated;
  };

  const exists = async (id: string, partition?: string) => {
    const { resource, statusCode } = await container
      .item(id, partition || id)
      .read<T>();
    if (resource) return true;
    return statusCode == 200;
  };

  const get = async (id: string, partition?: string) => {
    const { resource: existing } = await container
      .item(id, partition || id)
      .read<T>();
    return existing;
  };

  const getAll = async () => {
    const results = new Array<T>();
    const iter = container.items.readAll<T>().getAsyncIterator();

    for await (const { resources } of iter) {
      results.push(...resources);
    }

    return results;
  };

  const query = async (statement: string, parameters: Array<SqlParameter>) => {
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
  };

  return {
    client,
    container,
    database,
    add,
    delete: deleteItem,
    edit,
    exists,
    get,
    getAll,
    query,
  };
}
