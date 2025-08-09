<template>
  <div class="secure-terminal">
    <!-- Terminal Header -->
    <div class="terminal-header">
      <div class="terminal-controls">
        <span class="terminal-btn red" @click="$router.push('/')"></span>
        <span class="terminal-btn yellow" @click="toggleMenu"></span>
        <span class="terminal-btn green" @click="toggleTor"></span>
      </div>
      <div class="terminal-title">darkmarket://account_console</div>
      <div class="connection-status" :class="{ 'tor-active': torActive }">
        <span class="status-indicator"></span>
        <span>{{ torActive ? 'TOR_ACTIVE' : 'TOR_INACTIVE' }}</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="terminal-body">
      <div class="command-line">
        <span class="prompt">user@darkmarket:~$</span>
        <span class="command">load_account_data</span>
        <span class="blinking-cursor">_</span>
      </div>

      <div v-if="loading" class="loading-animation">
        <div class="loader-line" v-for="n in 5" :key="n" :style="getLoaderStyle(n)"></div>
        <div class="loading-text">DECRYPTING ACCOUNT DATA...</div>
      </div>

      <div v-else-if="user" class="account-data">
        <!-- User Profile Section -->
        <div class="data-section">
          <div class="section-header">
            <i class="fas fa-user"></i>
            <h3>USER_PROFILE</h3>
          </div>
          <div class="profile-info">
            <div class="info-row"><span class="info-label">USERNAME:</span> <span class="info-value">{{ user.username }}</span></div>
            <div class="info-row"><span class="info-label">EMAIL:</span> <span class="info-value">{{ user.email }}</span></div>
          </div>
          <button class="cyber-button" @click="showProfileEdit = true"><i class="fas fa-edit"></i><span>EDIT_PROFILE</span></button>
          <button class="cyber-button confirm-btn" @click="showChangePassword = true"><i class="fas fa-key"></i><span>CHANGE_PASSWORD</span></button>
          <button class="cyber-button wallet-btn" @click="showForgotPassword = true"><i class="fas fa-unlock-alt"></i><span>FORGOT_PASSWORD</span></button>
        </div>

        <!-- Edit Profile Modal -->
        <div v-if="showProfileEdit" class="crypto-modal">
          <div class="modal-content">
            <div class="modal-header">
              <h4><i class="fas fa-user-edit"></i> EDIT_PROFILE</h4>
              <button @click="showProfileEdit = false" class="close-btn"><i class="fas fa-times"></i></button>
            </div>
            <div class="input-group">
              <label>USERNAME:</label>
              <input v-model="editUsername" class="cyber-input" />
            </div>
            <div class="input-group">
              <label>EMAIL:</label>
              <input v-model="editEmail" class="cyber-input" />
            </div>
            <button class="cyber-button confirm-btn" @click="updateProfile"><i class="fas fa-save"></i><span>SAVE_CHANGES</span></button>
            <div v-if="profileMsg" :class="{'error-line': profileMsgType==='error', 'success-line': profileMsgType==='success'}">{{ profileMsg }}</div>
          </div>
        </div>

        <!-- Change Password Modal -->
        <div v-if="showChangePassword" class="crypto-modal">
          <div class="modal-content">
            <div class="modal-header">
              <h4><i class="fas fa-key"></i> CHANGE_PASSWORD</h4>
              <button @click="showChangePassword = false" class="close-btn"><i class="fas fa-times"></i></button>
            </div>
            <div class="input-group">
              <label>CURRENT PASSWORD:</label>
              <input v-model="currentPassword" type="password" class="cyber-input" />
            </div>
            <div class="input-group">
              <label>NEW PASSWORD:</label>
              <input v-model="newPassword" type="password" class="cyber-input" />
            </div>
            <div class="input-group">
              <label>CONFIRM NEW PASSWORD:</label>
              <input v-model="confirmPassword" type="password" class="cyber-input" />
            </div>
            <button class="cyber-button confirm-btn" @click="changePassword"><i class="fas fa-check-circle"></i><span>UPDATE_PASSWORD</span></button>
            <div v-if="passwordMsg" :class="{'error-line': passwordMsgType==='error', 'success-line': passwordMsgType==='success'}">{{ passwordMsg }}</div>
          </div>
        </div>

        <!-- Forgot Password Modal -->
        <div v-if="showForgotPassword" class="crypto-modal">
          <div class="modal-content">
            <div class="modal-header">
              <h4><i class="fas fa-unlock-alt"></i> PASSWORD_RESET</h4>
              <button @click="showForgotPassword = false" class="close-btn"><i class="fas fa-times"></i></button>
            </div>
            <div class="input-group">
              <label>EMAIL:</label>
              <input v-model="resetEmail" class="cyber-input" />
            </div>
            <button class="cyber-button confirm-btn" @click="requestPasswordReset"><i class="fas fa-envelope"></i><span>SEND_RESET_LINK</span></button>
            <div v-if="resetMsg" :class="{'error-line': resetMsgType==='error', 'success-line': resetMsgType==='success'}">{{ resetMsg }}</div>
          </div>
        </div>

        <!-- Balance Section -->
        <div class="data-section">
          <div class="section-header">
            <i class="fas fa-coins"></i>
            <h3>CRYPTO_BALANCE</h3>
          </div>
          <div class="balance-display">
            <span class="currency-symbol">$</span>
            <span class="balance-amount">{{ user.balance ? user.balance.toFixed(2) : '0.00' }}</span>
          </div>
          <button @click="showTopup = true" class="cyber-button">
            <i class="fas fa-bolt"></i>
            <span>TOP_UP</span>
          </button>
        </div>

        <!-- Top Up Modal -->
        <div v-if="showTopup" class="crypto-modal">
          <div class="modal-content">
            <div class="modal-header">
              <h4><i class="fas fa-qrcode"></i> BITCOIN_TOP_UP</h4>
              <button @click="showTopup = false" class="close-btn">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <div class="input-group">
              <label>AMOUNT (USD):</label>
              <input v-model.number="topupAmount" type="number" min="1" class="cyber-input" />
            </div>

            <button @click="createTopup" class="cyber-button confirm-btn">
              <i class="fas fa-check-circle"></i>
              <span>GENERATE_INVOICE</span>
            </button>

            <div v-if="invoice" class="invoice-details">
              <div class="qr-container">
                <img :src="invoice.qr" alt="BTC QR" class="qr-code" />
                <div class="scan-text">SCAN_TO_PAY</div>
              </div>
              
              <div class="invoice-info">
                <div class="info-row">
                  <span class="info-label">ADDRESS:</span>
                  <span class="info-value">{{ invoice.address }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">AMOUNT:</span>
                  <span class="info-value">{{ invoice.amount }} BTC</span>
                </div>
                <div class="info-row">
                  <span class="info-label">STATUS:</span>
                  <span class="info-value" :class="statusClass">{{ topupStatus }}</span>
                </div>
              </div>

              <a :href="invoice.payUrl" target="_blank" class="cyber-button wallet-btn">
                <i class="fas fa-wallet"></i>
                <span>OPEN_IN_WALLET</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Order History -->
        <div class="data-section">
          <div class="section-header">
            <i class="fas fa-receipt"></i>
            <h3>TRANSACTION_HISTORY</h3>
          </div>
          
          <div v-if="orders.length === 0" class="no-orders">
            <i class="fas fa-box-open"></i>
            <span>NO_TRANSACTIONS_FOUND</span>
          </div>

          <div v-else class="orders-grid">
            <div class="grid-header">
              <span>TX_ID</span>
              <span>AMOUNT</span>
              <span>STATUS</span>
              <span>DATE</span>
            </div>
            
            <div v-for="order in orders" :key="order._id" class="order-row">
              <span class="order-id">{{ order._id ? order._id.slice(-6) : '' }}</span>
              <span class="order-amount">${{ order.btcAmount ? order.btcAmount.toFixed(8) : '0.00000000' }}</span>
              <span class="order-status" :class="getStatusClass(order.status)">{{ order.status }}</span>
              <span class="order-date">{{ order.createdAt ? formatDate(order.createdAt) : '' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="error-terminal">
        <div class="error-line">ERROR: UNAUTHORIZED_ACCESS</div>
        <div class="error-line">SESSION_TERMINATED</div>
        <div class="error-line">REDIRECTING_TO_LOGIN...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../axios';

const router = useRouter();

// State
const user = ref({ balance: 0 });
const orders = ref([]);
const loading = ref(true);
const showTopup = ref(false);
const topupAmount = ref(10);
const invoice = ref(null);
const topupStatus = ref('');
const torActive = ref(true);
const menuOpen = ref(false);
const showProfileEdit = ref(false);
const showChangePassword = ref(false);
const showForgotPassword = ref(false);
const editUsername = ref('');
const editEmail = ref('');
const profileMsg = ref('');
const profileMsgType = ref('');
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const passwordMsg = ref('');
const passwordMsgType = ref('');
const resetEmail = ref('');
const resetMsg = ref('');
const resetMsgType = ref('');
let pollInterval = null;

// Computed
const statusClass = computed(() => {
  return {
    'status-pending': topupStatus.value === 'pending',
    'status-paid': topupStatus.value === 'paid',
    'status-expired': topupStatus.value === 'expired'
  };
});

// Methods
const fetchAccount = async () => {
  loading.value = true;
  try {
    const res = await api.get('/account/me', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    user.value = res.data.user;
    orders.value = res.data.orders;
  } catch (err) {
    user.value = null;
    if (err.response && err.response.status === 401) {
      setTimeout(() => router.push('/login'), 1500);
    }
  } finally {
    loading.value = false;
  }
};

const createTopup = async () => {
  if (topupAmount.value > 0) {
    invoice.value = null;
    topupStatus.value = '';
    const res = await api.post('/account/topup', { amount: topupAmount.value }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    invoice.value = res.data;
    topupStatus.value = 'pending';
    pollTopupStatus();
  }
};

const pollTopupStatus = () => {
  if (pollInterval) clearInterval(pollInterval);
  pollInterval = setInterval(async () => {
    if (!invoice.value) return;
    const res = await api.get(`/webhook/invoice-status/${invoice.value.invoiceId}`);
    if (res.data.status === 'paid') {
      topupStatus.value = 'paid';
      clearInterval(pollInterval);
      setTimeout(() => {
        showTopup.value = false;
        fetchAccount();
      }, 2000);
    } else if (res.data.status === 'expired') {
      topupStatus.value = 'expired';
      clearInterval(pollInterval);
    }
  }, 5000);
};

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const toggleTor = () => {
  torActive.value = !torActive.value;
};

const getStatusClass = (status) => {
  return {
    'status-complete': status === 'paid',
    'status-pending': status === 'pending',
    'status-failed': status === 'expired'
  };
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getLoaderStyle = (n) => {
  const delay = n * 0.15;
  return {
    animationDelay: `${delay}s`,
    opacity: 0.2 + (n * 0.15)
  };
};

// Profile Edit
const updateProfile = async () => {
  profileMsg.value = '';
  profileMsgType.value = '';
  try {
    const res = await api.put('/auth/me', { username: editUsername.value, email: editEmail.value });
    user.value.username = editUsername.value;
    user.value.email = editEmail.value;
    profileMsg.value = 'Profile updated successfully!';
    profileMsgType.value = 'success';
    setTimeout(() => { showProfileEdit.value = false; profileMsg.value = ''; }, 1500);
  } catch (err) {
    profileMsg.value = err.response?.data?.error || 'Update failed';
    profileMsgType.value = 'error';
  }
};

// Change Password
const changePassword = async () => {
  passwordMsg.value = '';
  passwordMsgType.value = '';
  if (newPassword.value !== confirmPassword.value) {
    passwordMsg.value = 'Passwords do not match';
    passwordMsgType.value = 'error';
    return;
  }
  try {
    await api.post('/auth/change-password', { currentPassword: currentPassword.value, newPassword: newPassword.value });
    passwordMsg.value = 'Password changed successfully!';
    passwordMsgType.value = 'success';
    setTimeout(() => { showChangePassword.value = false; passwordMsg.value = ''; }, 1500);
    currentPassword.value = newPassword.value = confirmPassword.value = '';
  } catch (err) {
    passwordMsg.value = err.response?.data?.error || 'Password change failed';
    passwordMsgType.value = 'error';
  }
};

// Forgot Password
const requestPasswordReset = async () => {
  resetMsg.value = '';
  resetMsgType.value = '';
  try {
    await api.post('/auth/forgot-password', { email: resetEmail.value });
    resetMsg.value = 'Reset link sent! Check your email.';
    resetMsgType.value = 'success';
    setTimeout(() => { showForgotPassword.value = false; resetMsg.value = ''; }, 2000);
  } catch (err) {
    resetMsg.value = err.response?.data?.error || 'Reset failed';
    resetMsgType.value = 'error';
  }
};

onMounted(() => {
  fetchAccount();
  // Pre-fill profile edit fields
  editUsername.value = user.value.username;
  editEmail.value = user.value.email;
});
</script>

<style scoped>
.secure-terminal {
  background-color: #0a0a0a;
  color: #00ff41;
  font-family: 'Courier New', monospace;
  min-height: 100vh;
}

/* Terminal Header */
.terminal-header {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #121212;
  border-bottom: 1px solid #1e1e1e;
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

.terminal-btn.red { background-color: #ff5f56; }
.terminal-btn.yellow { background-color: #ffbd2e; }
.terminal-btn.green { background-color: #27c93f; }

.terminal-title {
  margin-left: 1rem;
  font-size: 0.8rem;
  color: #666;
  flex-grow: 1;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  padding: 0.2rem 0.8rem;
  border-radius: 3px;
  background-color: rgba(255, 68, 68, 0.1);
  color: #666;
}

.connection-status.tor-active {
  background-color: rgba(0, 255, 65, 0.1);
  color: #00ff41;
}

.status-indicator {
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

/* Terminal Body */
.terminal-body {
  padding: 1rem;
}

.command-line {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: rgba(0, 255, 65, 0.05);
  border-left: 2px solid #00ff41;
}

.prompt {
  color: #00ff41;
  margin-right: 0.5rem;
}

.command {
  color: #fff;
}

.blinking-cursor {
  animation: blink 1s infinite;
}

/* Loading Animation */
.loading-animation {
  margin: 2rem 0;
}

.loader-line {
  height: 2px;
  background-color: #00ff41;
  margin-bottom: 0.3rem;
  animation: load 1.5s infinite ease-in-out;
  transform-origin: left;
}

.loading-text {
  color: #666;
  font-size: 0.8rem;
  margin-top: 1rem;
  letter-spacing: 1px;
}

/* Account Data */
.data-section {
  margin-bottom: 2rem;
  border: 1px solid #1e1e1e;
  padding: 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #1e1e1e;
}

.section-header i {
  color: #00ff41;
}

.balance-display {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin: 1rem 0;
}

.currency-symbol {
  color: #00ff41;
  font-size: 1.5rem;
}

.balance-amount {
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(90deg, #00ff41, #00a2ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Cyber Button */
.cyber-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.2rem;
  background-color: rgba(0, 255, 65, 0.1);
  border: 1px solid #00ff41;
  color: #00ff41;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.cyber-button:hover {
  background-color: rgba(0, 255, 65, 0.2);
  box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

.cyber-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 65, 0.2), transparent);
  transition: 0.5s;
}

.cyber-button:hover::before {
  left: 100%;
}

.confirm-btn {
  background-color: rgba(0, 162, 255, 0.1);
  border-color: #00a2ff;
  color: #00a2ff;
}

.wallet-btn {
  background-color: rgba(255, 213, 0, 0.1);
  border-color: #ffd500;
  color: #ffd500;
}

/* Crypto Modal */
.crypto-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #121212;
  border: 1px solid #00ff41;
  width: 90%;
  max-width: 500px;
  padding: 1.5rem;
  box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #1e1e1e;
}

.modal-header h4 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.close-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1.2rem;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #ff5f56;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.cyber-input {
  width: 100%;
  padding: 0.8rem;
  background-color: #0a0a0a;
  border: 1px solid #1e1e1e;
  color: #00ff41;
  font-family: 'Courier New', monospace;
}

.invoice-details {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #1e1e1e;
}

.qr-container {
  text-align: center;
  margin-bottom: 1.5rem;
}

.qr-code {
  max-width: 200px;
  margin: 0 auto;
  border: 1px solid #00ff41;
  padding: 0.5rem;
  background-color: white;
}

.scan-text {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #666;
  letter-spacing: 1px;
}

.invoice-info {
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.info-label {
  color: #666;
  min-width: 80px;
}

.info-value {
  word-break: break-all;
}

.status-pending {
  color: #ffbd2e;
}

.status-paid {
  color: #00ff41;
}

.status-expired {
  color: #ff5f56;
}

/* Orders Grid */
.orders-grid {
  margin-top: 1rem;
}

.grid-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  padding: 0.5rem 0;
  border-bottom: 1px solid #1e1e1e;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.8rem;
  color: #666;
}

.order-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  padding: 0.5rem 0;
  border-bottom: 1px solid #1e1e1e;
}

.order-id {
  font-family: monospace;
}

.order-amount {
  color: #00a2ff;
}

.order-status {
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 1px;
}

.status-complete {
  color: #00ff41;
}

.status-pending {
  color: #ffbd2e;
}

.status-failed {
  color: #ff5f56;
}

.order-date {
  font-size: 0.8rem;
  color: #666;
}

.no-orders {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #666;
}

.no-orders i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

/* Error Terminal */
.error-terminal {
  padding: 2rem;
  border: 1px solid #ff5f56;
  background-color: rgba(255, 95, 86, 0.1);
}

.error-line {
  margin-bottom: 0.5rem;
  color: #ff5f56;
  font-family: monospace;
}

/* Animations */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

@keyframes load {
  0% { transform: scaleX(0); }
  50% { transform: scaleX(1); }
  100% { transform: scaleX(0); }
}

/* Responsive */
@media (max-width: 768px) {
  .grid-header, .order-row {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
  }
  
  .order-row span:nth-child(1) { order: 1; }
  .order-row span:nth-child(2) { order: 3; }
  .order-row span:nth-child(3) { order: 2; }
  .order-row span:nth-child(4) { order: 4; }
  
  .balance-amount {
    font-size: 2rem;
  }
  
  .modal-content {
    width: 95%;
    padding: 1rem;
  }
}
</style>