import type { RuleType } from '@pbotapps/authorization/rule';
import { User } from '@pbotapps/objects';

export type Context<T = unknown> = {
  application: string;
  user?: User;
  rules?: Array<RuleType<T>>;
};
