import { generateSource } from '@pbotapps/common';
import { config } from 'dotenv';
import { Knex } from 'knex';

config();

export default generateSource({ database: 'catalog' }) as Knex;
