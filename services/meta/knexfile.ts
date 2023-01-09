import { config as loadenv } from 'dotenv';
import { Knex } from 'knex';

loadenv();

function snakeCase(str: string) {
  return (
    str
      // ABc -> a_bc
      .replace(/([A-Z])([A-Z])([a-z])/g, '$1_$2$3')
      // aC -> a_c
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .toLowerCase()
  );
}

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'cockroachdb',
    connection: {
      host: process.env.DATASOURCE_HOST,
      port: Number.parseInt(process.env.DATASOURCE_PORT),
      user: process.env.DATASOURCE_USERNAME,
      password: process.env.DATASOURCE_PASSWORD,
      database: 'meta',
    },
    searchPath: ['public'],
    wrapIdentifier: (value, origImpl, _) => origImpl(snakeCase(value)),
  },

  staging: {
    client: 'cockroachdb',
    connection: {
      host: process.env.DATASOURCE_HOST,
      port: Number.parseInt(process.env.DATASOURCE_PORT),
      user: process.env.DATASOURCE_USERNAME,
      password: process.env.DATASOURCE_PASSWORD,
      database: 'meta',
    },
    searchPath: ['public'],
    wrapIdentifier: (value, origImpl, _) => origImpl(snakeCase(value)),
  },

  production: {
    client: 'cockroachdb',
    connection: {
      host: process.env.DATASOURCE_HOST,
      port: Number.parseInt(process.env.DATASOURCE_PORT),
      user: process.env.DATASOURCE_USERNAME,
      password: process.env.DATASOURCE_PASSWORD,
      database: 'meta',
    },
    searchPath: ['public'],
    wrapIdentifier: (value, origImpl, _) => origImpl(snakeCase(value)),
  },
};

module.exports = config;
