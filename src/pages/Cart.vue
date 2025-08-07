<template>
  <div class="cart-page">
    <h2 class="terminal-header"><span class="blink">_</span>CART_INVENTORY</h2>

    <div v-if="!cart.items || cart.items.length === 0" class="empty-cart">
      <div class="empty-terminal">
        <p>> NO_ITEMS_FOUND</p>
        <p>> REDIRECTING_TO_PRODUCTS...</p>
        <router-link to="/products" class="terminal-link"> > CLICK_TO_OVERRIDE </router-link>
      </div>
    </div>

    <div v-else>
      <div class="cart-items">
        <div
          v-for="cartItem in cart.items"
          :key="cartItem.product?._id || Math.random()"
          class="cart-item scanlines"
        >
          <div class="item-header">
            <span class="item-id">ITEM_{{ cartItem.product._id.slice(-6).toUpperCase() }}</span>
            <span class="item-status">STATUS: READY</span>
          </div>

          <div class="item-details">
            <h3 class="item-name">{{ cartItem.product.name }}</h3>

            <div class="item-grid">
              <div class="item-spec">
                <span>QTY:</span>
                <input
                  type="number"
                  v-model.number="cartItem.quantity"
                  min="1"
                  @change="cart.updateQty(cartItem.product._id, cartItem.quantity)"
                  class="terminal-input"
                />
              </div>

              <div class="item-spec">
                <span>UNIT_PRICE:</span>
                <span class="highlight">${{ (cartItem.product.price || 0).toFixed(2) }}</span>
              </div>

              <div class="item-spec">
                <span>SUBTOTAL:</span>
                <span class="highlight">
                  ${{ (cartItem.product.price * cartItem.quantity).toFixed(2) }}
                </span>
              </div>
            </div>
          </div>

          <button @click="cart.removeItem(cartItem.product._id)" class="remove-btn">
            <i class="fas fa-trash-alt"></i> DELETE_ITEM
          </button>
        </div>
      </div>

      <div class="cart-summary">
        <div class="summary-line">
          <span>TOTAL_ITEMS:</span>
          <span>{{ cart.items.reduce((acc, item) => acc + item.quantity, 0) }}</span>
        </div>

        <div class="summary-line total">
          <span>TOTAL_AMOUNT:</span>
          <span class="glow">${{ cart.total.toFixed(2) }}</span>
        </div>

        <div class="action-buttons">
          <button @click="cart.clearCart()" class="clear-btn">
            <i class="fas fa-broom"></i> PURGE_CART
          </button>

          <router-link to="/checkout" class="checkout-btn">
            <i class="fas fa-lock"></i> INITIATE_CHECKOUT
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { useCartStore } from '../stores/cart';
  const cart = useCartStore();
</script>

<style scoped>
  /* === TERMINAL THEME BASE === */
  .cart-page {
    padding: 2rem;
    background: #0b0c10;
    min-height: 100vh;
    font-family: 'Courier New', monospace;
    color: #c5c6c7;
  }

  /* === TERMINAL HEADER === */
  .terminal-header {
    color: #66fcf1;
    font-size: 2rem;
    border-bottom: 1px solid #45a29e;
    padding-bottom: 0.5rem;
    margin-bottom: 2rem;
    letter-spacing: 2px;
  }

  .blink {
    animation: blink 1s step-end infinite;
    color: #0f0;
  }

  @keyframes blink {
    from,
    to {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }

  /* === EMPTY CART === */
  .empty-cart {
    background: rgba(31, 40, 51, 0.5);
    border: 1px dashed #45a29e;
    padding: 2rem;
    text-align: center;
  }

  .empty-terminal {
    color: #aaa;
    line-height: 1.8;
  }

  .terminal-link {
    color: #66fcf1;
    text-decoration: none;
    display: inline-block;
    margin-top: 1rem;
  }

  .terminal-link:hover {
    text-decoration: underline;
    color: #0f0;
  }

  /* === CART ITEMS === */
  .cart-items {
    display: grid;
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .cart-item {
    background: #1f2833;
    border: 1px solid #45a29e;
    padding: 1.5rem;
    position: relative;
  }

  /* Scanlines effect */
  .scanlines::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.1) 51%);
    background-size: 100% 4px;
    pointer-events: none;
    z-index: 1;
    mix-blend-mode: overlay;
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
    font-size: 0.8rem;
  }

  .item-id {
    color: #66fcf1;
    background: rgba(102, 252, 241, 0.1);
    padding: 0.2rem 0.5rem;
    border-radius: 3px;
  }

  .item-status {
    color: #0f0;
  }

  .item-name {
    color: #fff;
    margin: 0 0 1rem 0;
    font-size: 1.3rem;
    font-weight: normal;
  }

  .item-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .item-spec {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: rgba(69, 162, 158, 0.1);
    border-left: 3px solid #45a29e;
  }

  .highlight {
    color: #66fcf1;
    font-weight: bold;
  }

  .terminal-input {
    background: #0b0c10;
    border: 1px solid #45a29e;
    color: #fff;
    padding: 0.3rem;
    width: 60px;
    text-align: center;
    font-family: 'Courier New', monospace;
  }

  .terminal-input:focus {
    outline: none;
    border-color: #66fcf1;
    box-shadow: 0 0 10px rgba(102, 252, 241, 0.5);
  }

  /* === BUTTONS === */
  button {
    background: none;
    border: 1px solid #ff4d4f;
    color: #ff4d4f;
    padding: 0.7rem 1.2rem;
    font-family: 'Courier New', monospace;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  button:hover {
    background: rgba(255, 77, 79, 0.2);
  }

  .remove-btn {
    width: 100%;
    margin-top: 1rem;
  }

  .clear-btn {
    border-color: #666;
    color: #666;
  }

  .clear-btn:hover {
    background: rgba(102, 102, 102, 0.2);
  }

  .checkout-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #45a29e;
    color: #0b0c10;
    padding: 0.7rem 1.2rem;
    text-decoration: none;
    font-family: 'Courier New', monospace;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 0.8rem;
    font-weight: bold;
    transition: all 0.3s ease;
  }

  .checkout-btn:hover {
    background: #66fcf1;
  }

  /* === CART SUMMARY === */
  .cart-summary {
    background: #1f2833;
    border: 1px solid #45a29e;
    padding: 1.5rem;
    margin-top: 2rem;
  }

  .summary-line {
    display: flex;
    justify-content: space-between;
    padding: 0.7rem 0;
    border-bottom: 1px dashed #45a29e;
  }

  .summary-line.total {
    font-size: 1.2rem;
    border-bottom: none;
    padding-top: 1rem;
  }

  .glow {
    color: #66fcf1;
    text-shadow: 0 0 5px rgba(102, 252, 241, 0.7);
  }

  .action-buttons {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  /* === RESPONSIVE ADJUSTMENTS === */
  @media (max-width: 768px) {
    .item-grid {
      grid-template-columns: 1fr;
    }

    .action-buttons {
      flex-direction: column;
    }

    button,
    .checkout-btn {
      width: 100%;
      justify-content: center;
    }
  }
</style>
