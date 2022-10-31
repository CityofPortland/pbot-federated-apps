import { defineStore } from 'pinia';

export const useStore = defineStore('pudl', {
  state: () => ({
    data: {
      findZone: [],
    },
  }),
  getters: {
    zones: state => state.data.findZone,
    schemas: state => (zone: string) =>
      state.data.findZone.find(z => z.name == zone)?.schemas,
    tables: state => (zone: string, schema: string) =>
      state.data.findZone
        .find(z => z.name == zone)
        ?.schemas.find(s => s.name == schema)?.tables,
  },
});
