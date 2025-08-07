import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api/api'; // Your axios instance

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();

  // State
  const token = ref(localStorage.getItem('token'));
  const user = ref(JSON.parse(localStorage.getItem('user') || null));
  const returnUrl = ref(null);

  // Getters
  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.isAdmin || false);

  // Actions
  async function login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });

      // Update state
      token.value = response.data.token;
      user.value = response.data.user;

      // Store in localStorage
      localStorage.setItem('token', token.value);
      localStorage.setItem('user', JSON.stringify(user.value));

      // Redirect
      router.push(returnUrl.value || '/');
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  function logout() {
    // Clear state
    token.value = null;
    user.value = null;

    // Remove from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Redirect to login
    router.push('/login');
  }

  async function initialize() {
    // Check existing auth state
    if (token.value) {
      try {
        // Verify token is still valid
        await api.get('/auth/verify');
      } catch (error) {
        // Token expired or invalid
        logout();
      }
    }
  }

  return {
    token,
    user,
    returnUrl,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    initialize,
  };
});
