import { authRoutes, useLogin } from '@pbotapps/components';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import Page from '../pages/Page.vue';

const routes: RouteRecordRaw[] = [
  { path: '/:tree*', component: Page },
  ...authRoutes,
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeResolve(to => {
  const auth = useLogin();

  if (auth.accessToken) {
    return true;
  }

  return { name: 'Login' };
});

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
