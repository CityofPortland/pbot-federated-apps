import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { authRoutes } from '@pbotapps/components';

import Home from '../pages/home.vue';
import Hotels from '../pages/hotels/list.vue';
import HotelsAddEdit from '../pages/hotels/addedit.vue';
import HotelsView from '../pages/hotels/view.vue';
import Reservations from '../pages/reservations/list.vue';
import ReservationAddEdit from '../pages/reservations/addedit.vue';
import ReservationsView from '../pages/reservations/view.vue';
import { useStore } from '../store/index.js';

const routes: RouteRecordRaw[] = [
  { path: '/', component: Home },
  {
    path: '/hotels',
    component: Hotels,
    beforeEnter: async () => {
      const store = useStore();

      if (!store.rules) {
        await store.getRules();
      }

      const rules = store.rules.find(
        r => r.subject == 'hotel' && r.action == 'write'
      );

      // reject the navigation
      return rules ? true : { path: '/' };
    },
  },
  {
    path: '/hotels/add',
    component: HotelsAddEdit,
    props: () => {
      return { title: 'Add Hotel' };
    },
    beforeEnter: async () => {
      const store = useStore();

      if (!store.rules) {
        await store.getRules();
      }

      const rules = store.rules.find(
        r => r.subject == 'hotel' && r.action == 'write'
      );
      // reject the navigation
      return rules ? true : { path: '/' };
    },
  },
  {
    path: '/hotels/:id',
    component: HotelsView,
    props: route => {
      const { id } = route.params;
      return { id };
    },
  },
  {
    path: '/hotels/:id/edit',
    component: HotelsAddEdit,
    props: route => {
      const { id } = route.params;
      return { title: 'Edit Hotel', id };
    },
    beforeEnter: async () => {
      const store = useStore();

      if (!store.rules) {
        await store.getRules();
      }

      const rules = store.rules.find(
        r => r.subject == 'hotel' && r.action == 'write'
      );
      // reject the navigation
      return rules ? true : { path: '/' };
    },
  },
  { path: '/reservations', component: Reservations },
  {
    path: '/reservations/add',
    component: ReservationAddEdit,
    props: () => {
      return { title: 'Add Reservation' };
    },
    beforeEnter: async () => {
      const store = useStore();

      if (!store.rules) {
        await store.getRules();
      }

      const rules = store.rules.find(
        r => r.subject == 'reservation' && r.action == 'write'
      );
      // reject the navigation
      return rules ? true : { path: '/reservations' };
    },
  },
  {
    path: '/reservations/:id',
    component: ReservationsView,
    props: route => {
      const { id } = route.params;
      return { id };
    },
  },
  {
    path: '/reservations/:id/edit',
    component: ReservationAddEdit,
    props: route => {
      const { id } = route.params;
      return { title: 'Edit Reservation', id };
    },
    beforeEnter: async () => {
      const store = useStore();

      if (!store.rules) {
        await store.getRules();
      }

      const rules = store.rules.find(
        r => r.subject == 'reservation' && r.action == 'write'
      );
      // reject the navigation
      return rules ? true : { path: '/reservations' };
    },
  },
  ...authRoutes,
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
