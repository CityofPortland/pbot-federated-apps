import { createRepository } from '@pbotapps/cosmos';
import { User } from './types.js';

export type UserSearch = Partial<
  Pick<User, 'email' | 'firstName' | 'lastName'>
>;

export async function getUser({
  email,
  firstName,
  lastName,
}: UserSearch): Promise<Array<User>> {
  const repo = await createRepository<User>('meta', 'user');

  const filters = new Map<string, string>();

  if (email != undefined) {
    filters.set('@email', 'u.email = @email');
  }

  if (firstName != undefined) {
    filters.set('@firstName', 'u.firstName = @firstName');
  }

  if (lastName != undefined) {
    filters.set('@lastName', 'u.lastName = @lastName');
  }

  const createFilterString = () => {
    return `where ${Array.from(filters.values()).join('and')}`;
  };

  const query = `select * from u ${
    filters.size > 0 ? createFilterString() : ''
  }`;

  return repo.query(query, [
    { name: '@email', value: email },
    { name: '@firstName', value: firstName },
    { name: '@lastName', value: lastName },
  ]);
}
