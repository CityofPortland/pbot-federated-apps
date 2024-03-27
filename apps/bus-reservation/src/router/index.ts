import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { authRoutes } from '@pbotapps/components';

import Home from '../pages/home.vue';
import Reservations from '../pages/reservations.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', component: Home },
  { path: '/reservations', component: Reservations },
  ...authRoutes,
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
