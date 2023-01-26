export const COLORS = [
  'black',
  'brown',
  'green',
  'orange',
  'pink',
  'red',
  'white',
  'yellow',
] as const;

export type Color = (typeof COLORS)[number];

export const SHAPES = ['diamond', 'octagon', 'rectangle', 'square'] as const;

export type Shape = (typeof SHAPES)[number];

export const STATUSES = ['in use', 'obsolete'] as const;

export type Status = (typeof STATUSES)[number];

export const TYPES = [
  'construction',
  'guide',
  'parking',
  'regulatory',
  'school/pedestrian/bike',
  'warning',
] as const;

export type Type = (typeof TYPES)[number];

export interface Sign {
  _created: Date;
  _changed: Date;
  _revisions: Array<Partial<Omit<Sign, '_revisions'>>>;
  code: string;
  color: Array<Color>;
  description?: string;
  height: number;
  legend: string;
  mutcdCode: string;
  shape: Shape;
  status: Status;
  type: Type;
  width: number;
}
