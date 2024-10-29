import { authRoutes } from '@pbotapps/components';
import { decodeJwt } from 'jose';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import Page from '../pages/Page.vue';
import { useAuthStore } from '../store';

const routes: RouteRecordRaw[] = [
  ...authRoutes,
  { path: '/:tree*', component: Page },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeResolve(async to => {
  // Always allow auth routes, avoids infinite redirect
  if (authRoutes.map(r => r.path).includes(to.path)) return true;

  const { getToken } = useAuthStore();

  const token = await getToken();

  // Check for a somewhat valid token
  if (token) {
    const payload = decodeJwt(token);

    // If the token is unexpired, then go through
    if (payload.exp && new Date(payload.exp * 1000) > new Date()) {
      return true;
    }
  }

  // Save the attempted route before moving on to login
  return { name: 'Login', query: { returnTo: to.fullPath } };
});

export default router;
