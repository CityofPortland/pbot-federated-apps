import type { RuleType } from '@pbotapps/authorization/rule';
import { User } from '@pbotapps/objects';
import DataLoader from 'dataloader';

export type Context<T = any> = {
  application: string;
  user?: User;
  rules?: Array<RuleType<T>>;
  client: any;
  loaders?: Record<string, DataLoader<string, any>>;
};
