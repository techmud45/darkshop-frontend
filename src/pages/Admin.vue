<template>
  <div class="admin-dashboard">
    <div class="scanline-overlay"></div>
    <h2 class="glitch" data-text="ADMIN PANEL"><i class="fas fa-user-shield"></i> ADMIN PANEL</h2>
    <div class="cyber-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        <i :class="tab.icon"></i> {{ tab.label }}
      </button>
    </div>

    <!-- ORDERS TAB -->
    <section v-if="activeTab === 'orders'" class="cyber-panel fade-in">
      <h3 class="section-title"><i class="fas fa-clipboard-list"></i> ORDER MANAGEMENT</h3>
      <div v-if="loadingOrders" class="loading-indicator">
        <div class="pulse-dot"></div>
        <div class="pulse-dot"></div>
        <div class="pulse-dot"></div>
      </div>
      <div v-else>
        <div v-if="orders.length === 0" class="empty-state">
          <i class="fas fa-box-open"></i>
          <p>No orders found</p>
        </div>
        <div v-else class="table-responsive">
          <table class="cyber-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>USER</th>
                <th>TOTAL</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order._id">
                <td>{{ order._id.slice(-6) }}</td>
                <td>{{ order.userId?.username || 'GUEST' }}</td>
                <td>${{ order.totalAmount.toFixed(2) }}</td>
                <td>
                  <select v-model="order.status" class="status-select">
                    <option>PENDING</option>
                    <option>PAID</option>
                    <option>FAILED</option>
                  </select>
                </td>
                <td>
                  <button @click="updateOrderStatus(order)" class="cyber-btn">
                    <i class="fas fa-save"></i> Update
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- PRODUCTS TAB -->
    <section v-else-if="activeTab === 'products'" class="cyber-panel fade-in">
      <h3 class="section-title"><i class="fas fa-boxes"></i> PRODUCT MANAGEMENT</h3>
      <div v-if="loadingProducts" class="loading-indicator">
        <div class="pulse-dot"></div>
        <div class="pulse-dot"></div>
        <div class="pulse-dot"></div>
      </div>
      <div v-else>
        <div v-if="products.length === 0" class="empty-state">
          <i class="fas fa-cubes"></i>
          <p>No products found</p>
        </div>
        <div v-else class="table-responsive">
          <table class="cyber-table">
            <thead>
              <tr>
                <th>ICON</th>
                <th>NAME</th>
                <th>CATEGORY</th>
                <th>PRICE</th>
                <th>STOCK</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="prod in products" :key="prod._id">
                <td><i :class="`fas fa-${prod.icon}`"></i></td>
                <td>{{ prod.name }}</td>
                <td>{{ prod.category }}</td>
                <td>${{ prod.price.toFixed(2) }}</td>
                <td>{{ prod.stockQty }}</td>
                <td>
                  <button @click="editProduct(prod)" class="cyber-btn secondary">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="deleteProduct(prod)" class="cyber-btn danger">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button @click="showAddModal = true" class="cyber-btn neon">
          <i class="fas fa-plus"></i> Add Product
        </button>
      </div>
      <!-- Product Modal -->
      <div v-if="showAddModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content cyber-panel">
          <h4 class="modal-title">
            <i :class="editMode ? 'fas fa-edit' : 'fas fa-plus-circle'"></i>
            {{ editMode ? 'EDIT PRODUCT' : 'ADD PRODUCT' }}
          </h4>
          <div class="modal-body">
            <div class="form-group">
              <label>ICON</label>
              <input
                v-model="productForm.icon"
                class="cyber-input"
                placeholder="FontAwesome icon (e.g. box, laptop)"
              />
            </div>
            <div class="form-group">
              <label>NAME *</label>
              <input v-model="productForm.name" class="cyber-input" placeholder="Product name" />
            </div>
            <div class="form-group">
              <label>CATEGORY *</label>
              <input v-model="productForm.category" class="cyber-input" placeholder="Category" />
            </div>
            <div class="form-group">
              <label>PRICE *</label>
              <input
                v-model.number="productForm.price"
                class="cyber-input"
                type="number"
                step="0.01"
              />
            </div>
            <div class="form-group">
              <label>STOCK *</label>
              <input v-model.number="productForm.stockQty" class="cyber-input" type="number" />
            </div>
            <div class="form-group">
              <label>DESCRIPTION</label>
              <textarea v-model="productForm.description" class="cyber-input"></textarea>
            </div>
          </div>
          <div class="modal-actions">
            <button @click="closeModal" class="cyber-btn">Cancel</button>
            <button @click="saveProduct" class="cyber-btn neon">
              {{ editMode ? 'Save' : 'Add' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- CRYPTO TAB -->
    <section v-else class="cyber-panel fade-in">
      <h3 class="section-title"><i class="fas fa-coins"></i> CRYPTO ADDRESS MANAGEMENT</h3>
      <div v-if="loadingCrypto" class="loading-indicator">
        <div class="pulse-dot"></div>
        <div class="pulse-dot"></div>
        <div class="pulse-dot"></div>
      </div>
      <div v-else>
        <div v-if="cryptoAddresses.length === 0" class="empty-state">
          <i class="fas fa-wallet"></i>
          <p>No crypto addresses found</p>
        </div>
        <div v-else class="table-responsive">
          <table class="cyber-table">
            <thead>
              <tr>
                <th>CURRENCY</th>
                <th>ADDRESS</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="address in cryptoAddresses" :key="address._id">
                <td>{{ address.currency }}</td>
                <td class="font-monospace">{{ address.address }}</td>
                <td>
                  <span :class="{ active: address.isActive, inactive: !address.isActive }">
                    {{ address.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <button
                    @click="toggleAddressStatus(address)"
                    class="cyber-btn"
                    :class="address.isActive ? '' : 'secondary'"
                  >
                    <i :class="address.isActive ? 'fas fa-toggle-on' : 'fas fa-toggle-off'"></i>
                  </button>
                  <button @click="copyToClipboard(address.address)" class="cyber-btn">
                    <i class="fas fa-copy"></i>
                  </button>
                  <button @click="confirmDelete(address)" class="cyber-btn danger">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button @click="showCryptoModal = true" class="cyber-btn neon">
          <i class="fas fa-plus"></i> Add Address
        </button>
      </div>
      <!-- Add Crypto Modal -->
      <div v-if="showCryptoModal" class="modal-overlay" @click.self="showCryptoModal = false">
        <div class="modal-content cyber-panel">
          <h4 class="modal-title"><i class="fas fa-plus-circle"></i> Add Crypto Address</h4>
          <div class="modal-body">
            <div class="form-group">
              <label>CURRENCY</label>
              <select v-model="newAddress.currency" class="cyber-input">
                <option value="">Select currency</option>
                <option value="BTC">Bitcoin</option>
                <option value="ETH">Ethereum</option>
                <option value="USDT">Tether</option>
                <option value="LTC">Litecoin</option>
              </select>
            </div>
            <div class="form-group">
              <label>ADDRESS</label>
              <input
                v-model="newAddress.address"
                class="cyber-input"
                placeholder="Wallet address"
              />
            </div>
            <div class="form-group">
              <label>PRIVATE KEY (optional)</label>
              <input
                v-model="newAddress.privateKey"
                class="cyber-input"
                placeholder="Encrypted key"
                type="password"
              />
            </div>
          </div>
          <div class="modal-actions">
            <button @click="showCryptoModal = false" class="cyber-btn">Cancel</button>
            <button @click="handleAddAddress" class="cyber-btn neon">Save</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import axios from '@/axios';
  import { useToast } from 'vue-toast-notification';
  import 'vue-toast-notification/dist/theme-sugar.css';
  const toast = useToast();

  // Tab setup
  const tabs = [
    { value: 'orders', label: 'Orders', icon: 'fas fa-clipboard-list' },
    { value: 'products', label: 'Products', icon: 'fas fa-boxes' },
    { value: 'crypto', label: 'Crypto', icon: 'fas fa-coins' },
  ];
  const activeTab = ref('orders');

  // Orders
  const orders = ref([]);
  const loadingOrders = ref(true);
  const fetchOrders = async () => {
    loadingOrders.value = true;
    try {
      orders.value = (await axios.get('/orders')).data;
    } catch (e) {
      toast.error('Failed to load orders');
    }
    loadingOrders.value = false;
  };
  const updateOrderStatus = async (order) => {
    try {
      await axios.patch(`/orders/${order._id}`, { status: order.status });
      toast.success('Order status updated!');
    } catch (e) {
      toast.error('Error updating order');
    }
  };

  // Products
  const products = ref([]);
  const loadingProducts = ref(true);
  const showAddModal = ref(false);
  const editMode = ref(false);
  const productForm = ref({
    icon: '',
    name: '',
    category: '',
    price: 0,
    stockQty: 0,
    description: '',
  });
  let editingId = null;
  const fetchProducts = async () => {
    loadingProducts.value = true;
    try {
      products.value = (await axios.get('/products')).data;
    } catch (e) {
      toast.error('Failed to load products');
    }
    loadingProducts.value = false;
  };
  const editProduct = (prod) => {
    editingId = prod._id;
    editMode.value = true;
    productForm.value = { ...prod };
    showAddModal.value = true;
  };
  const deleteProduct = async (prod) => {
    if (confirm('Delete this product?')) {
      try {
        await axios.delete(`/products/${prod._id}`);
        fetchProducts();
        toast.success('Deleted');
      } catch (e) {
        toast.error('Failed to delete');
      }
    }
  };
  const saveProduct = async () => {
    try {
      if (editMode.value) {
        await axios.patch(`/products/${editingId}`, productForm.value);
        toast.success('Product updated!');
      } else {
        await axios.post('/products', productForm.value);
        toast.success('Product added!');
      }
      showAddModal.value = false;
      fetchProducts();
      editMode.value = false;
      editingId = null;
      productForm.value = {
        icon: '',
        name: '',
        category: '',
        price: 0,
        stockQty: 0,
        description: '',
      };
    } catch (e) {
      toast.error('Save failed');
    }
  };
  const closeModal = () => {
    showAddModal.value = false;
    editMode.value = false;
    editingId = null;
    productForm.value = {
      icon: '',
      name: '',
      category: '',
      price: 0,
      stockQty: 0,
      description: '',
    };
  };

  // Crypto
  const cryptoAddresses = ref([]);
  const loadingCrypto = ref(true);
  const showCryptoModal = ref(false);
  const newAddress = ref({ currency: '', address: '', privateKey: '' });
  const fetchCryptoAddresses = async () => {
    loadingCrypto.value = true;
    try {
      cryptoAddresses.value = (await axios.get('/crypto-addresses')).data;
    } catch (e) {
      toast.error('Failed to load addresses');
    }
    loadingCrypto.value = false;
  };
  const handleAddAddress = async () => {
    try {
      const res = await axios.post('/crypto-addresses', newAddress.value);
      cryptoAddresses.value.unshift(res.data);
      showCryptoModal.value = false;
      newAddress.value = { currency: '', address: '', privateKey: '' };
      toast.success('Address added');
    } catch (e) {
      toast.error('Failed to add address');
    }
  };
  const toggleAddressStatus = async (address) => {
    try {
      await axios.put(`/crypto-addresses/${address._id}/status`, { isActive: !address.isActive });
      address.isActive = !address.isActive;
      toast.success('Status updated');
    } catch (e) {
      toast.error('Update failed');
    }
  };
  const confirmDelete = (address) => {
    if (confirm('Delete this address?')) deleteAddress(address);
  };
  const deleteAddress = async (address) => {
    try {
      await axios.delete(`/crypto-addresses/${address._id}`);
      fetchCryptoAddresses();
      toast.success('Deleted');
    } catch (e) {
      toast.error('Delete failed');
    }
  };
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  onMounted(() => {
    fetchOrders();
    fetchProducts();
    fetchCryptoAddresses();
  });
</script>

<style scoped>
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css');
  /* Background scanline */
  .scanline-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 255, 255, 0.05),
      rgba(0, 255, 255, 0.05) 1px,
      transparent 1px,
      transparent 2px
    );
    pointer-events: none;
    z-index: 0;
  }
  /* Glitch neon heading */
  .glitch {
    position: relative;
    color: #66fcf1;
    font-size: 2.3rem;
    text-align: center;
    margin: 1.1rem 0 2rem;
    text-transform: uppercase;
    letter-spacing: 3px;
  }
  .glitch:before,
  .glitch:after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.4;
    pointer-events: none;
  }
  .glitch:before {
    left: 2px;
    text-shadow: -2px 0 #ff00ff;
    animation: glitch-anim 2s infinite linear alternate-reverse;
  }
  .glitch:after {
    left: -2px;
    text-shadow: -2px 0 #00ffff;
    animation: glitch-anim2 1.5s infinite linear alternate-reverse;
  }
  @keyframes glitch-anim {
    0% {
      clip: rect(31px, 9999px, 94px, 0);
    }
    20% {
      clip: rect(112px, 9999px, 76px, 0);
    }
    40% {
      clip: rect(75px, 9999px, 107px, 0);
    }
    60% {
      clip: rect(42px, 9999px, 130px, 0);
    }
    80% {
      clip: rect(84px, 9999px, 106px, 0);
    }
    100% {
      clip: rect(58px, 9999px, 129px, 0);
    }
  }
  @keyframes glitch-anim2 {
    0% {
      clip: rect(65px, 9999px, 119px, 0);
    }
    20% {
      clip: rect(25px, 9999px, 145px, 0);
    }
    40% {
      clip: rect(110px, 9999px, 83px, 0);
    }
    60% {
      clip: rect(109px, 9999px, 52px, 0);
    }
    80% {
      clip: rect(20px, 9999px, 78px, 0);
    }
    100% {
      clip: rect(68px, 9999px, 109px, 0);
    }
  }
  /* Tabs */
  .cyber-tabs {
    display: flex;
    margin-bottom: 2rem;
    background: rgba(15, 20, 25, 0.9);
    border-radius: 4px 4px 0 0;
    border-bottom: 1.5px solid #45a29e;
    overflow-x: auto;
    gap: 2px;
  }
  .cyber-tabs button {
    background: none;
    color: #c5c6c7;
    border: none;
    padding: 1rem 2.2rem;
    font-family: inherit;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    font-size: 1.05rem;
    font-weight: bold;
    transition:
      background 0.2s,
      color 0.2s;
    position: relative;
    outline: none;
    border-right: 1px solid #2a5e60;
    display: flex;
    align-items: center;
    gap: 9px;
  }
  .cyber-tabs button.active,
  .cyber-tabs button:hover {
    color: #66fcf1;
    background: rgba(102, 252, 241, 0.11);
  }
  .cyber-tabs button.active:after {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 3px;
    background: #66fcf1;
    box-shadow: 0 0 12px #66fcf1aa;
  }
  .cyber-tabs button:last-child {
    border-right: none;
  }

  @media (max-width: 700px) {
    .cyber-tabs button {
      font-size: 0.93rem;
      padding: 0.8rem 1.1rem;
    }
  }

  /* Card Panel */
  .cyber-panel {
    background: rgba(10, 17, 22, 0.91);
    border: 1.5px solid #45a29e;
    border-radius: 5px;
    padding: 1.4rem 1rem;
    margin-bottom: 2.5rem;
    box-shadow: 0 0 25px #66fcf12a;
    position: relative;
    overflow-x: auto;
  }

  /* Table + responsive design */
  .table-responsive {
    overflow-x: auto;
  }
  .cyber-table {
    width: 100%;
    min-width: 650px;
    border-collapse: collapse;
    font-size: 0.97rem;
    margin-bottom: 1rem;
    background: transparent;
  }
  .cyber-table th,
  .cyber-table td {
    padding: 1rem 0.7rem;
    text-align: left;
    border-bottom: 1px solid #1f2833;
    vertical-align: middle;
  }
  .cyber-table th {
    color: #66fcf1;
    background: #132029;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-top: 2px solid #45a29e;
  }
  .cyber-table tr {
    transition: background 0.18s;
  }
  .cyber-table tr:hover {
    background: rgba(102, 252, 241, 0.04);
  }
  .status-select {
    background: #1f2833;
    color: #c5c6c7;
    border: 1px solid #45a29e;
    padding: 0.35rem 0.7rem;
    font-size: 0.95rem;
    border-radius: 3px;
    font-family: inherit;
    outline: none;
  }

  @media (max-width: 900px) {
    .cyber-table,
    .cyber-table thead,
    .cyber-table tbody,
    .cyber-table th,
    .cyber-table td,
    .cyber-table tr {
      display: block;
      width: 100%;
    }
    .cyber-table thead {
      display: none;
    }
    .cyber-table tr {
      margin-bottom: 1.3rem;
      background: rgba(69, 162, 158, 0.03);
      border-radius: 7px;
      box-shadow: 0 0 10px #45a29e1a;
      padding: 0.6rem 0;
    }
    .cyber-table td {
      padding: 0.7rem 1rem;
      text-align: left;
      position: relative;
      border: none;
      font-size: 1.01rem;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #1f2833;
    }
    .cyber-table td:before {
      content: attr(data-label);
      color: #66fcf1;
      font-size: 0.95rem;
      font-weight: bold;
      text-transform: uppercase;
      margin-right: 12px;
      min-width: 110px;
      display: inline-block;
    }
  }

  /* Buttons and states */
  .cyber-btn {
    padding: 0.65rem 1.2rem;
    border-radius: 3px;
    border: none;
    font-weight: bold;
    text-transform: uppercase;
    font-size: 0.9rem;
    letter-spacing: 1px;
    cursor: pointer;
    outline: none;
    color: #66fcf1;
    background: rgba(102, 252, 241, 0.09);
    margin: 0 0.1rem 0.1rem 0;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    box-shadow: 0 0 8px #45a29e17;
    transition:
      background 0.18s,
      color 0.18s;
  }
  .cyber-btn.neon {
    background: rgba(102, 252, 241, 0.21);
    color: #0a0a12;
    border: 1.2px solid #66fcf1;
  }
  .cyber-btn.neon:hover {
    background: #66fcf1;
    color: #222;
  }
  .cyber-btn.danger {
    background: #2d0000;
    color: #ff5a5a;
  }
  .cyber-btn.secondary {
    background: #232939;
    color: #ffc107;
  }
  .cyber-btn:hover,
  .cyber-btn:focus {
    background: #132029;
    color: #fff;
  }
  .cyber-btn i {
    font-size: 1rem;
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.89);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100;
    backdrop-filter: blur(7px);
    padding: 1rem;
  }
  .modal-content {
    background: #1a1a1a;
    border: 1.8px solid #66fcf1;
    border-radius: 7px;
    width: 100%;
    max-width: 440px;
    padding: 2rem 1rem 1.1rem 1rem;
    box-shadow: 0 0 20px #66fcf150;
    position: relative;
  }
  .modal-title {
    color: #66fcf1;
    margin: 0 0 1rem 0;
    font-size: 1.08rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .modal-body {
    margin-bottom: 1.2rem;
  }
  .form-group {
    margin-bottom: 1.2rem;
  }
  .form-group label {
    color: #66fcf1;
    text-transform: uppercase;
    font-size: 0.92rem;
    margin-bottom: 0.3rem;
    display: block;
    letter-spacing: 1px;
  }
  .cyber-input,
  select.cyber-input,
  textarea.cyber-input {
    width: 100%;
    padding: 0.7rem;
    background: #232939;
    color: #c5c6c7;
    border: 1.2px solid #45a29e;
    border-radius: 3px;
    font-family: inherit;
    font-size: 1rem;
    transition: border 0.18s;
    margin-top: 0.12rem;
  }
  .cyber-input:focus {
    border-color: #66fcf1;
    outline: none;
    box-shadow: 0 0 7px #66fcf170;
  }
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 0.7rem;
  }
  .font-monospace {
    font-family: monospace;
  }
  .section-title {
    color: #66fcf1;
    margin-bottom: 1rem;
    font-size: 1.2rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid #45a29e;
    padding-bottom: 0.5rem;
  }
  .loading-indicator {
    display: flex;
    justify-content: center;
    gap: 0.8rem;
    padding: 2rem 0;
  }
  .pulse-dot {
    width: 13px;
    height: 13px;
    background: #66fcf1;
    border-radius: 50%;
    animation: pulse 1.5s infinite ease-in-out;
  }
  .pulse-dot:nth-child(2) {
    animation-delay: 0.2s;
  }
  .pulse-dot:nth-child(3) {
    animation-delay: 0.4s;
  }
  @keyframes pulse {
    0%,
    100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
  }
  .empty-state {
    text-align: center;
    padding: 2rem 0;
    color: #45a29e;
  }
  .empty-state i {
    font-size: 2.2rem;
    margin-bottom: 1rem;
  }
  .empty-state p {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  span.active {
    color: #4caf50;
    font-weight: bold;
  }
  span.inactive {
    color: #f44336;
    font-weight: bold;
  }

  @media (max-width: 650px) {
    .admin-dashboard,
    .cyber-panel {
      padding: 0.5rem !important;
    }
    .modal-content {
      padding: 1rem 0.2rem !important;
    }
    .glitch {
      font-size: 1.18rem;
    }
    .cyber-table th,
    .cyber-table td {
      font-size: 0.97rem;
    }
  }
</style>
