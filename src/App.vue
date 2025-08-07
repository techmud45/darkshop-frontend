<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
</template>

<script setup>
  import { ref, computed, watch } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useUserStore } from './stores/user';

  const router = useRouter();
  const route = useRoute();
  const userStore = useUserStore();

  // State
  const menuOpen = ref(false);
  const torActive = ref(true);
  const latency = ref(generateLatency());
  const cartCount = ref(0);
  const notification = ref({
    show: false,
    type: '',
    message: '',
    icon: '',
  });

  // Computed
  const showHeader = computed(() => {
    return !['/login', '/register'].includes(route.path);
  });

  const currentRoute = computed(() => {
    return route.path.slice(1).toUpperCase() || 'ROOT';
  });

  // Methods
  const toggleMenu = () => {
    menuOpen.value = !menuOpen.value;
  };

  const toggleTor = () => {
    torActive.value = !torActive.value;
    latency.value = generateLatency();
    showNotification(
      torActive.value ? 'success' : 'warning',
      torActive.value ? 'TOR connection established' : 'TOR connection disabled',
      torActive.value ? 'fas fa-lock' : 'fas fa-lock-open'
    );
  };

  const navigate = (path) => {
    router.push(path);
  };

  const logout = () => {
    userStore.logout();
    router.push('/login');
    showNotification('success', 'Logged out securely', 'fas fa-sign-out-alt');
  };

  const showNotification = (type, message, icon) => {
    notification.value = { show: true, type, message, icon };
    setTimeout(() => {
      notification.value.show = false;
    }, 3000);
  };

  function generateLatency() {
    return Math.floor(Math.random() * 300) + 100;
  }

  // Watch for route changes
  watch(
    () => route.path,
    (newPath) => {
      menuOpen.value = false;
      if (newPath === '/login' && userStore.token) {
        router.push('/');
      }
    }
  );

  // Initialize
  if (userStore.token) {
    showNotification('info', 'Secure session initialized', 'fas fa-shield-alt');
  }
</script>

