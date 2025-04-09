import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Backoffice from '../pages/Backoffice.vue';
import CitizenPortal from '../pages/CitizenPortal.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/backoffice',
  },
  {
    path: '/backoffice',
    component: Backoffice,
  },
  {
    path: '/citizenportal',
    component: CitizenPortal,
  },
];

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
