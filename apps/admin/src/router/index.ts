import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { authRoutes } from '@pbotapps/components';
import { decodeJwt } from 'jose';

import Application from '../pages/Application.vue';
import Applications from '../pages/Applications.vue';
import ApplicationForm from '../components/application/Form.vue';
import DefaultLayout from '../layouts/Default.vue';
import Home from '../pages/Home.vue';
import Rule from '../pages/Rule.vue';
import { useAuthStore } from '../store/auth';

const routes: Array<RouteRecordRaw> = [
  { path: '/', component: Home },
  {
    path: '/application',
    component: DefaultLayout,
    children: [
      {
        path: '',
        component: Applications,
      },
      {
        name: 'Application',
        path: ':id',
        component: Application,
      },
      {
        path: 'new',
        component: ApplicationForm,
      },
    ],
  },
  {
    path: '/rule',
    component: DefaultLayout,
    children: [
      {
        name: 'Rule',
        path: ':id',
        component: Rule,
      },
    ],
  },
  ...authRoutes,
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
