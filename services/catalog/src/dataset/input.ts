import { MaxLength } from 'class-validator';

export class FindDatasetInput {
  uuid?: string;
  name?: string;
  slug?: string;
}

export class DatasetInput {
  @MaxLength(50)
  name: string;
  slug: string;
  summary?: string;
}
