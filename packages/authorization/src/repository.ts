import { BaseType, User } from '@pbotapps/objects';
import type { Rule } from './rule.js';

export interface UserRepository {
  getUser(user: Partial<User>): Promise<User | undefined>;
}

export interface RuleRepository {
  getRules(where: {
    user: User;
    application: BaseType;
  }): Promise<Array<Partial<Rule> | undefined>>;
}
