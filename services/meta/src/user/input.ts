import { BaseChangeableType } from '@pbotapps/objects';
import { User } from './type';

export type UserInput = Omit<User, keyof BaseChangeableType | 'applications'>;
