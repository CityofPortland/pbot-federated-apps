import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { PiniaColada } from '@pinia/colada';
import '@arcgis/core/assets/esri/themes/light/main.css';

import App from './App.vue';
import router from './router';
import {
  configureLogging,
  errorProperties,
  getLogger,
  traceStoreActions,
} from './logging';

configureLogging();
const logger = getLogger(['interactive-tsp', 'app']);
const pinia = createPinia().use(traceStoreActions);
const app = createApp(App);

window.addEventListener('unhandledrejection', event => {
  logger.error('Unhandled promise rejection', errorProperties(event.reason));
});
window.addEventListener('error', event => {
  logger.error('Unhandled browser error', errorProperties(event.error));
});

app.use(pinia).use(PiniaColada).use(router).mount('#app');
logger.info('Application started', { mode: import.meta.env.MODE });
