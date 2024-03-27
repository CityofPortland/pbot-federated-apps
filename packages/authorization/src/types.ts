import { User as BaseUser } from '@pbotapps/objects';

export type AuthObject = {
  accessToken: string;
  expiration: number;
  refreshToken: string;
  scopes: Array<string>;
};

export type AuthRequest = {
  codes: PkceCodes;
  initiated: boolean;
  redirect: string;
  prompt: 'consent' | 'none' | 'select_account';
  scopes: Array<string>;
};

export type PkceCodes = { challenge: string; verifier: string };

export type User = BaseUser & {
  firstName: string;
  lastName: string;
  email: string;
  photo?: string;
};
