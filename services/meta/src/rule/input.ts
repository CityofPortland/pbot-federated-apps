export type RuleInput<T> = {
  inverted: boolean;
  action: string;
  subject: string;
  conditions?: Record<keyof T, string>;
  fields?: Record<keyof T, boolean>;
  applicationUuid: string;
};
