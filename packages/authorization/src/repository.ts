import { User } from '@pbotapps/objects';

export interface UserRepository {
  getUser(
    where: Partial<Pick<User, '_id' | 'oauthId'> & { query: string }>
  ): Promise<User>;
}
