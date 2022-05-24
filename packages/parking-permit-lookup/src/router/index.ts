import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import Disclaimer from '@/pages/Disclaimer.vue';
import PermitLookup from '@/pages/PermitLookup.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/permit-lookup' },
  { path: '/permit-lookup', component: PermitLookup },
  { path: '/disclaimer', component: Disclaimer },
];

export default createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});
