import { config as loadenv } from 'dotenv';
import knex, { Knex } from 'knex';

if (process.env.NODE_ENV !== 'production') {
  const out = loadenv();
  if (out.error) {
    console.error(out.error);
  }
}

export const RawMetastore = knex({
  client: 'postgres',
  connection: {
    host: process.env.PUDL_POSTGRES_HOST,
    port: Number.parseInt(process.env.PUDL_POSTGRES_PORT),
    user: process.env.PUDL_POSTGRES_USERNAME,
    password: process.env.PUDL_POSTGRES_PASSWORD,
    database: 'raw_zone',
  },
  searchPath: ['public'],
}) as Knex;

export const EnrichedMetastore = knex({
  client: 'postgres',
  connection: {
    host: process.env.PUDL_POSTGRES_HOST,
    port: Number.parseInt(process.env.PUDL_POSTGRES_PORT),
    user: process.env.PUDL_POSTGRES_USERNAME,
    password: process.env.PUDL_POSTGRES_PASSWORD,
    database: 'enriched_zone',
  },
  searchPath: ['public'],
}) as Knex;

export default {
  enriched: EnrichedMetastore,
  raw: RawMetastore,
};
