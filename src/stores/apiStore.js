// src/stores/apiStore.js
import { defineStore } from 'pinia';
import api from '../api/api'; // Direct import works too

export const useApiStore = defineStore('api', {
  actions: {
    async getProducts() {
      try {
        const response = await api.get('/products');
        return response.data;
      } catch (error) {
        console.error('Failed to fetch products:', error);
        throw error;
      }
    },

    async login(credentials) {
      try {
        const response = await api.post('/auth/login', credentials);
        localStorage.setItem('token', response.data.token);
        return response.data;
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },
  },
});
