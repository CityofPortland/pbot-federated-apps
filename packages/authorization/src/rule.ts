import { BaseUserChangeableType } from '@pbotapps/objects';

export type RuleType<T> = BaseUserChangeableType & {
  inverted: boolean;
  subject: string;
  action: string;
  conditions: string | Record<keyof T, any>;
  fields: Record<keyof T, boolean>;
};
