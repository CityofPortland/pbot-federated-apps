import { BaseChangeableType } from '@pbotapps/objects';
import { User } from './type.js';

export type UserInput = Omit<User, keyof BaseChangeableType | 'applications'>;
