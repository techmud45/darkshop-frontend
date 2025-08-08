<template>
  <div class="products-page">
    <div class="scanline-background"></div>
    <h2 class="glitch" data-text="PRODUCTS">PRODUCTS</h2>

    <div v-if="loading" class="loading-pulse">
      <div class="pulse-dot"></div>
      <div class="pulse-dot"></div>
      <div class="pulse-dot"></div>
    </div>

    <div v-else>
      <!-- Search Container -->
      <div class="search-container cyber-input">
        <input
          v-model="search"
          placeholder="SEARCH PRODUCTS..."
          class="search-bar"
          @keyup.enter="searchProducts"
        />
        <i class="fas fa-search search-icon"></i>
        <div class="cyber-underline"></div>
      </div>

      <!-- Cart Summary -->
      <div v-if="itemsInCart > 0" class="cart-summary cyber-panel">
        <div class="cart-total">
          <span class="total-label">ITEMS:</span>
          <span class="total-value">{{ itemsInCart }}</span>
        </div>
        <div class="cart-total">
          <span class="total-label">TOTAL:</span>
          <span class="total-value">${{ cartTotal.toFixed(2) }}</span>
        </div>
        <button @click="proceedToCheckout" class="checkout-btn cyber-button">
          <i class="fas fa-lock"></i> CHECKOUT
        </button>
      </div>

      <div class="table-container scanlines">
        <table class="products-table">
          <thead>
            <tr class="cyber-header">
              <th class="icon-col">IMAGE</th>
              <th class="name-col">PRODUCT</th>
              <th class="price-col">PRICE</th>
              <th class="stock-col">STOCK</th>
              <th class="action-col">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="product in filteredProducts"
              :key="product._id"
              class="product-row cyber-row"
            >
              <td class="icon-cell">
                <i :class="`fas fa-${product.icon || 'box'}`"></i>
              </td>
              <td>
                <div class="product-info">
                  <h3 class="product-name">{{ product.name }}</h3>
                  <p class="product-desc">
                    {{ truncate(product.description, 50) }}
                    <button
                      v-if="product.description && product.description.length > 50"
                      @click.stop="openDescriptionModal(product)"
                      class="view-more-btn"
                      aria-label="View full description"
                    >
                      <i class="fas fa-expand-alt"></i>
                    </button>
                  </p>
                  <span class="product-id">ID: {{ product._id.slice(-6) }}</span>
                </div>
              </td>
              <td class="price-cell">${{ product.price.toFixed(2) }}</td>
              <td class="stock-cell" :class="{ 'low-stock': product.stockQty < 10 }">
                {{ product.stockQty }}
              </td>
              <td class="action-cell">
                <div class="professional-actions">
                  <div v-if="isInCart(product)" class="quantity-controls">
                    <button
                      @click.stop="decreaseQuantity(product)"
                      class="action-btn quantity-btn"
                      :disabled="getCartItem(product).quantity <= 1"
                      aria-label="Decrease quantity"
                    >
                      <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-display">
                      {{ getCartItem(product).quantity }}
                    </span>
                    <button
                      @click.stop="increaseQuantity(product)"
                      class="action-btn quantity-btn"
                      :disabled="getCartItem(product).quantity >= product.stockQty"
                      aria-label="Increase quantity"
                    >
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                  <button
                    @click.stop="toggleCart(product)"
                    class="action-btn main-action"
                    :class="{ 'in-cart': isInCart(product) }"
                    aria-label="Add to cart"
                  >
                    <i class="fas" :class="isInCart(product) ? 'fa-check' : 'fa-cart-plus'"></i>
                    <span>{{ isInCart(product) ? 'Added' : 'Add' }}</span>
                  </button>
                  <button
                    v-if="isInCart(product)"
                    @click.stop="removeFromCart(product)"
                    class="action-btn remove-btn"
                    aria-label="Remove item"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Description Modal -->
    <div v-if="modalProduct" class="description-modal" @click.self="closeDescriptionModal">
      <div class="modal-content cyber-panel">
        <div class="modal-header">
          <h3>{{ modalProduct.name }}</h3>
          <button @click="closeDescriptionModal" class="modal-close" aria-label="Close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>{{ modalProduct.description }}</p>
        </div>
        <div class="modal-footer">
          <span class="product-id">ID: {{ modalProduct._id.slice(-6) }}</span>
          <button @click="closeDescriptionModal" class="cyber-button">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import axios from '../axios';
  import { useCartStore } from '../stores/cart';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const products = ref([]);
  const loading = ref(true);
  const search = ref('');
  const cart = useCartStore();
  const selectedProduct = ref(null); // ✅ properly initialized as ref(null)
  const modalProduct = computed(() => selectedProduct.value || null);

  const itemsInCart = computed(() => cart.items.reduce((total, item) => total + item.quantity, 0));

  const cartTotal = computed(() => cart.total);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/products'); // <-- fixed: remove extra /api
      products.value = res.data;
    } catch (err) {
      console.error('PRODUCT LOAD FAILURE:', err);
    } finally {
      loading.value = false;
    }
  };

  onMounted(fetchProducts);

  const filteredProducts = computed(() => {
    return products.value.filter(
      (p) =>
        p.name.toLowerCase().includes(search.value.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(search.value.toLowerCase()))
    );
  });

  const truncate = (text, length) => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  const isInCart = (product) => {
    return cart.items.some((i) => i.product._id === product._id);
  };

  const getCartItem = (product) => {
    return (
      cart.items.find((i) => i.product._id === product._id) || {
        quantity: 0,
      }
    );
  };

  const toggleCart = (product) => {
    if (isInCart(product)) {
      cart.removeItem(product._id);
    } else {
      cart.addItem(product);
    }
  };

  const increaseQuantity = (product) => {
    const currentQty = getCartItem(product).quantity;
    cart.updateQty(product._id, currentQty + 1);
  };

  const decreaseQuantity = (product) => {
    const currentQty = getCartItem(product).quantity;
    cart.updateQty(product._id, currentQty - 1);
  };

  const removeFromCart = (product) => {
    cart.removeItem(product._id);
  };

  const proceedToCheckout = () => {
    router.push('/checkout');
  };

  const openDescriptionModal = (product) => {
    selectedProduct.value = product;
  };

  const closeDescriptionModal = () => {
    console.log('MODAL CLOSE');
    selectedProduct.value = null;
  };
