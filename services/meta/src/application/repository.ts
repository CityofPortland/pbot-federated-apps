import { createRepository } from '@pbotapps/cosmos';

import { Application } from './types.js';

const repository = () => createRepository<Application>('meta', 'application');

export const getApplication = async (id: string): Promise<Application> => {
  const repo = await repository();

  return repo.get(id);
};

export const getApplications = async () => {
  const repo = await repository();

  return repo.getAll();
};
