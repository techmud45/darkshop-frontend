<template>
  <div class="product-details fade-in">
    <div v-if="loading">Loading...</div>

    <div v-else class="card">
      <img :src="product.image" alt="product image" />
      <div class="info">
        <h2>{{ product.name }}</h2>
        <p class="price">${{ product.price.toFixed(2) }}</p>
        <p class="desc">{{ product.description }}</p>
        <p class="category">Category: {{ product.category }}</p>

        <div v-if="product.tags?.length" class="tags">
          <span v-for="t in product.tags" :key="t" class="tag">{{ t }}</span>
        </div>

        <button @click="addToCart(product)"><i class="fas fa-cart-plus"></i> Add to Cart</button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue';
  import axios from '../axios';
  import { useRoute } from 'vue-router';
  import { useCartStore } from '../stores/cart';

  const route = useRoute();
  const product = ref({});
  const loading = ref(true);
  const cart = useCartStore();

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`/products/${route.params.id}`);
      product.value = res.data;
    } catch (e) {
      console.error('Failed to fetch product', e);
    } finally {
      loading.value = false;
    }
  };

  onMounted(fetchProduct);

  const addToCart = (p) => {
    cart.addItem(p);
    alert(`${p.name} added to cart`);
  };
</script>

<style scoped>
  .product-details {
    padding: 2rem;
    color: #e0e0e0;
    display: flex;
    justify-content: center;
  }

  .card {
    background: #1f2833;
    border: 1px solid #333;
    border-radius: 10px;
    padding: 2rem;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  img {
    width: 100%;
    max-width: 300px;
    height: auto;
    border-radius: 6px;
    margin-bottom: 1rem;
  }

  .info {
    text-align: center;
  }

  .price {
    color: #66fcf1;
    font-size: 1.3rem;
    margin: 0.5rem 0;
  }

  .desc {
    font-size: 0.95rem;
    margin-bottom: 1rem;
    color: #aaa;
  }

  .category {
    font-size: 0.9rem;
    margin-bottom: 1rem;
    color: #ccc;
  }

  .tags {
    margin-bottom: 1rem;
  }

  .tag {
    background: #0ff3;
    color: #111;
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
    margin: 0 0.3rem;
    font-size: 0.8rem;
  }

  button {
    background: #0ff;
    color: black;
    padding: 0.7rem 1.2rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  button:hover {
    background: #45a29e;
  }

  /* Optional animation */
  .fade-in {
    animation: fadeIn 0.4s ease;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
