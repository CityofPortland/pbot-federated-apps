import { Entity } from './entity';
import { Rule } from './rule';

export type User = Entity & {
  email?: string;
  firstName?: string;
  lastName?: string;
  rules?: Array<Rule>;
};
