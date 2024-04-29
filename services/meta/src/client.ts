import { Client } from '@elastic/elasticsearch';
import type { IndicesCreateRequest } from '@elastic/elasticsearch/lib/api/types.js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.env.NODE_ENV == 'development') dotenv.config();

export const elasticsearchClient = new Client({
  node: process.env.ELASTICSEARCH_HOST,
  auth: {
    username: 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD,
  },
  tls: {
    ca: readFileSync(resolve(__dirname, 'elastic.crt')),
    rejectUnauthorized: false,
  },
});

const ensureIndex = ({ index }: IndicesCreateRequest) =>
  elasticsearchClient.indices.exists({ index }).then(exists => {
    if (!exists) elasticsearchClient.indices.create({ index });
  });

ensureIndex({ index: 'metabase_application' });
ensureIndex({ index: 'metabase_rule' });
ensureIndex({ index: 'metabase_user' });
