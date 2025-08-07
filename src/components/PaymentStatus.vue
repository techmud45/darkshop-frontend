<template>
  <div class="payment-status">
    <div v-if="status === 'pending'" class="status-pending">
      <div class="spinner"></div>
      <span>Waiting for payment confirmation...</span>
    </div>
    <div v-else-if="status === 'paid'" class="status-paid">
      ✓ Payment confirmed! Your order is being processed...
    </div>
    <div v-else-if="status === 'expired'" class="status-expired">
      ✗ Payment expired. Please generate a new invoice.
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { usePaymentStore } from '@/stores/paymentStore';

  const props = defineProps({
    invoiceId: String,
  });

  const status = ref('pending');
  const paymentStore = usePaymentStore();

  onMounted(() => {
    const interval = setInterval(async () => {
      const isPaid = await paymentStore.checkStatus(props.invoiceId);
      if (isPaid) {
        status.value = 'paid';
        clearInterval(interval);
      }
    }, 30000); // Check every 30 seconds
  });
</script>

<style scoped>
  .payment-status {
    margin-top: 2rem;
    text-align: center;
  }

  .status-pending {
    color: #ffcc00;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .status-paid {
    color: #00ff00;
  }

  .status-expired {
    color: #ff4d4f;
  }

  .spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255, 204, 0, 0.3);
    border-radius: 50%;
    border-top-color: #ffcc00;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
