import { Application } from './application';
import { Entity } from './entity';
import { User } from './user';

export type Rule = Entity & {
  inverted?: boolean;
  action?: string;
  subject?: string;
  conditions?: Record<string, unknown>;
  fields?: Record<string, unknown>;
  application?: Application;
  users?: User[];
};
