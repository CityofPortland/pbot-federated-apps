import Point from '@arcgis/core/geometry/Point';

export type CandidateType = 'address' | 'intersection' | 'property';

export type Candidate = {
  type?: CandidateType;
  name: string;
  city?: string;
  state: string;
  location: Partial<Point>;
};
