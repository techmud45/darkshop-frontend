import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: null,
    user: null,
  }),
  actions: {
    login(data) {
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('token', data.token);
      console.log('[Pinia] Login: token set', data.token);
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
    },
  },
});
