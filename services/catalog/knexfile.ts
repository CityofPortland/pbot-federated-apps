import { snakeCase } from '@pbotapps/misc';
import { config as loadenv } from 'dotenv';
import type { Knex } from 'knex';

loadenv();

// Update with your config settings.

export default async (environment: 'development' | 'production') => {
  const defaultConfiguration = {
    client: 'cockroachdb',
    connection: {
      host: process.env.DATASOURCE_HOST,
      port: Number.parseInt(process.env.DATASOURCE_PORT),
      user: process.env.DATASOURCE_USERNAME,
      password: process.env.DATASOURCE_PASSWORD,
      database: 'catalog',
    },
    searchPath: ['public'],
    wrapIdentifier: (value, origImpl) => origImpl(snakeCase(value)),
  };

  let config: Knex.Config = {
    ...defaultConfiguration,
    migrations: {
      tableName: '_migrations',
    },
  };

  if (environment != 'development') {
    config = {
      ...config,
      pool: {
        min: 2,
        max: 10,
      },
    };
  }

  return config;
};
