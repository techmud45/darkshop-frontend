import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export const usePaymentStore = defineStore('payment', () => {
  const invoice = ref(null);
  const error = ref(null);
  const loading = ref(false);

  const createInvoice = async (cartItems) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.post(
        '/api/payments/create',
        {
          items: cartItems,
        },
        {
          timeout: 60000, // Tor is slow
        }
      );

      invoice.value = response.data;
    } catch (err) {
      error.value = err.response?.data?.error || 'Payment initiation failed';
      console.error('Payment error:', err);
    } finally {
      loading.value = false;
    }
  };

  const checkStatus = async (invoiceId) => {
    try {
      const { data } = await axios.get(`/api/payments/status/${invoiceId}`);
      return data.paid;
    } catch (err) {
      console.error('Status check failed:', err);
      return false;
    }
  };

  return { invoice, error, loading, createInvoice, checkStatus };
});
