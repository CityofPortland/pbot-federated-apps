import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import Home from '../pages/Home.vue';
import UserPage from '../pages/UserPage.vue';
import ComputerPage from '../pages/ComputerPage.vue';


const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Home,
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
      const computer = route.params.computer.toString();
      return { computer };
    },
  },
];

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
