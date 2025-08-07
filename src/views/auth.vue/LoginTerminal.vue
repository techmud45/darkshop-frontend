<script setup>
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useApiStore } from '@/stores/apiStore'; // Changed from useUserStore

  const email = ref('');
  const password = ref('');
  const error = ref('');
  const loading = ref(false);
  const showSecurityIndicator = ref(false);
  const router = useRouter();
  const apiStore = useApiStore(); // Changed from userStore

  // ... keep all your computed properties and style functions ...

  const login = async () => {
    error.value = '';
    loading.value = true;
    try {
      await apiStore.login({
        email: email.value,
        password: password.value,
      });
      router.push('/products');
    } catch (err) {
      error.value = err.response?.data?.message || 'AUTHENTICATION_FAILURE: Invalid credentials';
      // Terminal-style error effects
      await terminalErrorEffect();
    } finally {
      loading.value = false;
    }
  };

  // Optional terminal error animation
  const terminalErrorEffect = async () => {
    const originalColor = document.documentElement.style.getPropertyValue('--terminal-color');
    document.documentElement.style.setProperty('--terminal-color', '#ff4444');
    await new Promise((r) => setTimeout(r, 100));
    document.documentElement.style.setProperty('--terminal-color', originalColor);
    await new Promise((r) => setTimeout(r, 100));
    document.documentElement.style.setProperty('--terminal-color', '#ff4444');
    await new Promise((r) => setTimeout(r, 300));
    document.documentElement.style.setProperty('--terminal-color', originalColor);
  };
</script>
