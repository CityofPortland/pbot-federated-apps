import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { authRoutes } from '@pbotapps/components';

import Home from '../pages/home.vue';
import Hotels from '../pages/hotels/list.vue';
import HotelsAdd from '../pages/hotels/add.vue';
import HotelsView from '../pages/hotels/view.vue';
import Reservations from '../pages/reservations/list.vue';
import ReservationAdd from '../pages/reservations/add.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', component: Home },
  { path: '/reservations', component: Reservations },
  { path: '/reservations/add', component: ReservationAdd },
  { path: '/hotels', component: Hotels },
  { path: '/hotels/add', component: HotelsAdd },
  {
    path: '/hotels/view/:id',
    component: HotelsView,
    props: route => {
      const id = route.params.id.toString();
      return { id };
    },
  },
  ...authRoutes,
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
