import { defineQueryOptions } from '@pinia/colada';
import { query } from './query';
import type { MasterStreetPlan } from '../store/masterStreetPlans';
import { defaultExtent } from '../store/map';

const { xmin, ymin, xmax, ymax, spatialReference } = defaultExtent;

export const masterStreetPlansQuery = defineQueryOptions({
  key: [
    'master-street-plans',
    'list',
    [xmin, ymin, xmax, ymax],
    spatialReference.wkid ?? null,
  ],
  // Keep successful results fresh; users can explicitly refetch them.
  staleTime: Infinity,
  gcTime: 5 * 60 * 1000,
  // Navigation starts loading; the page observes the cache and refetches on demand.
  enabled: false,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  async query(): Promise<MasterStreetPlan[]> {
    const response = await query<{ masterStreetPlans?: MasterStreetPlan[] }>({
      field: 'masterStreetPlans',
      args: {
        bbox: [xmin, ymin, xmax, ymax],
        spatialReference: spatialReference.wkid,
      },
      select: {
        id: true,
        name: true,
        description: true,
        adopted: true,
        document: true,
        features: { select: { id: true } },
        geometry: { select: { type: true, coordinates: true } },
      },
      cache: false,
    });

    if (
      response.errors?.length ||
      !Array.isArray(response.data?.masterStreetPlans)
    ) {
      throw new Error('Unable to retrieve master street plans.');
    }
    return response.data.masterStreetPlans;
  },
});
