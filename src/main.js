// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import '@fortawesome/fontawesome-free/css/all.css';

// ✅ Use the single axios instance from src/axios.js
import api from './axios'; 

import './assets/main.css';

const app = createApp(App);
const pinia = createPinia();

pinia.use(piniaPluginPersistedstate);

// Provide Axios globally so components can use inject('api')
app.provide('api', api);

app.use(pinia);
app.use(router);

app.mount('#app');
