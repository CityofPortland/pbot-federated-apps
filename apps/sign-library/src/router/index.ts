import { authRoutes } from '@pbotapps/components';
import {
  createRouter,
  createWebHistory,
  RouteLocationNormalized,
  RouteRecordRaw,
} from 'vue-router';

import Edit from '../pages/Edit.vue';
import Home from '../pages/Home.vue';
import Revisions from '../pages/Revisions.vue';
import View from '../pages/View.vue';

const checkQuery =
  (prop: string, def: string | number) => (to: RouteLocationNormalized) => {
    if (!to.query[prop])
      return {
        ...to,
        query: {
          ...to.query,
          [prop]: def,
        },
      };
  };

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: () => ({
      path: '/search',
      query: {
        status: 'in_use',
        pageSize: 10,
        page: 1,
        sort: '_changed',
        sortOrder: 'asc',
      },
    }),
  },
  {
    path: '/search',
    component: Home,
    beforeEnter: [
      checkQuery('status', 'in_use'),
      checkQuery('pageSize', 10),
      checkQuery('page', 1),
      checkQuery('sort', '_changed'),
      checkQuery('sortOrder', 'asc'),
    ],
  },
  { path: '/:code', component: View, props: true },
  { path: '/:code/edit', component: Edit, props: true },
  { path: '/:code/revisions', component: Revisions, props: true },
  { path: '/add', component: Edit },
  ...authRoutes,
];

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});
