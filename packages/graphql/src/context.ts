import type { Rule } from '@pbotapps/authorization/rule';
import type { User } from '@pbotapps/objects';
import type DataLoader from 'dataloader';
import type { Logger } from 'pino';

export type Context<T = any> = {
  application: string;
  user?: User;
  rules?: Array<Rule<T>>;
  client: any;
  loaders?: Record<string, DataLoader<string, any>>;
  logger?: Logger;
};
