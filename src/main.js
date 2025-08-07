// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import '@fortawesome/fontawesome-free/css/all.css';
import api from './api/api'; // Import the API instance

import './assets/main.css';

const app = createApp(App);
const pinia = createPinia();

pinia.use(piniaPluginPersistedstate);

// Provide API instance globally
app.provide('api', api);

app.use(pinia);
app.use(router);

app.mount('#app');
