import { useLogin, query } from '@pbotapps/components';
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
      zones: [] as Array<Zone>,
    },
    errors: [] as Array<unknown>,
  }),
  getters: {
    zones: state => state.data.zones,
    schemas: state => (zone: string) =>
      state.data.zones.find(z => z.name == zone)?.schemas,
    tables: state => (zone: string, schema: string) =>
      state.data.zones
        .find(z => z.name == zone)
        ?.schemas.find(s => s.name == schema)?.tables,
  },
  actions: {
    async getZones() {
      const { clientId, getToken } = useLogin();

      const token = await getToken([`${clientId}/.default`]);

      this.data.zones = [] as Array<Zone>;

      if (!token) return;

      try {
        const res = await query<{ zones: Array<Zone> }>({
          operation: `
                query getZones {
                  zones {
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data) {
          this.data.zones = res.data.zones;
        }
      } catch (err) {
        this.errors.push(err);
      }
    },
  },
});
