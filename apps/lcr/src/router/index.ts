import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import ComputerPage from '../pages/ComputerPage.vue';

import Home from '../pages/Home.vue';
import LcrSchedule from '../pages/LcrSchedule.vue';
import UserPage from '../pages/UserPage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/schedule',
    component: LcrSchedule,
  },
  {
    name: 'UserPage',
    path: '/user/:username',
    component: UserPage,
    props: route => {
      const username = route.params.username.toString();
      return { username };
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
  history: createWebHistory(import.meta.env.VITE_BASE_PATH),
  routes,
});
