import { authRoutes, useLogin } from '@pbotapps/components';
import { decodeJwt } from 'jose';
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
  // Always allow auth routes, avoids infinite redirect
  if (authRoutes.map(r => r.path).includes(to.path)) return true;

  const auth = useLogin();

  // Check for a somewhat valid token
  if (auth.accessToken.value) {
    const payload = decodeJwt(auth.accessToken.value);

    // If the token is unexpired, then go through
    if (payload.exp && new Date(payload.exp * 1000) > new Date()) {
      return true;
    }
  }

  // Save the attempted route before moving on to login
  auth.route.value = { hash: to.hash, path: to.path, query: to.query };

  return { name: 'Login' };
});

export default router;
