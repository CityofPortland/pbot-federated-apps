import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import Home from '../pages/home.vue';
import zones from '../pages/zones.vue';
import zone from '../pages/zone.vue';
import schema from '../pages/schema.vue';
import table from '../pages/table.vue';
import { useStore } from '../store';
import { isAuthenticated, login } from '../auth';

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
  { path: '/oauth/callback', name: 'OAuthCallback', redirect: '/' },
  { path: '/logout', name: 'Logout', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeResolve(async () => {
  // If not authenticated, redirect to Microsoft sign-in
  if (!isAuthenticated()) {
    await login();
    // login() will redirect, so we return false to cancel navigation
    return false;
  }

  const store = useStore();

  if (!store.zones.length) {
    store.getZones();
  }

  if (!store.pipelines.length) {
    store.getPipelines();
  }
});

export default router;
