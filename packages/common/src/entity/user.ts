import { BaseEntity } from './base';

export interface User extends BaseEntity {
  email?: string;

  firstName: string;

  lastName: string;

  oauthId: string;
}
