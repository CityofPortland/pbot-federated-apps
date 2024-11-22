import { createRepository } from '@pbotapps/cosmos';

import { Rule } from './types.js';

const repository = () => createRepository<Rule>('meta', 'rule');

export const getRules = async (application: string) => {
  const repo = await repository();

  return repo.query('select * from rule r where r.applicationId = @id', [
    { name: 'id', value: application },
  ]);
};
