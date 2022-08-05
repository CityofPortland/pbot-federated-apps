import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import Home from '../pages/Home.vue';

const routes: RouteRecordRaw[] = [{ path: '/', component: Home }];

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
