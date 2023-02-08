import { authRoutes } from '@pbotapps/components';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import Edit from '../pages/Edit.vue';
import Home from '../pages/Home.vue';
import Revisions from '../pages/Revisions.vue';
import View from '../pages/View.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', component: Home },
  { path: '/:code', component: View, props: true },
  { path: '/:code/edit', component: Edit, props: true },
  { path: '/:code/revisions', component: Revisions, props: true },
  { path: '/add', component: Edit },
  ...authRoutes,
];

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
