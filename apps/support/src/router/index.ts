import { authRoutes, useLogin } from '@pbotapps/components';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import Page from '../pages/Page.vue';

const routes: RouteRecordRaw[] = [
  ...authRoutes,
  { path: '/:tree*', component: Page },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeResolve(() => {
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