<style scoped>
  /* Base Styles */
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #0a0a0a;
    color: #00ff41;
    font-family: 'Courier New', monospace;
  }

  /* Header Styles */
  .terminal-header {
    background-color: #121212;
    border-bottom: 1px solid #1e1e1e;
    position: sticky;
    top: 0;
    z-index: 1000;
  }

  .header-content {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    gap: 1rem;
  }

  /* Terminal Controls */
  .terminal-controls {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .terminal-btn {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .terminal-btn:hover {
    transform: scale(1.2);
    opacity: 0.8;
  }

  .terminal-btn.red {
    background-color: #ff5f56;
  }
  .terminal-btn.yellow {
    background-color: #ffbd2e;
  }
  .terminal-btn.green {
    background-color: #27c93f;
  }

  /* Persistent Navigation */
  .persistent-nav {
    display: flex;
    gap: 0.5rem;
    flex-grow: 1;
    overflow-x: auto;
    padding: 0.5rem 0;
    scrollbar-width: none; /* Firefox */
  }

  .persistent-nav::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    color: #666;
    text-decoration: none;
    border-radius: 3px;
    white-space: nowrap;
    transition: all 0.3s ease;
    position: relative;
  }

  .nav-link:hover {
    background-color: rgba(0, 255, 65, 0.05);
    color: #00ff41;
  }

  .nav-link.router-link-active {
    background-color: rgba(0, 255, 65, 0.1);
    color: #00ff41;
    border-left: 2px solid #00ff41;
  }

  .nav-link i {
    font-size: 0.9rem;
    width: 16px;
    text-align: center;
  }

  .link-text {
    font-size: 0.85rem;
    letter-spacing: 0.5px;
  }

  .cart-badge {
    background-color: #ff4444;
    color: white;
    font-size: 0.7rem;
    padding: 0.1rem 0.3rem;
    border-radius: 10px;
    margin-left: 0.3rem;
  }

  .router-link-active .cart-badge {
    background-color: #00ff41;
  }

  /* Auth & Status Area */
  .auth-status {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-left: auto;
  }

  .auth-links {
    display: flex;
    gap: 0.5rem;
  }

  .auth-link {
    color: #666;
    text-decoration: none;
    padding: 0.5rem;
    border-radius: 3px;
    transition: all 0.3s ease;
    font-size: 0.85rem;
  }

  .auth-link:hover {
    color: #00ff41;
    background-color: rgba(0, 255, 65, 0.05);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .username {
    font-size: 0.85rem;
    color: #00ff41;
  }

  .logout-link {
    color: #666;
    text-decoration: none;
    padding: 0.5rem;
    transition: all 0.3s ease;
  }

  .logout-link:hover {
    color: #ff4444;
  }

  .connection-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.7rem;
    padding: 0.3rem 0.8rem;
    border-radius: 3px;
    background-color: rgba(255, 68, 68, 0.1);
    color: #666;
  }

  .connection-status.tor-active {
    background-color: rgba(0, 255, 65, 0.1);
    color: #00ff41;
  }

  .status-indicator {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #666;
  }

  .tor-active .status-indicator {
    background-color: #00ff41;
    box-shadow: 0 0 5px #00ff41;
    animation: pulse 1.5s infinite;
  }

  .latency {
    font-size: 0.6rem;
    color: #666;
    margin-left: 0.3rem;
  }

  .tor-active .latency {
    color: #00ff41;
  }

  /* Expanded Menu */
  .expanded-menu {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
    padding: 1rem;
    background-color: #0f0f0f;
    border-top: 1px solid #1e1e1e;
    border-bottom: 1px solid #1e1e1e;
  }

  .menu-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .menu-section h4 {
    color: #666;
    margin-bottom: 0.5rem;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .menu-section a {
    color: #666;
    text-decoration: none;
    padding: 0.5rem 0.8rem;
    border-radius: 3px;
    transition: all 0.3s ease;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  .menu-section a:hover {
    background-color: rgba(0, 255, 65, 0.05);
    color: #00ff41;
  }

  .menu-section a i {
    width: 16px;
    text-align: center;
  }

  /* Main Content */
  .content-wrapper {
    flex: 1;
    padding: 1rem;
  }

  .auth-layout {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  /* System Notification */
  .system-notification {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    padding: 0.8rem 1.2rem;
    border-radius: 3px;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-size: 0.9rem;
    z-index: 1000;
    max-width: 300px;
  }

  .system-notification i {
    font-size: 1rem;
  }

  .system-notification.success {
    background-color: rgba(0, 255, 65, 0.2);
    border: 1px solid #00ff41;
    color: #00ff41;
  }

  .system-notification.warning {
    background-color: rgba(255, 235, 59, 0.2);
    border: 1px solid #ffeb3b;
    color: #ffeb3b;
  }

  .system-notification.info {
    background-color: rgba(33, 150, 243, 0.2);
    border: 1px solid #2196f3;
    color: #2196f3;
  }

  .system-notification.error {
    background-color: rgba(255, 68, 68, 0.2);
    border: 1px solid #ff4444;
    color: #ff4444;
  }

  /* Animations */
  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }

  .slide-down-enter-active {
    transition: all 0.3s ease-out;
  }

  .slide-down-leave-active {
    transition: all 0.3s ease-in;
  }

  .slide-down-enter-from,
  .slide-down-leave-to {
    transform: translateY(-10px);
    opacity: 0;
  }

  .slide-up-enter-active {
    transition: all 0.3s ease-out;
  }

  .slide-up-leave-active {
    transition: all 0.3s ease-in;
  }

  .slide-up-enter-from,
  .slide-up-leave-to {
    transform: translateY(20px);
    opacity: 0;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .header-content {
      flex-wrap: wrap;
      padding-bottom: 0;
    }

    .auth-status {
      order: 1;
      width: 100%;
      justify-content: space-between;
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid #1e1e1e;
    }

    .expanded-menu {
      grid-template-columns: 1fr;
    }

    .content-wrapper {
      padding: 0.5rem;
    }

    .auth-layout {
      padding: 1rem;
    }
  }
</style>
