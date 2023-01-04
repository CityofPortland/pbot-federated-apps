import { buildSubgraphSchema } from '@apollo/subgraph';
import { handleToken } from '@pbotapps/authorization';
import { createLoader, createServer } from '@pbotapps/graphql';
import { config as loadenv } from 'dotenv';
import { json } from 'express';

import source from './data-source';
import schema from './schema';

if (process.env.NODE_ENV !== 'production') {
  loadenv();
}

createServer({
  application: 'catalog',
  schema: buildSubgraphSchema(schema),
  handlers: [json(), handleToken(source, { fail: true })],
  loaderCallback() {
    return {
      dataset: createLoader(source, 'dataset'),
      domain: createLoader(source, 'domain'),
    };
  },
});
