import { BBox, Geometry } from '@turf/helpers';

export type MasterStreetPlanFeature = {
  id: string;
  type?: string;
  alignment?: string;
  geometry: Geometry;
};

export type MasterStreetPlan = {
  id: string;
  name: string;
  label?: string;
  description?: string;
  manager?: string;
  adopoted?: string;
  document?: string;
  features?: Array<MasterStreetPlanFeature>;
  geometry: Geometry;
  bbox: BBox;
};
