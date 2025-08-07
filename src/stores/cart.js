import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [], // Structure: [{ product: { _id, name, price }, quantity }]
  }),

  getters: {
    total: (state) => {
      return state.items.reduce((sum, item) => {
        return sum + (item.product?.price || 0) * item.quantity;
      }, 0);
    },
  },

  actions: {
    addItem(product) {
      if (!product?._id) {
        console.error('Invalid product: Missing _id', product);
        return;
      }

      const existing = this.items.find((i) => i.product?._id === product._id);
      if (existing) {
        existing.quantity += 1;
      } else {
        this.items.push({ product, quantity: 1 });
      }
    },

    removeItem(productId) {
      this.items = this.items.filter((i) => i.product?._id !== productId);
    },

    clearCart() {
      this.items = [];
    },

    updateQty(productId, qty) {
      const item = this.items.find((i) => i.product?._id === productId);
      if (item) item.quantity = Math.max(1, qty); // Ensure quantity >= 1
    },
  },

  persist: true,
});
