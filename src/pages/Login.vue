<template>
  <div class="secure-access-container">
    <!-- Terminal Header -->
    <div class="terminal-header">
      <div class="terminal-controls">
        <span class="terminal-btn red"></span>
        <span class="terminal-btn yellow"></span>
        <span class="terminal-btn green"></span>
      </div>
      <div class="terminal-title">secure_login://authentication_gateway</div>
    </div>

    <!-- Main Auth Container -->
    <div class="auth-terminal">
      <div class="auth-header">
        <h1 class="access-title">SECURE ACCESS</h1>
        <div class="connection-status">
          <span class="status-indicator active"></span>
          <span>TOR_ENCRYPTED</span>
        </div>
      </div>

      <form @submit.prevent="login" class="auth-form">
        <div class="input-field">
          <label>ENCRYPTED_IDENTIFIER</label>
          <input
            v-model="email"
            type="email"
            required
            class="secure-input"
            @focus="showSecurityIndicator = true"
            @blur="showSecurityIndicator = false"
          />
          <div class="input-decoration"></div>
        </div>

        <div class="input-field">
          <label>CRYPTO_KEY</label>
          <input v-model="password" type="password" required class="secure-input" />
          <div class="input-decoration"></div>
          <div class="password-strength" :style="{ width: passwordStrength + '%' }"></div>
        </div>

        <div class="security-indicator" v-if="showSecurityIndicator">
          <div class="encryption-animation">
            <span
              class="encryption-dot"
              v-for="n in 5"
              :key="n"
              :style="getEncryptionStyle(n)"
            ></span>
          </div>
          <span>END-TO-END ENCRYPTION ACTIVE</span>
        </div>

        <button type="submit" class="auth-button">
          <span class="button-text">INITIATE_AUTHENTICATION</span>
          <span class="button-loader" v-if="loading">
            <span class="loader-dot" v-for="n in 3" :key="n"></span>
          </span>
        </button>

        <div v-if="error" class="auth-error">
          <i class="fas fa-exclamation-triangle"></i>
          <span>{{ error }}</span>
        </div>
      </form>

      <div class="auth-footer">
        <p class="crypto-note">[ ALL CREDENTIALS ARE AES-256 ENCRYPTED ]</p>
        <p class="disclaimer">Unauthorized access will be logged and reported</p>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import axios from '../axios';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '../stores/user';

  const email = ref('');
  const password = ref('');
  const error = ref('');
  const loading = ref(false);
  const showSecurityIndicator = ref(false);
  const router = useRouter();
  const userStore = useUserStore();

  const passwordStrength = computed(() => {
    if (!password.value.length) return 0;
    if (password.value.length < 5) return 30;
    if (password.value.length < 8) return 60;
    return 100;
  });

  const getEncryptionStyle = (n) => {
    return {
      animationDelay: `${n * 0.1}s`,
      opacity: 0.2 + n * 0.15,
    };
  };

  const login = async () => {
    error.value = '';
    loading.value = true;
    try {
      const res = await axios.post('/auth/login', {
        email: email.value,
        password: password.value,
      });
      userStore.login(res.data);
      router.push('/products');
    } catch (err) {
      error.value = err.response?.data?.message || 'AUTHENTICATION_FAILURE: Invalid credentials';
    } finally {
      loading.value = false;
    }
  };
</script>

<style scoped>
  .secure-access-container {
    background-color: #0a0a0a;
    color: #00ff41;
    min-height: 100vh;
    font-family: 'Courier New', monospace;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .terminal-header {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    background-color: #121212;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    width: 100%;
    max-width: 500px;
    border-bottom: 1px solid #1e1e1e;
  }

  .terminal-controls {
    display: flex;
    gap: 0.5rem;
  }

  .terminal-btn {
    display: inline-block;
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
    font-size: 0.8rem;
    color: #666;
    letter-spacing: 0.5px;
  }

  .auth-terminal {
    background-color: #121212;
    border: 1px solid #1e1e1e;
    border-top: none;
    width: 100%;
    max-width: 500px;
    padding: 2rem;
    position: relative;
  }

  .auth-terminal::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #00ff41, transparent);
  }

  .auth-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .access-title {
    color: #00ff41;
    font-size: 1.5rem;
    letter-spacing: 2px;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
  }

  .connection-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    padding: 0.3rem 0.8rem;
    background-color: rgba(0, 255, 65, 0.05);
    border-radius: 20px;
    border: 1px solid rgba(0, 255, 65, 0.2);
  }

  .status-indicator {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .status-indicator.active {
    background-color: #00ff41;
    box-shadow: 0 0 10px #00ff41;
    animation: pulse 1.5s infinite;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .input-field {
    position: relative;
  }

  .input-field label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.8rem;
    color: #666;
    letter-spacing: 1px;
  }

  .secure-input {
    width: 100%;
    padding: 0.8rem;
    background-color: #0a0a0a;
    border: 1px solid #1e1e1e;
    color: #00ff41;
    font-family: 'Courier New', monospace;
    letter-spacing: 1px;
    transition: all 0.3s ease;
  }

  .secure-input:focus {
    outline: none;
    border-color: #00ff41;
    box-shadow: 0 0 10px rgba(0, 255, 65, 0.1);
  }

  .input-decoration {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, #1e1e1e, transparent);
  }

  .password-strength {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    background-color: #00ff41;
    transition: width 0.3s ease;
  }

  .security-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.7rem;
    color: #666;
    margin-top: -1rem;
  }

  .encryption-animation {
    display: flex;
    gap: 0.2rem;
  }

  .encryption-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #00ff41;
    animation: encrypt-pulse 1.5s infinite;
  }

  @keyframes encrypt-pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.2;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
  }

  .auth-button {
    background-color: rgba(0, 255, 65, 0.1);
    border: 1px solid #00ff41;
    color: #00ff41;
    padding: 1rem;
    font-family: 'Courier New', monospace;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .auth-button:hover {
    background-color: rgba(0, 255, 65, 0.2);
  }

  .auth-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 65, 0.2), transparent);
    transition: 0.5s;
  }

  .auth-button:hover::before {
    left: 100%;
  }

  .button-loader {
    display: flex;
    gap: 0.3rem;
  }

  .loader-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #00ff41;
    animation: loader-bounce 1.4s infinite both;
  }

  .loader-dot:nth-child(1) {
    animation-delay: -0.32s;
  }
  .loader-dot:nth-child(2) {
    animation-delay: -0.16s;
  }

  @keyframes loader-bounce {
    0%,
    80%,
    100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }

  .auth-error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #ff4444;
    font-size: 0.8rem;
    padding: 0.8rem;
    background-color: rgba(255, 68, 68, 0.1);
    border: 1px solid rgba(255, 68, 68, 0.3);
  }

  .auth-footer {
    margin-top: 2rem;
    text-align: center;
    font-size: 0.7rem;
    color: #666;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .crypto-note {
    letter-spacing: 1px;
  }

  .disclaimer {
    font-size: 0.6rem;
    color: #444;
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

  @media (max-width: 600px) {
    .auth-terminal {
      padding: 1.5rem;
    }

    .access-title {
      font-size: 1.2rem;
    }
  }
</style>
