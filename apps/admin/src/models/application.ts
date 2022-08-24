import { Entity } from './entity';
import { Rule } from './rule';
import { User } from './user';

export type Application = Entity & {
  name?: string;
  description?: string;
  users?: Array<User>;
  rules?: Array<Rule>;
};
