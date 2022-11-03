import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import Home from '../pages/Home.vue';
import zones from '../pages/zones.vue';
import zone from '../pages/zone.vue';
import schema from '../pages/schema.vue';
import table from '../pages/table.vue';
import { useStore } from '../store';

const routes: RouteRecordRaw[] = [
  { path: '/', component: Home },
  { path: '/zones', component: zones },
  {
    path: '/zones/:zone',
    component: zone,
    props: route => {
      const { zones } = useStore();
      const zone = zones.find(z => z.name == route.params.zone);
      return { zone };
    },
  },
  {
    path: '/zones/:zone/:schema',
    component: schema,
    props: route => {
      const { schemas } = useStore();
      const schema = schemas(route.params.zone as string)?.find(
        s => s.name == route.params.schema
      );
      return { schema };
    },
  },
  {
    path: '/zones/:zone/:schema/:table',
    component: table,
    props: route => {
      const { tables } = useStore();
      const table = tables(
        route.params.zone as string,
        route.params.schema as string
      )?.find(t => t.name == route.params.table);
      return { table };
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeResolve(async () => {
  const store = useStore();

  if (!store.zones.length) {
    await store.getZones();
  }
});

export default router;
