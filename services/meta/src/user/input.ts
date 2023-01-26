import { User } from './type';

export type UserInput = Pick<User, 'email' | 'firstName' | 'lastName'>;
