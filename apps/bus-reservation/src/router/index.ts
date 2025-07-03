import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import Home from '../pages/home.vue';

const routes: RouteRecordRaw[] = [{ path: '/', component: Home }];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
