import { BaseUserChangeableType } from '@pbotapps/objects';

export const COLORS = [
  'blue',
  'black',
  'brown',
  'flourescent pink',
  'green',
  'orange',
  'pink',
  'purple',
  'red',
  'white',
  'yellow',
  'yellow-green',
] as const;

export type Color = (typeof COLORS)[number];

export const SHAPES = [
  'diamond',
  'octagon',
  'rectangle',
  'square',
  'triangle',
] as const;

export type Shape = (typeof SHAPES)[number];

export const STATUSES = ['in_use', 'obsolete'] as const;

export type Status = (typeof STATUSES)[number];

export const TYPES = [
  'bike',
  'construction',
  'guide',
  'parking',
  'pedestrian',
  'regulatory',
  'school',
  'warning',
] as const;

export type Type = (typeof TYPES)[number];

export type Sign = BaseUserChangeableType & {
  _revisions?: Array<Partial<Omit<Sign, '_revisions'>>>;
  code: string;
  color: Array<Color | string>;
  comment?: string;
  height: number;
  image?: {
    design?: string;
    full: string;
    thumbnail: string;
  };
  legend: string;
  mutcdCode: string;
  obsoletePolicy?: string;
  odotCode: string;
  replacedBy: string;
  shape: Shape;
  source: string;
  status: Status;
  type: Array<Type>;
  width: number;
};

export type SignInput = Omit<
  Sign,
  keyof BaseUserChangeableType | '_revisions' | 'image'
> & {
  image: FileList;
  design: FileList;
};
