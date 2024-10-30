import { config as loadenv } from 'dotenv';
import knex, { type Knex } from 'knex';

if (process.env.NODE_ENV !== 'production') {
  const out = loadenv();
  if (out.error) {
    console.error(out.error);
  }
}

export const AirflowMetastore = knex.knex({
  client: 'postgres',
  connection: {
    host: process.env.PUDL_POSTGRES_HOST,
    port: Number.parseInt(process.env.PUDL_POSTGRES_PORT),
    user: process.env.AIRFLOW_POSTGRES_USERNAME,
    password: process.env.AIRFLOW_POSTGRES_PASSWORD,
    database: 'airflow',
  },
  pool: { min: 0, max: 2 },
  searchPath: ['public'],
}) as Knex;

export const RawMetastore = knex.knex({
  client: 'postgres',
  connection: {
    host: process.env.PUDL_POSTGRES_HOST,
    port: Number.parseInt(process.env.PUDL_POSTGRES_PORT),
    user: process.env.PUDL_POSTGRES_USERNAME,
    password: process.env.PUDL_POSTGRES_PASSWORD,
    database: 'raw_zone',
  },
  pool: { min: 0, max: 2 },
  searchPath: ['public'],
}) as Knex;

export const EnrichedMetastore = knex.knex({
  client: 'postgres',
  connection: {
    host: process.env.PUDL_POSTGRES_HOST,
    port: Number.parseInt(process.env.PUDL_POSTGRES_PORT),
    user: process.env.PUDL_POSTGRES_USERNAME,
    password: process.env.PUDL_POSTGRES_PASSWORD,
    database: 'enriched_zone',
  },
  pool: { min: 0, max: 2 },
  searchPath: ['public'],
}) as Knex;

export default {
  airflow: AirflowMetastore,
  enriched: EnrichedMetastore,
  raw: RawMetastore,
};
