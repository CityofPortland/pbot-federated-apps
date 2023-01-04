import { BaseEntityUserChanges } from '@pbotapps/common';

type Input = {
  name: string;
  slug: string;
};

export type DataDomainInput = Partial<Input>;

export type FindDataDomainInput = Partial<Input & BaseEntityUserChanges>;
