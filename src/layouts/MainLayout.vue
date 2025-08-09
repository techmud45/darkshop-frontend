<template>
  <transition name="boot-fade">
    <div v-if="showBootScreen" class="boot-screen">Initializing DARKSHOP://</div>
  </transition>

  <transition name="fade">
    <div v-if="isLoading" class="loading-overlay">
      <div class="terminal-loader">
        <div class="terminal-loader-text">LOADING://{{ loadingText }}</div>
        <div class="terminal-loader-bar">
          <div class="terminal-loader-progress" :style="{ width: loadingProgress + '%' }"></div>
        </div>
      </div>
    </div>
  </transition>

  <div class="main-layout" :class="layoutClass" :data-terminal-theme="$route.meta.terminalTheme">
    <!-- Terminal Header -->
    <header class="terminal-header">
      <div class="header-left">
        <!-- Terminal Controls -->
        <div class="terminal-controls">
          <span class="terminal-btn red" @click="handleClose"></span>
          <span class="terminal-btn yellow" @click="handleMinimize"></span>
          <span class="terminal-btn green" @click="handleFullscreen"></span>
        </div>

        <!-- Terminal Title -->
        <div class="terminal-title glitch" :data-text="'DARKSHOP://' + typedTitle">
          DARKSHOP://{{ typedTitle }}
        </div>
      </div>

      <div class="header-right">
        <!-- Desktop Navigation -->
        <nav class="desktop-nav">
          <router-link to="/">HOME</router-link>
          <router-link to="/products">PRODUCTS</router-link>
          <router-link to="/cart">CART</router-link>
          <router-link to="/checkout">CHECKOUT</router-link>
          <router-link to="/login">LOGIN</router-link>
          <router-link to="/account">ACCOUNT</router-link>
        </nav>

        <!-- TOR Status -->
        <div class="connection-status" :class="torColor" @click="toggleTor">
          <span class="tor-ring"></span>
          <span class="status-indicator" :class="torColor"></span>
          <span>{{ torActive ? 'TOR_STATUS: ACTIVE' : 'TOR_STATUS: INACTIVE' }}</span>
        </div>

        <!-- Mobile Menu Toggle -->
        <div class="menu-toggle" @click.stop="toggleMenu">
          <i class="fas" :class="menuOpen ? 'fa-times' : 'fa-bars'"></i>
        </div>
      </div>

      <!-- Mobile Navigation Dropdown -->
      <transition name="fade">
        <nav v-if="menuOpen" class="mobile-nav">
          <router-link to="/" @click.native="toggleMenu">HOME</router-link>
          <router-link to="/products" @click.native="toggleMenu">PRODUCTS</router-link>
          <router-link to="/cart" @click.native="toggleMenu">CART</router-link>
          <router-link to="/checkout" @click.native="toggleMenu">CHECKOUT</router-link>
          <router-link to="/login" @click.native="toggleMenu">LOGIN</router-link>
          <router-link to="/account" @click.native="toggleMenu">ACCOUNT</router-link>
        </nav>
      </transition>
    </header>

    <!-- Mobile Sidebar -->
    <nav class="sidebar" :class="{ open: menuOpen }" @click.stop>
      <ul>
        <li><router-link to="/" @click="closeMenu">Home</router-link></li>
        <li><router-link to="/products" @click="closeMenu">Products</router-link></li>
        <li><router-link to="/cart" @click="closeMenu">Cart</router-link></li>
        <li><router-link to="/checkout" @click="closeMenu">Checkout</router-link></li>
        <li><router-link to="/login" @click="closeMenu">Login</router-link></li>
        <li><router-link to="/account" @click="closeMenu">Account</router-link></li>
      </ul>
    </nav>

    <!-- Main Content -->
    <main class="terminal-content">
      <router-view v-slot="{ Component }">
        <transition :name="transitionName" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer Terminal Logs -->
    <footer class="terminal-footer">
      <div class="terminal-log-wrapper">
        <div class="log-header">
          <span class="clear-btn" @click="clearLogs">[CLEAR LOGS]</span>
        </div>
        <div class="terminal-log" ref="logContainer">
          <div v-for="(entry, index) in systemLogs" :key="index" class="log-line">
            {{ entry }}
          </div>
        </div>
        <div class="live-indicator" :class="{ live: torActive }">
          <span class="dot"></span> SECURE SESSION
        </div>
      </div>
    </footer>

    <!-- Toast Notification -->
    <transition name="toast-fade">
      <div v-if="showTorNotification" class="tor-toast" :class="torColor">
        {{ torMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup>
  import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
  import { useRoute } from 'vue-router';
  import { debounce } from 'lodash-es';

  const route = useRoute();

  // State
  const menuOpen = ref(false);
  const torActive = ref(true);
  const torMessage = ref('TOR MODE ENABLED');
  const torColor = ref('enabled');
  const showTorNotification = ref(false);
  const systemLogs = ref([]);
  const logContainer = ref(null);
  const typedTitle = ref('');
  const showBootScreen = ref(true);
  const isLoading = ref(false);
  const loadingProgress = ref(0);
  const loadingText = ref('SYSTEM_INIT');
  const loadingMessages = [
    'CONNECTING_TO_DARKNET',
    'ENCRYPTING_TRANSACTION',
    'VERIFYING_IDENTITY',
    'LOADING_PRODUCTS',
    'ESTABLISHING_SECURE_CHANNEL',
  ];

  // Menu functions
  const toggleMenu = () => {
    menuOpen.value = !menuOpen.value;
    if (menuOpen.value) {
      nextTick(() => {
        window.addEventListener('scroll', handleScrollClose, { passive: true });
        document.addEventListener('click', handleClickOutside);
      });
    } else {
      removeEventListeners();
    }
  };

  const closeMenu = () => {
    menuOpen.value = false;
    removeEventListeners();
  };

  const handleScrollClose = debounce(() => {
    closeMenu();
  }, 100);

  const handleClickOutside = (event) => {
    const menu = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.menu-toggle');

    if (!menu.contains(event.target) && !toggleBtn.contains(event.target)) {
      closeMenu();
    }
  };

  const removeEventListeners = () => {
    window.removeEventListener('scroll', handleScrollClose);
    document.removeEventListener('click', handleClickOutside);
  };

  // Other functions
  const simulateLoading = async () => {
    isLoading.value = true;
    loadingProgress.value = 0;
    loadingText.value = loadingMessages[0];

    const interval = setInterval(() => {
      loadingProgress.value += Math.floor(Math.random() * 15) + 5;
      if (loadingProgress.value >= 100) {
        loadingProgress.value = 100;
        clearInterval(interval);
        setTimeout(() => {
          isLoading.value = false;
        }, 500);
      }

      if (Math.random() > 0.7) {
        const randomIndex = Math.floor(Math.random() * loadingMessages.length);
        loadingText.value = loadingMessages[randomIndex];
      }
    }, 300);
  };

  const log = (msg) => {
    const timestamp = new Date().toLocaleTimeString();
    systemLogs.value.push(`[${timestamp}] ${msg}`);
    nextTick(() => {
      if (logContainer.value) {
        logContainer.value.scrollTop = logContainer.value.scrollHeight;
      }
    });
  };

  const clearLogs = () => {
    systemLogs.value = [];
    log('LOGS CLEARED');
  };

  const toggleTor = () => {
    torActive.value = !torActive.value;
    torColor.value = torActive.value ? 'enabled' : 'disabled';
    torMessage.value = torActive.value ? 'TOR MODE ENABLED' : 'TOR MODE DISABLED';
    showTorNotification.value = true;
    log(torMessage.value);
    setTimeout(() => {
      showTorNotification.value = false;
    }, 3000);
  };

  const handleClose = () => (window.location.href = '/');
  const handleMinimize = () => {}; // placeholder
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen?.();
    }
  };

  // Computed
  const layoutClass = computed(() => ({
    'admin-layout': route.meta.layout === 'admin',
    'empty-layout': route.meta.layout === 'empty',
  }));

  const transitionName = computed(() => route.meta.transition || 'terminal-fade');

  // Lifecycle
  onMounted(() => {
    setTimeout(() => {
      showBootScreen.value = false;
    }, 1500);
  });

  onBeforeUnmount(() => {
    removeEventListeners();
  });

  // Watchers
  watch(
    () => route.name,
    async () => {
      await simulateLoading();
      typedTitle.value = '';
      const name = route.name || 'DARKSHOP';
      for (let i = 0; i < name.length; i++) {
        typedTitle.value += name[i];
        await new Promise((r) => setTimeout(r, 30));
      }
    }
  );
