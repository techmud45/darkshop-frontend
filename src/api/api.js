// src/api/api.js
import axios from 'axios';
import router from '../router';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5050/',
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      router.push('/login?session=expired');
    }
    return Promise.reject(error);
  }
);

export default api;
