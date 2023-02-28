import type { Client } from '@elastic/elasticsearch';
import type { IndicesCreateRequest } from '@elastic/elasticsearch/lib/api/types';
import { createClient } from '@pbotapps/elasticsearch';
import dotenv from 'dotenv';

if (process.env.NODE_ENV == 'development') dotenv.config();

export const elasticsearchClient: Client = createClient({
  url: process.env.ELASTICSEARCH_HOST,
});

const ensureIndex = ({ index }: IndicesCreateRequest) =>
  elasticsearchClient.indices.exists({ index }).then(exists => {
    if (!exists) elasticsearchClient.indices.create({ index });
  });

ensureIndex({ index: 'metabase_application' });
ensureIndex({ index: 'metabase_rule' });
ensureIndex({ index: 'metabase_user' });
