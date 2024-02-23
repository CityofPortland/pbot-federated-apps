import { useLogin, query } from '@pbotapps/components';
import cronstrue from 'cronstrue';
import cron from 'cron-parser';
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
  index: number;
}

interface Pipeline {
  id: string;
  schedule?: string;
  tags: Array<string>;
  lastRun?: {
    id: string;
    status: string;
    startTime: Date;
    endTime?: Date;
    duration?: string;
  };
}

export const useStore = defineStore('pudl', {
  state: () => ({
    data: {
      pipelines: [] as Array<Pipeline>,
      zones: [] as Array<Zone>,
    },
    errors: [] as Array<unknown>,
  }),
  getters: {
    pipelines: state => state.data.pipelines,
    zones: state => state.data.zones,
    schemas: state => (zone: string) =>
      state.data.zones.find(z => z.name == zone)?.schemas,
    tables: state => (zone: string, schema: string) =>
      state.data.zones
        .find(z => z.name == zone)
        ?.schemas.find(s => s.name == schema)?.tables,
    tablePipelines: state => (zone: string, schema: string, table: string) => {
      return state.data.pipelines.reduce((acc, curr) => {
        if (
          curr.tags &&
          [`zone=${zone}`, `schema=${schema}`, `table=${table}`].every(t =>
            curr.tags.includes(t)
          )
        ) {
          acc.push(curr);
        }
        return acc;
      }, new Array<Pipeline>());
    },
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
          const sort = (a: Zone | Schema | Table, b: Zone | Schema | Table) =>
            a.name.localeCompare(b.name);

          this.data.zones = res.data.zones.map(z => {
            return {
              ...z,
              schemas: z.schemas
                .map(s => {
                  return {
                    ...s,
                    tables: s.tables.sort(sort),
                  };
                })
                .sort(sort),
            };
          });
        }
      } catch (err) {
        this.errors.push(err);
      }
    },
    async getPipelines() {
      const { clientId, getToken } = useLogin();

      const token = await getToken([`${clientId}/.default`]);

      this.data.pipelines = [] as Array<Pipeline>;

      if (!token) return;

      try {
        const res = await query<{ pipelines: Array<Pipeline> }>({
          operation: `
                query getPipelines {
                  pipelines {
                    id
                    schedule
                    tags
                    lastRun {
                      id
                      status
                      startTime
                      endTime
                    }
                  }
                }`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data) {
          this.data.pipelines = res.data.pipelines
            .map(p => {
              if (!p.lastRun) return p;

              const run = { ...p.lastRun };

              run.startTime = new Date(run.startTime);

              if (run.endTime) {
                run.endTime = new Date(run.endTime);
                const duration = new Date(
                  run.endTime.getTime() - run.startTime.getTime()
                );
                run.duration = duration.toISOString().substring(11, 19);
              }

              return {
                ...p,
                lastRun: { ...run },
              };
            })
            .map(p => {
              let schedule = JSON.parse(p.schedule || 'undefined');

              if (!schedule || schedule == 'null')
                return { ...p, schedule: undefined };

              if (schedule.type && schedule.type == 'timedelta') {
                const { days, seconds } = schedule.attrs;

                let minutes = '0';
                let daysOfMonth = '*';

                if (seconds) minutes = `*/${Math.floor(seconds / 60)}`;
                if (days) daysOfMonth = `*/${days}`;

                schedule = `${minutes} ${
                  p.lastRun?.startTime.getHours() || '*'
                } ${daysOfMonth} * *`;
              }

              // parse the cron schedule?
              const c = cron.parseExpression(schedule);

              return {
                ...p,
                schedule: cronstrue.toString(c.stringify()),
              };
            });
        }
      } catch (err) {
        this.errors.push(err);
      }
    },
  },
});
