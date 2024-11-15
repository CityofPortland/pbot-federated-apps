import { authRoutes } from '@pbotapps/components';
import {
  createRouter,
  createWebHistory,
  RouteLocationNormalized,
  RouteRecordRaw,
} from 'vue-router';

import Add from '../pages/Add.vue';
import Edit from '../pages/Edit.vue';
import Home from '../pages/Home.vue';
import Revisions from '../pages/Revisions.vue';
import View from '../pages/View.vue';
import { useAuthStore, useMessageStore } from '../store';

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

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: () => ({
      path: '/search',
      query: {
        status: 'in_use',
        pageSize: 10,
        page: 1,
        sort: 'updated',
        sortOrder: 'desc',
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
      checkQuery('sort', 'updated'),
      checkQuery('sortOrder', 'desc'),
    ],
  },
  { path: '/:code', component: View, props: true },
  {
    path: '/:code/edit',
    component: Edit,
    props: true,
    beforeEnter: async to => {
      const auth = useAuthStore();
      const messages = useMessageStore();
      const token = await auth.getToken();

      if (token == undefined) {
        messages.add(
          'signs:router',
          'error',
          new Error('Unable to access edit page', {
            cause: new Error('Not logged in!'),
          })
        );
        return { path: `/${to.params.code}` };
      }

      return true;
    },
  },
  { path: '/:code/revisions', component: Revisions, props: true },
  {
    path: '/add',
    component: Add,
    beforeEnter: async () => {
      const auth = useAuthStore();
      const messages = useMessageStore();
      const token = await auth.getToken();

      if (token == undefined) {
        messages.add(
          'signs:router',
          'error',
          new Error('Unable to access add page', {
            cause: new Error('Not logged in!'),
          })
        );
        return { path: '/' };
      }

      return true;
    },
  },
  ...authRoutes,
];

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});