</script>

<style scoped>
  /* Base Styles */
  :root {
    --terminal-bg: #0a0a0a;
    --terminal-text: #c0f0dc;
    --terminal-primary: #00ffea;
  }

  .main-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: var(--terminal-bg);
    color: var(--terminal-text);
    font-family: 'Courier New', monospace;
    overflow-x: hidden;
  }

  /* Header Styles */
  .terminal-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    padding: 0.7rem 1rem;
    background: #111;
    border-bottom: 1px solid #00ffea;
    position: relative;
    z-index: 999;
    gap: 0.8rem;
  }

  .header-left {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .terminal-controls {
    display: flex;
    gap: 0.5rem;
  }

  .terminal-btn {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    cursor: pointer;
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

  .terminal-title {
    margin-left: 1rem;
    font-size: 0.85rem;
    color: var(--terminal-primary);
    letter-spacing: 1px;
  }

  .glitch {
    position: relative;
  }
  .glitch::before,
  .glitch::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    width: 100%;
    color: var(--terminal-primary);
  }
  .glitch::before {
    top: -2px;
    animation: glitchTop 1s infinite alternate-reverse;
  }
  .glitch::after {
    top: 2px;
    animation: glitchBottom 1s infinite alternate-reverse;
  }

  @keyframes glitchTop {
    0% {
      clip-path: inset(0 0 60% 0);
    }
    100% {
      clip-path: inset(0 0 40% 0);
    }
  }
  @keyframes glitchBottom {
    0% {
      clip-path: inset(60% 0 0 0);
    }
    100% {
      clip-path: inset(40% 0 0 0);
    }
  }

  /* Navigation Styles */
  .desktop-nav {
    display: flex;
    gap: 1rem;
  }
  .desktop-nav a {
    color: var(--terminal-primary);
    font-weight: bold;
    text-decoration: none;
    font-size: 0.85rem;
    text-transform: uppercase;
  }
  .desktop-nav a:hover {
    color: white;
  }

  /* TOR Status Styles */
  .tor-status {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.3rem 0.75rem;
    font-size: 0.75rem;
    background-color: #111;
    border: 1px solid var(--terminal-primary);
    color: var(--terminal-primary);
    cursor: pointer;
    font-family: 'Courier New', monospace;
    border-radius: 4px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  .tor-status:hover {
    background-color: var(--terminal-primary);
    color: #000;
  }
  .tor-status .tor-ring {
    position: absolute;
    width: 150%;
    height: 150%;
    top: -25%;
    left: -25%;
    border-radius: 50%;
    z-index: 0;
    opacity: 0.6;
    animation: pulseRing 2s infinite;
    pointer-events: none;
  }
  .tor-status.active .tor-ring {
    background: radial-gradient(circle, rgba(0, 255, 170, 0.2) 0%, rgba(0, 255, 170, 0) 70%);
  }
  .tor-status:not(.active) .tor-ring {
    background: radial-gradient(circle, rgba(255, 80, 80, 0.2) 0%, rgba(255, 80, 80, 0) 70%);
  }
  .tor-status.active {
    box-shadow: 0 0 10px var(--terminal-primary);
    text-shadow: 0 0 6px var(--terminal-primary);
  }

  @keyframes pulseRing {
    0% {
      transform: scale(0.9);
      opacity: 0.3;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.6;
    }
    100% {
      transform: scale(0.9);
      opacity: 0.3;
    }
  }

  /* Mobile Menu Styles */
  .menu-toggle {
    display: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: var(--terminal-primary);
  }

  .sidebar {
    position: fixed;
    top: 50px;
    left: 0;
    background: #0f0f0f;
    width: 200px;
    padding: 1rem;
    border-right: 1px solid #00ffea;
    transform: translateX(-100%);
    transition: 0.3s ease;
    z-index: 1000;
  }
  .sidebar.open {
    transform: translateX(0);
  }
  .sidebar ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .sidebar li {
    margin-bottom: 1rem;
  }
  .sidebar a {
    color: var(--terminal-primary);
    text-decoration: none;
    font-weight: bold;
    text-transform: uppercase;
  }
  .sidebar a:hover {
    color: white;
  }

  /* Content Styles */
  .terminal-content {
    flex: 1;
    padding: 1rem;
  }

  /* Footer Styles */
  .terminal-footer {
    background: #111;
    padding: 0.5rem 1rem;
    border-top: 1px solid #00ffea;
    font-size: 0.8rem;
  }
  .terminal-log-wrapper {
    max-height: 100px;
    overflow-y: auto;
    background: #0f0f0f;
    padding: 0.5rem;
    border: 1px solid #00ffea44;
    border-radius: 4px;
    margin-top: 0.5rem;
  }
  .log-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 0.3rem;
  }
  .clear-btn {
    font-size: 0.7rem;
    color: var(--terminal-primary);
    cursor: pointer;
    font-family: 'Courier New', monospace;
    transition:
      color 0.2s,
      text-shadow 0.2s;
  }
  .clear-btn:hover {
    color: white;
    text-shadow: 0 0 5px var(--terminal-primary);
  }
  .terminal-log {
    font-size: 0.75rem;
    color: #00ffea;
  }
  .log-line {
    margin-bottom: 0.25rem;
    animation: fadeInLog 0.2s ease;
  }
  @keyframes fadeInLog {
    from {
      opacity: 0;
      transform: translateY(2px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Toast Notification */
  .tor-toast {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.6rem 1.2rem;
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    border-radius: 5px;
    z-index: 9999;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 1px;
    border: 1px solid;
    transition:
      background 0.3s,
      box-shadow 0.3s,
      color 0.3s;
  }

  /* TOR ENABLED */
  .tor-toast.enabled {
    background: rgba(0, 255, 65, 0.08);
    color: #00ff41;
    border-color: rgba(0, 255, 65, 0.4);
    box-shadow: 0 0 6px rgba(0, 255, 65, 0.3);
  }

  /* TOR DISABLED */
  .tor-toast.disabled {
    background: rgba(255, 68, 68, 0.1);
    color: #ff4444;
    border-color: rgba(255, 68, 68, 0.4);
    box-shadow: 0 0 6px rgba(255, 68, 68, 0.3);
  }

  /* Loading Overlay */
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9998;
    font-family: 'Courier New', monospace;
  }

  .terminal-loader {
    width: 80%;
    max-width: 500px;
    color: var(--terminal-primary);
    text-align: center;
  }

  .terminal-loader-text {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    text-shadow: 0 0 5px var(--terminal-primary);
    letter-spacing: 2px;
    animation: pulseText 1.5s infinite alternate;
  }

  .terminal-loader-bar {
    height: 4px;
    background-color: #333;
    border-radius: 2px;
    overflow: hidden;
    position: relative;
  }

  .terminal-loader-progress {
    height: 100%;
    background-color: var(--terminal-primary);
    width: 0;
    transition: width 0.3s ease;
    position: relative;
  }

  .terminal-loader-progress::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 234, 0.5), transparent);
    animation: progressGlow 1.5s infinite;
  }

  @keyframes pulseText {
    0% {
      opacity: 0.7;
    }
    100% {
      opacity: 1;
      text-shadow: 0 0 10px var(--terminal-primary);
    }
  }

  @keyframes progressGlow {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  /* Boot Screen */
  .boot-screen {
    position: fixed;
    inset: 0;
    background: #000;
    color: var(--terminal-primary);
    font-family: 'Courier New', monospace;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99999;
    font-size: 1rem;
  }
  .boot-fade-enter-active,
  .boot-fade-leave-active {
    transition: opacity 1s ease;
  }
  .boot-fade-enter-from,
  .boot-fade-leave-to {
    opacity: 0;
  }

  /* Live Indicator */
  .live-indicator {
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: #888;
    margin-top: 0.3rem;
  }
  .live-indicator.live {
    color: var(--terminal-primary);
  }
  .live-indicator .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    animation: blink 1s infinite;
  }
  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }

  /* Transitions */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  /* Responsive Styles - 850px breakpoint */
  @media (max-width: 850px) {
    .terminal-header {
      padding: 0.7rem;
    }

    .terminal-loader-text {
      font-size: 12px;
      margin-bottom: 1rem;
      text-shadow: 0 0 5px var(--terminal-primary);
      letter-spacing: 2px;
      animation: pulseText 1.5s infinite alternate;
      box-sizing: border-box;
    }

    .header-right {
      width: 100%;
      order: 3;
      justify-content: flex-end;
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid rgba(0, 255, 234, 0.2);
    }

    .desktop-nav {
      display: none;
    }

    .tor-status {
      margin-left: auto;
    }

    .menu-toggle {
      display: block;
      margin-left: auto;
    }

    .terminal-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      padding: 0.7rem 1rem;
      background: #111;
      border-bottom: 1px solid #00ffea;
      position: relative;
      z-index: 999;
      gap: 0.8rem;
      margin: auto 15px;
    }
  }

  @media (max-width: 850px) {
    .mobile-nav {
      display: none !important;
    }
  }

  .connection-status {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    padding: 0.3rem 0.8rem;
    background-color: rgba(0, 255, 65, 0.05);
    border-radius: 20px;
    border: 1px solid rgba(0, 255, 65, 0.2);
    height: 100%; /* make it stretch to match header height */
    margin: auto 0; /* center vertically within parent */
  }

  /* Enabled (Green) State */
  .connection-status.enabled {
    background-color: rgba(0, 255, 65, 0.05);
    border: 1px solid rgba(0, 255, 65, 0.2);
    color: #00ff41;
  }

  /* Disabled (Red) State */
  .connection-status.disabled {
    background-color: rgba(255, 65, 65, 0.05);
    border: 1px solid rgba(255, 65, 65, 0.2);
    color: #ff4141;
  }

  .status-indicator {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  .status-indicator.enabled {
    background-color: #00ff41;
    box-shadow: 0 0 10px #00ff41;
    animation: pulse 1.5s infinite;
  }

  .status-indicator.disabled {
    background-color: #ff4141;
    box-shadow: 0 0 10px #ff4141;
  }

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

  /* Notification Style (matches your existing notification system) */
  .tor-notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 4px;
    font-size: 0.9rem;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  }

  .tor-notification.enabled {
    background-color: rgba(0, 255, 65, 0.1);
    border: 1px solid rgba(0, 255, 65, 0.3);
    color: #00ff41;
  }

  .tor-notification.disabled {
    background-color: rgba(255, 65, 65, 0.1);
    border: 1px solid rgba(255, 65, 65, 0.3);
    color: #ff4141;
  }

  @keyframes slideIn {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>
