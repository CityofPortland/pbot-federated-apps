import { Location } from '@/location';

export type AddressCandidate = {
  location: Location;
  score?: number;
  attributes: {
    status?: string;
    city?: string;
    jurisdiction?: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    zip_code?: number;
    state?: string;
    zip4?: number;
    id?: number;
    type?: string;
    county?: string;
  };
  address: string;
  extent?: {
    ymin: number;
    ymax: number;
    xmin: number;
    xmax: number;
  };
};

export type Address = {
  location: Location;
  name: string;
  city?: string;
  zipCode?: number;
  state?: string;
  zip4?: number;
  id?: number;
  type?: string;
  county?: string;
};
