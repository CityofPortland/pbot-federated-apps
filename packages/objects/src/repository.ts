import DataLoader from 'dataloader';
import { Knex } from 'knex';

export function createLoader<TValue>(source: Knex, tableName: string) {
  return new DataLoader<string, TValue>(async keys =>
    source(tableName).whereIn('uuid', keys).select('*')
  );
}
