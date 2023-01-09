import { User } from '@pbotapps/objects';
import { Knex } from 'knex';

export const getUser = (
  source: Knex,
  where: Partial<Pick<User, '_id' | 'oauthId'> & { query: string }>
) => source<User>('user').where(where).first();

export default {
  getUser,
  getRulesForUser() {
    return null;
  },
};
