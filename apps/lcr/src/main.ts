import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './main.css';
import piniaPluginPersistedState from 'pinia-plugin-persistedstate';

const pinia = createPinia();
pinia.use(piniaPluginPersistedState);
createApp(App).use(router).use(pinia).mount('#app');
