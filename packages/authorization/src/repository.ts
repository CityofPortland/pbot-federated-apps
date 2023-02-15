import { BaseType, User } from '@pbotapps/objects';
import { RuleType } from './rule';

export interface UserRepository {
  getUser(
    where: Partial<Pick<User, '_id' | 'oauthId'> & { query: string }>
  ): Promise<User | undefined>;
}

export interface RuleRepository {
  getRules(where: {
    user: User;
    application: BaseType;
  }): Promise<Array<RuleType> | undefined>;
}
