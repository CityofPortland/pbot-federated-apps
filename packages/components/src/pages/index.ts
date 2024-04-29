import type { RouteRecordRaw } from 'vue-router';

import Login from './Login.vue';
import Logout from './Logout.vue';
import OAuth from './OAuth.vue';

export { Login, Logout, OAuth };

export const authRoutes: Array<RouteRecordRaw> = [
  {
    path: '/oauth/callback',
    name: 'OAuthCallback',
    component: OAuth,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/logout',
    name: 'Logout',
    component: Logout,
  },
];