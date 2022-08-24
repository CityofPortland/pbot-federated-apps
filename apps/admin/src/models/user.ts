import { Entity } from './entity';

export type User = Entity & {
  email?: string;
};
