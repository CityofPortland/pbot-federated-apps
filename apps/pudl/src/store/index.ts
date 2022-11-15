import { query } from '@pbotapps/common';
import { defineStore } from 'pinia';

interface Zone {
  name: string;
  schemas: Array<Schema>;
}

interface Schema {
  name: string;
  tables: Array<Table>;
}

interface Table {
  name: string;
  columns: Array<Column>;
}

interface Column {
  name: string;
  type: string;
}

export const useStore = defineStore('pudl', {
  state: () => ({
    data: {
      findZone: [] as Array<Zone>,
    },
    errors: [] as Array<unknown>,
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
  actions: {
    async getZones() {
      this.data.findZone = [] as Array<Zone>;
      try {
        const res = await Promise.all(
          ['raw', 'enriched'].map(async zone => {
            const res = await query<{ findZone: Array<Zone> }>({
              operation: `
                query ($zone: String) {
                  findZone(zone: $zone) {
                    name
                    schemas {
                      name
                      description
                      tables {
                        name
                        columns {
                          name
                          type
                          index
                        }
                      }
                    }
                  }
                }`,
              variables: {
                zone,
              },
            });

            if (res.data) {
              return res.data.findZone;
            } else {
              return [];
            }
          })
        ).then(data => data.flat());

        this.data.findZone = res;
      } catch (err) {
        this.errors.push(err);
      }
    },
  },
});
