import { createRepository } from '@pbotapps/cosmos';

const repository = () => createRepository('meta', 'user');

export const get = async (id: string) => {
  const repo = await repository();

  repo.get(id);
};

export const getByOauth = async (id: string) => {
  const repo = await repository();

  repo.query('select * from user u where u.oauthId = @id', [
    { name: 'id', value: id },
  ]);
};
