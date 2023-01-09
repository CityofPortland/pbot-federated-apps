import { config } from 'dotenv';
import { knex, Knex } from 'knex';

config();

function snakeCase(str) {
  return (
    str
      // ABc -> A_Bc
      .replace(/([A-Z])([A-Z])([a-z])/g, '$1_$2$3')
      // aC -> a_C
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .toLowerCase()
  );
}

export default knex({
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
}) as Knex;
