import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient } from '@azure/storage-blob';
import dotenv from 'dotenv';

if (process.env.NODE_ENV == 'development') dotenv.config();

export const blobServiceClient = new BlobServiceClient(
  `https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
  new DefaultAzureCredential()
);
