import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { authRoutes } from '@pbotapps/components';

import Home from '../pages/home.vue';
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
  },
  {
    path: '/zones/:zone/:schema',
    component: schema,
  },
  {
    path: '/zones/:zone/:schema/:table',
    component: table,
  },
  ...authRoutes,
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeResolve(async () => {
  const store = useStore();

  if (!store.zones.length) {
    store.getZones();
  }
});

export default router;
