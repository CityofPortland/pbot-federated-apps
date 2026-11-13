import { point } from '@turf/helpers';
import bbox from '@turf/bbox';
import buffer from '@turf/buffer';
import proj4 from 'proj4';

import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
} from 'graphql';

import axios, { AssessorResult, SuggestResult } from '../api/portlandmaps.js';
import { errorProperties, getLogger } from '../logging.js';
import { locationType } from '../location.js';
import { streetType, getStreets, Street } from '../street.js';
import { Address } from './types.js';

export const addressType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Address',
  description: 'An address in the City of Portland',
  fields: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The full string street address.',
    },
    location: {
      type: new GraphQLNonNull(locationType),
      description: 'Point that the address represents',
    },
    city: {
      type: GraphQLString,
      description: 'The full name of the address.',
    },
    zipCode: {
      type: GraphQLString,
      description: 'The five digit zip code.',
    },
    state: {
      type: GraphQLString,
      description: 'The full state name.',
    },
    zip4: {
      type: GraphQLString,
      description: 'The four digit zip code suffix.',
    },
    id: {
      type: GraphQLInt,
      description: 'The internal id of the address.',
    },
    type: {
      type: GraphQLString,
      description: 'The type of location that this address represents.',
    },
    county: {
      type: GraphQLString,
      description: 'The county this address resides in.',
    },
    streets: {
      type: new GraphQLList(streetType),
      description: 'The streets within 100 meters of this address.',
      resolve: (address: Address): Promise<Array<Street> | null> => {
        let [x, y] = [address.location.x, address.location.y];

        if (
          address.location.spatialReference &&
          address.location.spatialReference.latestWkid !== 4326
        ) {
          // take location, and generate bbox
          [x, y] = proj4(
            `EPSG:${address.location.spatialReference.latestWkid}`,
            'EPSG:4326',
            [address.location.x, address.location.y]
          );
        }

        const buffered = buffer(point([x, y]), 100, { units: 'meters' });

        if (!buffered) {
          throw new EvalError(
            'Failed to create buffer around address location.'
          );
        }

        const box = bbox(buffered);

        return getStreets(box, 4326);
      },
    },
  },
});

export async function searchAddress(
  search: string,
  city?: string
): Promise<Address[] | undefined> {
  const body = {
    query: search,
    city,
  };

  try {
    const res = await axios.post<SuggestResult>('/suggest/', body);

    if (res.status === 200 && res.data && res.data.status === 'success') {
      const { candidates, spatialReference } = res.data;

      return candidates.map<Address>(c => {
        return {
          location: { x: c.location.x, y: c.location.y, spatialReference },
          name: c.address,
          city: c.attributes.city,
          state: c.attributes.state,
          zipCode: c.attributes.zip_code,
          type: c.attributes.type,
          county: c.attributes.county,
        };
      });
    }
  } catch (err) {
    getLogger(['legacy', 'address']).error(
      'Address lookup failed',
      errorProperties(err)
    );
  }

  return undefined;
}

export async function searchTaxLot(
  search: string,
  city?: string
): Promise<Address[]> {
  const body = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    property_id: search,
    city,
  };

  const res = await axios.post<AssessorResult>('/assessor/', body);

  if (res.status === 200 && res.data && res.data.status === 'success') {
    return res.data.results.map<Address>(value => {
      return {
        name: value.address,
        type: 'Property',
        location: {
          x: value.x_web_mercator,
          y: value.y_web_mercator,
          spatialReference: {
            wkid: 102100,
            latestWkid: 3857,
          },
        },
        city: value.city,
        zipCode: value.zip_code,
        state: value.state,
        county: value.county,
      };
    });
  } else throw new Error('No addresses found');
}
