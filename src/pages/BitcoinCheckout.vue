<template>
  <div class="btc-pay">
    <h3>Bitcoin Payment</h3>

    <div v-if="invoice" class="payment-info">
      <img :src="invoice.qrCode" alt="BTC Payment QR" class="qr-code" />
      <div class="address-box">
        <p>
          Send <strong>{{ invoice.btcAmount }} BTC</strong> to:
        </p>
        <p class="monospace selectable">{{ invoice.btcAddress }}</p>
        <p class="expiry">Expires in {{ formatExpiry(invoice.expiry) }}</p>
      </div>
    </div>

    <button @click="createInvoice" :disabled="loading" class="pay-button">
      <span v-if="loading">Processing...</span>
      <span v-else>Generate Payment Request</span>
    </button>
  </div>
</template>

<script>
  import { ref } from 'vue';
  import axios from 'axios';

  export default {
    setup() {
      const invoice = ref(null);
      const loading = ref(false);

      const createInvoice = async () => {
        loading.value = true;
        try {
          const response = await axios.post('/api/create-invoice', {
            orderId: window.crypto.randomUUID(),
            amount: 29.99, // Example amount
          });
          invoice.value = response.data;
          startPaymentPolling(response.data.invoiceId);
        } finally {
          loading.value = false;
        }
      };

      const startPaymentPolling = (invoiceId) => {
        const interval = setInterval(async () => {
          const { data } = await axios.get(`/api/invoice-status/${invoiceId}`);
          if (data.paid) {
            clearInterval(interval);
            // Redirect to thank you page
          }
        }, 30000); // Poll every 30 seconds
      };

      const formatExpiry = (timestamp) => {
        const mins = Math.floor((timestamp - Date.now()) / 60000);
        return `${mins} minute${mins !== 1 ? 's' : ''}`;
      };

      return { invoice, loading, createInvoice, formatExpiry };
    },
  };
</script>

<style scoped>
  .btc-pay {
    font-family: 'Courier New', monospace;
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    background: #111;
    border: 1px solid #333;
  }

  .qr-code {
    width: 200px;
    height: 200px;
    margin: 0 auto;
    display: block;
    background: white;
    padding: 10px;
  }

  .address-box {
    margin-top: 20px;
    padding: 15px;
    background: #222;
  }

  .monospace {
    font-family: monospace;
    word-break: break-all;
  }

  .selectable {
    user-select: all;
  }

  .pay-button {
    background: #f7931a;
    color: black;
    border: none;
    padding: 12px 24px;
    font-weight: bold;
    cursor: pointer;
    width: 100%;
    margin-top: 20px;
  }

  .pay-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .expiry {
    color: #f7931a;
    font-size: 0.9em;
  }
</style>
