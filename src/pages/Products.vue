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

          <!-- Rows -->
          <tbody v-if="filteredProducts.length">
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

              <td class="price-cell">
                ${{ formatPrice(product.price) }}
              </td>

              <td class="stock-cell" :class="{ 'low-stock': Number(product.stockQty) < 10 }">
                {{ Number(product.stockQty) || 0 }}
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
                      :disabled="getCartItem(product).quantity >= Number(product.stockQty)"
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

          <!-- Empty state -->
          <tbody v-else>
            <tr>
              <td colspan="5" style="text-align:center; padding:1rem;">No products found.</td>
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
import axios from '../axios'; // <- your single axios instance (src/axios.js)
import { useCartStore } from '../stores/cart';
import { useRouter } from 'vue-router';

const router = useRouter();
const products = ref([]);
const loading = ref(true);
const search = ref('');
const cart = useCartStore();
const selectedProduct = ref(null);
const modalProduct = computed(() => selectedProduct.value || null);

const itemsInCart = computed(() =>
  cart.items.reduce((total, item) => total + item.quantity, 0)
);
const cartTotal = computed(() => cart.total);

// ---- helpers
const formatPrice = (p) => {
  const n = Number(p);
  return Number.isFinite(n) ? n.toFixed(2) : '0.00';
};

const truncate = (text, length) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

// ---- data load
const fetchProducts = async () => {
  try {
    const res = await axios.get('/products');
    products.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error('PRODUCT LOAD FAILURE:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchProducts);

// ---- search (enter key no-op; filtering handled by computed)
const searchProducts = () => {};

// ---- computed + cart ops
const filteredProducts = computed(() => {
  const q = search.value.toLowerCase();
  return products.value.filter(
    (p) =>
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
  );
});

const isInCart = (product) => cart.items.some((i) => i.product._id === product._id);

const getCartItem = (product) =>
  cart.items.find((i) => i.product._id === product._id) || { quantity: 0 };

const toggleCart = (product) => {
  if (isInCart(product)) cart.removeItem(product._id);
  else cart.addItem(product);
};

const increaseQuantity = (product) => {
  const currentQty = getCartItem(product).quantity;
  cart.updateQty(product._id, currentQty + 1);
};

const decreaseQuantity = (product) => {
  const currentQty = getCartItem(product).quantity;
  cart.updateQty(product._id, Math.max(1, currentQty - 1));
};

const removeFromCart = (product) => cart.removeItem(product._id);

const proceedToCheckout = () => router.push('/checkout');

// ---- modal
const openDescriptionModal = (product) => (selectedProduct.value = product);
const closeDescriptionModal = () => (selectedProduct.value = null);
</script>

<style scoped>
/* (your styles unchanged) */
</style>
