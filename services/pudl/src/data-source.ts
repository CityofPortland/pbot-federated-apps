import { config as loadenv } from 'dotenv';
import { DataSource } from 'typeorm';
import { ZoneType } from './zone/entity';

if (process.env.NODE_ENV !== 'production') {
  const out = loadenv();
  if (out.error) {
    console.error(out.error);
  }
}

export const RawMetastore = new DataSource({
  type: 'postgres',
  host: process.env.PUDL_POSTGRES_HOST,
  port: parseInt(process.env.PUDL_POSTGRES_PORT),
  username: process.env.PUDL_POSTGRES_USERNAME,
  password: process.env.PUDL_POSTGRES_PASSWORD,
  database: 'raw_zone',
  entities: ['./**/entity.js'],
  synchronize: false,
  logging: false,
});

export const EnrichedMetastore = new DataSource({
  type: 'postgres',
  host: process.env.PUDL_POSTGRES_HOST,
  port: parseInt(process.env.PUDL_POSTGRES_PORT),
  username: process.env.PUDL_POSTGRES_USERNAME,
  password: process.env.PUDL_POSTGRES_PASSWORD,
  database: 'enriched_zone',
  entities: ['./**/entity.js'],
  synchronize: false,
  logging: false,
});

export default {
  enriched: EnrichedMetastore,
  raw: RawMetastore,
};

export function getDataSource(z: Array<ZoneType> | ZoneType) {
  const zones = Array.isArray(z) ? z : [z];

  return zones.map(zone => {
    switch (zone) {
      case 'enriched':
        return EnrichedMetastore;
      case 'raw':
        return RawMetastore;
    }
  });
}
