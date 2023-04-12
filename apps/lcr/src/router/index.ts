import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import ComputerPage from '../pages/ComputerPage.vue';

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
  {
    name: 'ComputerPage',
    path: '/computer/:computer',
    component: ComputerPage,
    props: route => {
      const computerName = route.params.computer.toString();
      return { computerName };
    },
  },
];

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
