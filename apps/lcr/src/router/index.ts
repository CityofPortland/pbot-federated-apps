import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import Home from '../pages/Home.vue';
import UserPage from '../pages/UserPage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Home,
  },
  {
    name: 'UserPage',
    path: '/user/:personid',
    component: UserPage,
    props: route => {
      const userid = route.params.personid.toString();

      return { userid };
    },
  },
];

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
