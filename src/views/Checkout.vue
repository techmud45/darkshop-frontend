<template>
  <div class="dark-checkout">
    <h2 class="glitch-text">BITCOIN PAYMENT</h2>

    <div v-if="!payment.invoice" class="cart-summary">
      <div v-for="item in cart.items" :key="item.id" class="item-row">
        <span>{{ item.name }} × {{ item.quantity }}</span>
        <span>${{ (item.price * item.quantity).toFixed(2) }}</span>
      </div>
      <div class="total-row">
        <span>TOTAL</span>
        <span>${{ cart.total.toFixed(2) }}</span>
      </div>

      <button @click="initiatePayment" :disabled="payment.loading" class="pay-button">
        <span v-if="payment.loading">PROCESSING...</span>
        <span v-else>PAY WITH BITCOIN</span>
      </button>

      <p v-if="payment.error" class="error-message">
        {{ payment.error }}
      </p>
    </div>

    <div v-else class="payment-interface">
      <PaymentQR
        :qr-code="payment.invoice.qrCode"
        :btc-amount="payment.invoice.btcAmount"
        :btc-address="payment.invoice.btcAddress"
      />

      <PaymentStatus :invoice-id="payment.invoice.orderId" />

      <div class="expiry-notice">
        Invoice expires in: {{ formatExpiry(payment.invoice.expiresAt) }}
      </div>
    </div>
  </div>
</template>

<script setup>
  import { useCartStore } from '@/stores/cart';
  import { usePaymentStore } from '@/stores/paymentStore';
  import PaymentQR from '@/components/PaymentQR.vue';
  import PaymentStatus from '@/components/PaymentStatus.vue';

  const cart = useCartStore();
  const payment = usePaymentStore();

  const initiatePayment = async () => {
    const items = cart.items.map(item => ({
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity
    }));
    await payment.createInvoice(items);
  };

  const formatExpiry = (timestamp) => {
    const mins = Math.floor((timestamp - Date.now()) / 60000);
    const secs = Math.floor(((timestamp - Date.now()) % 60000) / 1000);
    return `${mins}m ${secs}s`;
  };
</script>

<style scoped>
  .dark-checkout {
    background: #0a0a0a;
    color: #e0e0e0;
    padding: 2rem;
    border: 1px solid #333;
    max-width: 600px;
    margin: 0 auto;
    font-family: 'Courier New', monospace;
  }

  .glitched-text {
    color: #0f0;
    text-shadow: 0 0 5px #0f0;
    text-align: center;
    margin-bottom: 2rem;
  }

  .item-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px dashed #333;
  }

  .total-row {
    display: flex;
    justify-content: space-between;
    padding: 1rem 0;
    font-weight: bold;
    border-top: 2px solid #333;
    margin-top: 0.5rem;
  }

  .pay-button {
    background: #f7931a;
    color: black;
    border: none;
    padding: 1rem;
    width: 100%;
    margin-top: 2rem;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
  }

  .pay-button:hover {
    background: #ffaa33;
  }

  .pay-button:disabled {
    background: #666;
    cursor: not-allowed;
  }

  .error-message {
    color: #ff4d4f;
    margin-top: 1rem;
    text-align: center;
  }

  .expiry-notice {
    color: #ffcc00;
    text-align: center;
    margin-top: 1rem;
    font-size: 0.9rem;
  }
</style>
