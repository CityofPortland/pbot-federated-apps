import { BaseUserChangeableType } from '@pbotapps/objects';

export type RuleType<T = unknown> = BaseUserChangeableType & {
  applicationId?: string;
  inverted: boolean;
  subject: string;
  action: string;
  conditions?: Record<keyof T, string>;
  fields?: Record<keyof T, boolean>;
};