</script>

<style scoped>
  /* === BASE STYLES === */
  .products-page {
    padding: 0px !important;
    background: #0b0c10;
    min-height: 100vh;
    font-family: 'Courier New', monospace;
    color: #c5c6c7;
    overflow-x: hidden;
  }

  /* === GLITCH EFFECT === */
  .glitch {
    position: relative;
    color: #66fcf1;
    font-size: 3rem;
    text-transform: uppercase;
    letter-spacing: 3px;
    text-align: center;
    margin-bottom: 2rem;
  }

  .glitch::before,
  .glitch::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .glitch::before {
    left: 2px;
    text-shadow: -2px 0 #ff00ff;
    clip: rect(44px, 450px, 56px, 0);
    animation: glitch-anim 5s infinite linear alternate-reverse;
  }

  .glitch::after {
    left: -2px;
    text-shadow: -2px 0 #00ffff;
    clip: rect(44px, 450px, 56px, 0);
    animation: glitch-anim2 5s infinite linear alternate-reverse;
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

  /* === LOADING ANIMATION === */
  .loading-pulse {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin: 3rem 0;
  }

  .pulse-dot {
    width: 15px;
    height: 15px;
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

  /* === SEARCH CONTAINER === */
  .search-container {
    position: relative;
    max-width: 600px;
    margin: 0 auto 3rem;
    padding: 0.5rem;
    background: rgba(15, 20, 25, 0.7);
    border: 1px solid #45a29e;
    box-shadow: 0 0 15px rgba(69, 162, 158, 0.3);
    border-radius: 2px;
  }

  .cyber-input {
    position: relative;
    overflow: hidden;
  }

  .search-bar {
    width: 100%;
    padding: 0.8rem 1rem 0.8rem 2.5rem;
    background: rgba(31, 40, 51, 0.5);
    border: none;
    color: #66fcf1;
    font-family: 'Courier New', monospace;
    font-size: 1rem;
    outline: none;
  }

  .search-bar::placeholder {
    color: #45a29e;
    opacity: 0.7;
  }

  .search-icon {
    position: absolute;
    left: 1.5rem;
    top: 50%;
    transform: translateY(-50%);
    color: #66fcf1;
    z-index: 2;
  }

  .cyber-underline {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, #66fcf1, #45a29e, #66fcf1);
    background-size: 200% 100%;
    animation: scanline 2s linear infinite;
  }

  @keyframes scanline {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  /* === CART SUMMARY === */
  .cart-summary {
    background: rgba(31, 40, 51, 0.8);
    border: 1px solid #45a29e;
    padding: 1rem;
    margin: 1rem 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    box-shadow: 0 0 10px rgba(69, 162, 158, 0.3);
  }

  .cyber-panel {
    position: relative;
    overflow: hidden;
  }

  .cyber-panel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, transparent, rgba(102, 252, 241, 0.05), transparent);
    z-index: 0;
  }

  .cart-total {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'Courier New', monospace;
  }

  .total-label {
    color: #c5c6c7;
    font-size: 0.9rem;
  }

  .total-value {
    color: #66fcf1;
    font-weight: bold;
    font-size: 1.1rem;
  }

  .checkout-btn {
    background: linear-gradient(135deg, #45a29e 0%, #1f2833 100%);
    color: #0b0c10;
    border: none;
    padding: 0.7rem 1.5rem;
    cursor: pointer;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: relative;
    overflow: hidden;
    border: 1px solid #66fcf1;
    text-transform: uppercase;
    font-size: 0.9rem;
  }

  .checkout-btn:hover {
    background: linear-gradient(135deg, #66fcf1 0%, #1f2833 100%);
    box-shadow: 0 0 15px rgba(102, 252, 241, 0.5);
  }

  .checkout-btn i {
    transition: transform 0.3s ease;
  }

  .checkout-btn:hover i {
    transform: scale(1.2);
  }

  /* === PRODUCTS TABLE === */
  .table-container {
    width: 100% !important;
    background: rgba(31, 40, 51, 0.8);
    border: 1px solid #45a29e;
    margin-top: 1rem;
    overflow-x: auto;
    position: relative;
  }

  .products-table {
    width: 100%;
    border-collapse: collapse;
    color: #c5c6c7;
    position: relative;
  }

  /* Table Header */
  .cyber-header th {
    background: #121212;
    color: #66fcf1;
    text-shadow: none;
    padding: 1rem;
    text-align: left;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 1px;
    border-bottom: 2px solid #45a29e;
  }

  /* Table Rows */
  .cyber-row {
    transition: all 0.3s ease;
    border-bottom: 1px solid rgba(69, 162, 158, 0.2);
  }

  .cyber-row:hover {
    background: rgba(102, 252, 241, 0.05) !important;
    box-shadow: 0 0 10px rgba(102, 252, 241, 0.2);
  }

  /* Table Cells */
  .icon-cell {
    text-align: center;
    font-size: 1.5rem;
    color: #66fcf1;
    padding: 1rem;
  }

  .price-cell {
    font-weight: bold;
    color: #66fcf1;
    padding: 1rem;
  }

  .stock-cell {
    font-family: 'Courier New', monospace;
    padding: 1rem;
  }

  .low-stock {
    color: #ff5555;
  }

  .action-cell {
    padding: 1rem;
  }

  /* Product Info */
  .product-info {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .product-name {
    color: #fff;
    margin: 0;
    font-size: 1rem;
  }

  .product-desc {
    position: relative;
    display: inline;
    color: #c5c6c7;
    font-size: 0.8rem;
    margin: 0;
    line-height: 1.4;
  }

  .view-more-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-left: 4px;
    background: transparent;
    border: none;
    color: #66fcf1;
    cursor: pointer;
    width: 16px;
    height: 16px;
    font-size: 0.7rem;
    opacity: 0.7;
    transition: all 0.2s ease;
    border-radius: 2px;
  }

  .view-more-btn:hover {
    opacity: 1;
    color: #45a29e;
    transform: scale(1.1);
  }

  .product-id {
    font-size: 0.7rem;
    color: #66fcf1;
    opacity: 0.7;
  }

  /* === PROFESSIONAL ACTION CONTROLS === */
  .professional-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .action-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: rgba(102, 252, 241, 0.1);
    color: #66fcf1;
    font-size: 0.9rem;
  }

  .action-btn:hover:not(:disabled) {
    background: rgba(102, 252, 241, 0.3);
    transform: translateY(-1px);
  }

  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .main-action {
    width: auto;
    padding: 0 0.8rem;
    gap: 0.5rem;
    background: rgba(102, 252, 241, 0.2);
    border: 1px solid #66fcf1;
  }

  .main-action.in-cart {
    background: rgba(0, 255, 0, 0.15);
    border-color: #0f0;
    color: #0f0;
  }

  .quantity-controls {
    display: flex;
    align-items: center;
    background: rgba(31, 40, 51, 0.5);
    border-radius: 4px;
    border: 1px solid rgba(69, 162, 158, 0.5);
  }

  .quantity-display {
    min-width: 24px;
    text-align: center;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    color: #66fcf1;
  }

  .remove-btn {
    background: rgba(255, 85, 85, 0.1);
    color: #ff5555;
    border: 1px solid rgba(255, 85, 85, 0.5);
  }

  .remove-btn:hover {
    background: rgba(255, 85, 85, 0.2);
  }

  /* === DESCRIPTION MODAL === */
  .description-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(11, 12, 16, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal-content {
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    background: #1f2833;
    border: 1px solid #45a29e;
    box-shadow: 0 0 30px rgba(102, 252, 241, 0.2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal-header {
    padding: 1rem 1.5rem;
    background: rgba(31, 40, 51, 0.8);
    border-bottom: 1px solid #45a29e;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-header h3 {
    color: #66fcf1;
    margin: 0;
    font-size: 1.2rem;
  }

  .modal-close {
    background: transparent;
    border: none;
    color: #c5c6c7;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .modal-close:hover {
    color: #ff5555;
    transform: rotate(90deg);
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    flex-grow: 1;
    line-height: 1.6;
  }

  .modal-body p {
    white-space: pre-line;
  }

  .modal-footer {
    padding: 1rem 1.5rem;
    background: rgba(31, 40, 51, 0.8);
    border-top: 1px solid #45a29e;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-footer .product-id {
    font-size: 0.8rem;
    color: #66fcf1;
    opacity: 0.7;
  }

  /* === MOBILE RESPONSIVE STYLES === */
  @media (max-width: 768px) {
    .products-page {
      padding: 0 10px !important;
    }

    .glitch {
      font-size: 2rem;
      margin-bottom: 1.5rem;
    }

    .search-container {
      margin: 0 auto 1.5rem;
      width: 100%;
      box-sizing: border-box;
    }

    .search-bar {
      padding: 0.6rem 1rem 0.6rem 2.2rem;
      font-size: 0.9rem;
      box-sizing: border-box;
    }

    .cart-summary {
      flex-direction: column;
      align-items: stretch;
      gap: 0.8rem;
      padding: 0.8rem;
      margin: 0.5rem 0 1.5rem;
    }

    .cart-total {
      justify-content: space-between;
    }

    .checkout-btn {
      width: 100%;
      justify-content: center;
      padding: 0.6rem;
    }

    .table-container {
      border: none;
      background: transparent;
      margin-top: 0;
    }

    .products-table {
      display: block;
      width: 100%;
    }

    .cyber-header {
      display: none;
    }

    .product-row {
      display: flex;
      flex-direction: column;
      padding: 1rem;
      margin-bottom: 1rem;
      background: rgba(31, 40, 51, 0.8);
      border: 1px solid #45a29e;
      border-radius: 4px;
      box-sizing: border-box;
    }

    .icon-cell,
    .price-cell,
    .stock-cell,
    .action-cell {
      padding: 0.3rem 0;
      width: 100%;
      display: flex;
      align-items: center;
    }

    .icon-cell {
      justify-content: center;
      font-size: 1.8rem;
      padding: 0.5rem 0;
    }

    .product-info {
      margin-bottom: 0.5rem;
    }

    .product-name {
      font-size: 1.1rem;
    }

    .product-desc {
      font-size: 0.85rem;
    }

    .price-cell,
    .stock-cell {
      justify-content: space-between;
      border-top: 1px solid rgba(69, 162, 158, 0.3);
      padding: 0.5rem 0;
    }

    .price-cell::before {
      content: 'PRICE:';
      color: #66fcf1;
      font-weight: normal;
    }

    .stock-cell::before {
      content: 'STOCK:';
      color: #66fcf1;
      font-weight: normal;
    }

    .action-cell {
      border-top: 1px solid rgba(69, 162, 158, 0.3);
      padding: 0.5rem 0 0;
      margin-top: 0.5rem;
    }

    .professional-actions {
      flex-direction: row;
      justify-content: space-between;
      width: 100%;
    }

    .quantity-controls {
      order: 1;
      margin-right: auto;
    }

    .main-action {
      order: 2;
      width: auto;
      flex-grow: 1;
      margin: 0 0.5rem;
      justify-content: center;
    }

    .remove-btn {
      order: 3;
      width: auto;
    }

    /* Modal adjustments */
    .modal-content {
      width: 95%;
      max-height: 85vh;
    }

    .modal-header h3 {
      font-size: 1.1rem;
    }
  }

  /* Very small devices (phones, 480px and down) */
  @media (max-width: 480px) {
    .glitch {
      font-size: 1.8rem;
    }

    .search-bar {
      font-size: 0.85rem;
    }

    .professional-actions {
      flex-wrap: wrap;
    }

    .main-action {
      order: 1;
      width: 100%;
      margin: 0.3rem 0;
    }

    .quantity-controls {
      order: 2;
      width: 100%;
      justify-content: center;
      margin: 0.3rem 0;
    }

    .remove-btn {
      order: 3;
      width: 100%;
      margin: 0.3rem 0;
    }
  }

  /* Column widths */
  .icon-col {
    width: 60px;
  }
  .name-col {
    width: 40%;
  }
  .price-col {
    width: 100px;
  }
  .stock-col {
    width: 80px;
  }
  .action-col {
    width: 150px;
  }
</style>
