import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient } from '@azure/storage-blob';
import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

if (process.env.NODE_ENV == 'development') dotenv.config();

export const elasticsearchClient = new Client({
  node: process.env.ELASTICSEARCH_HOST,
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
