import DataLoader from 'dataloader';
import { Knex } from 'knex';

export * from './client.js';
export * from './context.js';
export * from './server.js';
export * from './types/index.js';

export function createLoader<TValue>(source: Knex, tableName: string) {
  return new DataLoader<string, TValue>(async keys =>
    source(tableName).whereIn('uuid', keys).select('*')
  );
}
