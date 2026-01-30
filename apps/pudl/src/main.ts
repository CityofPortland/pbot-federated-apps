import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { initializeMsal } from './auth';
import './main.css';

const pinia = createPinia();

// Initialize MSAL before mounting the app to handle redirect responses
initializeMsal().then(() => {
  createApp(App).use(router).use(pinia).mount('#app');
});
