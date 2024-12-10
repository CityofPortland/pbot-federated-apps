import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [];

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
