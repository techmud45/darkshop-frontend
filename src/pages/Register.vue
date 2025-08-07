<template>
  <div class="secure-access-container">
    <!-- Terminal Header -->
    <div class="terminal-header">
      <div class="terminal-controls">
        <span class="terminal-btn red"></span>
        <span class="terminal-btn yellow"></span>
        <span class="terminal-btn green"></span>
      </div>
      <div class="terminal-title">new_identity://registration_portal</div>
    </div>

    <!-- Main Auth Container -->
    <div class="auth-terminal">
      <div class="auth-header">
        <h1 class="access-title">IDENTITY CREATION</h1>
        <div class="connection-status">
          <span class="status-indicator active"></span>
          <span>TOR_ENCRYPTED</span>
        </div>
      </div>

      <form @submit.prevent="register" class="auth-form">
        <div class="input-field">
          <label>ANONYMOUS_HANDLE</label>
          <input
            v-model="username"
            type="text"
            required
            class="secure-input"
            @input="validateUsername"
          />
          <div class="input-decoration"></div>
          <div class="validation-message" v-if="usernameValidation">
            <i :class="usernameValid ? 'fas fa-check' : 'fas fa-times'"></i>
            {{ usernameValidation }}
          </div>
        </div>

        <div class="input-field">
          <label>ENCRYPTED_CONTACT</label>
          <input
            v-model="email"
            type="email"
            required
            class="secure-input"
            @input="validateEmail"
          />
          <div class="input-decoration"></div>
          <div class="validation-message" v-if="emailValidation">
            <i :class="emailValid ? 'fas fa-check' : 'fas fa-times'"></i>
            {{ emailValidation }}
          </div>
        </div>

        <div class="input-field">
          <label>CRYPTO_KEY</label>
          <input
            v-model="password"
            type="password"
            required
            class="secure-input"
            @input="checkPasswordStrength"
          />
          <div class="input-decoration"></div>
          <div class="password-strength-container">
            <div class="password-strength" :class="strengthClass"></div>
            <span class="strength-text">{{ strengthText }}</span>
          </div>
        </div>

        <div class="security-indicator">
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

        <div class="terms-agreement">
          <input type="checkbox" id="terms" v-model="termsAccepted" required />
          <label for="terms"
            >I understand all data is ephemeral and accounts cannot be recovered</label
          >
        </div>

        <button type="submit" class="auth-button" :disabled="!formValid || loading">
          <span class="button-text">GENERATE_IDENTITY</span>
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
        <p class="crypto-note">[ ALL DATA IS AES-256 ENCRYPTED AT REST ]</p>
        <p class="disclaimer">No personal information is stored in plaintext</p>
        <router-link to="/login" class="existing-account">
          <i class="fas fa-arrow-left"></i> Existing identity detected
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import axios from '../axios';
  import { useRouter } from 'vue-router';

  const username = ref('');
  const email = ref('');
  const password = ref('');
  const error = ref('');
  const loading = ref(false);
  const termsAccepted = ref(false);
  const router = useRouter();

  // Validation states
  const usernameValid = ref(false);
  const emailValid = ref(false);
  const usernameValidation = ref('');
  const emailValidation = ref('');

  const passwordStrength = ref(0);
  const strengthText = ref('');
  const strengthClass = ref('weak');

  const formValid = computed(() => {
    return (
      usernameValid.value && emailValid.value && passwordStrength.value >= 60 && termsAccepted.value
    );
  });

  const getEncryptionStyle = (n) => {
    return {
      animationDelay: `${n * 0.1}s`,
      opacity: 0.2 + n * 0.15,
    };
  };

  const validateUsername = () => {
    if (username.value.length < 3) {
      usernameValid.value = false;
      usernameValidation.value = 'Too short (min 3 chars)';
    } else if (username.value.length > 20) {
      usernameValid.value = false;
      usernameValidation.value = 'Too long (max 20 chars)';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username.value)) {
      usernameValid.value = false;
      usernameValidation.value = 'Only letters, numbers, _';
    } else {
      usernameValid.value = true;
      usernameValidation.value = 'Valid anonymous handle';
    }
  };

  const validateEmail = () => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (re.test(email.value)) {
      emailValid.value = true;
      emailValidation.value = 'Valid encrypted contact';
    } else {
      emailValid.value = false;
      emailValidation.value = 'Invalid contact format';
    }
  };

  const checkPasswordStrength = () => {
    const length = password.value.length;
    let strength = 0;

    if (length === 0) {
      strength = 0;
      strengthText.value = '';
      strengthClass.value = 'weak';
      return;
    } else if (length < 5) {
      strength = 30;
      strengthText.value = 'Weak';
      strengthClass.value = 'weak';
    } else if (length < 8) {
      strength = 60;
      strengthText.value = 'Moderate';
      strengthClass.value = 'moderate';
    } else {
      strength = 80;
      strengthText.value = 'Strong';
      strengthClass.value = 'strong';

      // Bonus for special chars
      if (/[!@#$%^&*]/.test(password.value)) strength += 10;
      // Bonus for numbers
      if (/\d/.test(password.value)) strength += 10;
      // Bonus for mixed case
      if (/[a-z]/.test(password.value) && /[A-Z]/.test(password.value)) strength += 10;

      strength = Math.min(strength, 100);
    }

    passwordStrength.value = strength;
  };

  const register = async () => {
    error.value = '';
    loading.value = true;
    try {
      await axios.post('/auth/register', {
        username: username.value,
        email: email.value,
        password: password.value,
      });
      router.push('/login');
    } catch (err) {
      error.value = err.response?.data?.message || 'IDENTITY_CREATION_FAILED: Connection issue';
    } finally {
      loading.value = false;
    }
  };
</script>

<style scoped>
  /* Base Styles */
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
    margin-bottom: 1.25rem;
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

  .password-strength-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.3rem;
  }

  .password-strength {
    height: 3px;
    flex-grow: 1;
    transition: width 0.3s ease;
  }

  .password-strength.weak {
    background-color: #ff4444;
  }

  .password-strength.moderate {
    background-color: #ffeb3b;
  }

  .password-strength.strong {
    background-color: #00ff41;
  }

  .strength-text {
    font-size: 0.7rem;
    color: #666;
    min-width: 50px;
  }

  .validation-message {
    font-size: 0.7rem;
    margin-top: 0.3rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .validation-message i.fa-check {
    color: #00ff41;
  }

  .validation-message i.fa-times {
    color: #ff4444;
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

  .terms-agreement {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 1rem 0;
    font-size: 0.8rem;
    color: #666;
  }

  .terms-agreement input[type='checkbox'] {
    appearance: none;
    width: 16px;
    height: 16px;
    border: 1px solid #444;
    background-color: #0a0a0a;
    position: relative;
    cursor: pointer;
  }

  .terms-agreement input[type='checkbox']:checked {
    background-color: rgba(0, 255, 65, 0.1);
    border-color: #00ff41;
  }

  .terms-agreement input[type='checkbox']:checked::after {
    content: '✓';
    position: absolute;
    color: #00ff41;
    font-size: 0.8rem;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
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
    margin-top: 1rem;
  }

  .auth-button:hover:not(:disabled) {
    background-color: rgba(0, 255, 65, 0.2);
  }

  .auth-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

  .auth-button:hover:not(:disabled)::before {
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

  .existing-account {
    color: #666;
    font-size: 0.8rem;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    margin-top: 1rem;
    transition: color 0.3s ease;
  }

  .existing-account:hover {
    color: #00ff41;
  }

  .existing-account i {
    font-size: 0.7rem;
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

  /* Responsive Adjustments */
  @media (max-width: 768px) {
    .auth-terminal {
      padding: 1.5rem;
    }

    .auth-form {
      gap: 1.25rem;
    }

    .auth-footer {
      margin-top: 1.5rem;
    }
  }

  @media (max-width: 600px) {
    .secure-access-container {
      padding: 0.5rem;
    }

    .terminal-header {
      padding: 0.5rem;
    }
  }

  @media (max-width: 480px) {
    .auth-terminal {
      padding: 1rem;
    }

    .auth-form {
      gap: 1rem;
    }

    .input-field {
      margin-bottom: 1rem;
    }

    .secure-input {
      padding: 0.7rem;
    }

    .terms-agreement {
      margin: 0.75rem 0;
    }

    .auth-button {
      margin-top: 0.75rem;
    }

    .auth-footer {
      margin-top: 1rem;
    }

    .access-title {
      font-size: 1.2rem;
    }
  }
</style>
