import { BaseType } from './base.js';

export type User = {
  oauthId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
} & BaseType;
