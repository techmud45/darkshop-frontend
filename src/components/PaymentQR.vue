<template>
  <div class="payment-qr">
    <img :src="qrCode" alt="Bitcoin Payment QR" class="qr-image" />
    <div class="payment-details">
      <div class="detail-row">
        <span>Amount:</span>
        <span class="btc-amount">{{ btcAmount }} BTC</span>
      </div>
      <div class="address-box" @click="copyToClipboard">
        <span>Address:</span>
        <code>{{ btcAddress }}</code>
        <span class="copy-hint">(click to copy)</span>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';

  const props = defineProps({
    qrCode: String,
    btcAmount: String,
    btcAddress: String,
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(props.btcAddress);
  };
</script>

<style scoped>
  .payment-qr {
    background: #111;
    border: 1px solid #333;
    padding: 1.5rem;
    max-width: 300px;
    margin: 0 auto;
  }

  .qr-image {
    width: 100%;
    background: white;
    padding: 0.5rem;
    margin-bottom: 1rem;
  }

  .address-box {
    background: #222;
    padding: 0.75rem;
    margin-top: 1rem;
    cursor: pointer;
    word-break: break-all;
  }

  .address-box:hover {
    background: #2a2a2a;
  }

  .btc-amount {
    color: #f7931a;
    font-weight: bold;
  }

  .copy-hint {
    font-size: 0.8rem;
    color: #666;
  }
</style>
