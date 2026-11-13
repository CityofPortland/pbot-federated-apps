import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { errorProperties, getLogger } from '../logging';

import Home from '../views/Home.vue';
import { useMessageStore } from '../store/message';
import { useMapStore } from '../store/map.js';
import { useMasterStreetPlanStore } from '../store/masterStreetPlans';
// writing these as functions lets you chunk output, thus smaller downloads?
const AreaPlans = () => import('../views/AreaPlans.vue');
const MasterStreetPlans = () => import('../views/MasterStreetPlans.vue');
const Streets = () => import('../views/Streets.vue');
const Projects = () => import('../views/Projects.vue');
const Text = () => import('../views/Text.vue');

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/streets/:id?',
    name: 'streets',
    component: Streets,
  },
  {
    path: '/projects/:id?',
    name: 'projects',
    component: Projects,
  },
  {
    path: '/text',
    name: 'text',
    component: Text,
  },
  {
    path: '/master-street-plans/:id?',
    name: 'master-street-plans',
    component: MasterStreetPlans,
    beforeEnter: async () => {
      useMapStore();

      await useMasterStreetPlanStore()
        .initialize()
        .catch(() => {
          // The page reads Colada's error state and offers a retry.
        });
    },
  },
  {
    path: '/area-plans/:id?',
    name: 'area-plans',
    component: AreaPlans,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // https://router.vuejs.org/guide/advanced/scroll-behavior.html
    if (to.hash) {
      return;
    } else if (savedPosition) {
      return savedPosition;
    } else {
      return { left: 0, top: 0 };
    }
  },
});

const logger = getLogger(['interactive-tsp', 'router']);

router.beforeEach((to, from) => {
  logger.debug('Navigation started', { from: from.name, to: to.name });
});

router.onError(error => {
  logger.error('Navigation failed', errorProperties(error));
});

router.afterEach((to, from, failure) => {
  logger.debug('Navigation settled', {
    from: from.name,
    to: to.name,
    failureType: failure?.type,
  });
  useMessageStore().clearMessages();
});

export default router;
