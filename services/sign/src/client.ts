import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient } from '@azure/storage-blob';
import { Client } from '@elastic/elasticsearch';
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

elasticsearchClient.indices.exists({ index: 'sign-library' }).then(exists => {
  if (!exists) {
    elasticsearchClient.indices.create({ index: 'sign-library' });
  }
});

export const blobServiceClient = new BlobServiceClient(
  `https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
  new DefaultAzureCredential()
);
