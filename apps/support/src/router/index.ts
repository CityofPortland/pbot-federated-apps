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

router.beforeResolve(to => {
  const auth = useLogin();

  if (
    auth.accessToken.value ||
    authRoutes.map(r => r.name).includes(to.name || 'NONE')
  ) {
    return true;
  }

  auth.route.value = { hash: to.hash, path: to.path, query: to.query };

  return { name: 'Login' };
});

export default router;
