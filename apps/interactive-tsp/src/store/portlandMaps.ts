import { defineStore } from 'pinia';
import { query } from '../queries/query';

import { useMessageStore } from './message';

export interface Location {
  x: number;
  y: number;
  spatialReference: any;
}

export interface AddressCandidate {
  location: Location;
  name: string;
  city?: string;
  zipCode?: number;
  state?: string;
  zip4?: number;
  id?: number;
  type?: string;
  county?: string;
}

export const usePortlandMapsStore = defineStore('portlandMaps', {
  state: () => ({
    candidates: undefined as AddressCandidate[] | undefined,
  }),
  actions: {
    clearCandidates() {
      this.candidates = undefined;
    },
    async findCandidates({
      search,
      searchType,
    }: {
      search: string;
      searchType: string;
    }) {
      const messages = useMessageStore();

      try {
        const res = await query<Record<string, AddressCandidate[]>>({
          field: searchType,
          args: { search, city: 'portland' },
          select: {
            id: true,
            type: true,
            name: true,
            location: {
              select: {
                x: true,
                y: true,
                spatialReference: { select: { wkid: true, latestWkid: true } },
              },
            },
            city: true,
            state: true,
          },
        });

        if (res.errors) {
          messages.addMessage({
            id: 'streets-zoom',
            type: 'info',
            text: 'Zoom in or search for an address to see available streets...',
            dismissible: true,
          });
        }

        const data = res.data?.[searchType];

        if (data) {
          if (data.length > 0) {
            this.candidates = data;
          } else {
            messages.addMessage({
              id: 'address-not-found',
              type: 'warning',
              text: 'Could not find a match for that address.  Try entering a different or more specific address.',
              dismissible: true,
            });
          }
        }
      } catch {
        messages.addMessage({
          id: 'portlandmaps-address-error',
          type: 'error',
          text: 'Error retrieving address!',
          dismissible: true,
        });
      }
    },
  },
});
