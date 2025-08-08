<template>
  <div class="not-found-container">
    <h1 class="glitch" data-text="404">404</h1>
    <h2 class="glitch" data-text="Page Not Found">Page Not Found</h2>
    <p>The page you are looking for does not exist or has been moved.</p>
    <router-link to="/" class="cyber-button">Go Home</router-link>
  </div>
</template>

<script setup>
// No script needed for static 404 page
</script>

<style scoped>
.not-found-container {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #fff;
  background: rgba(0,0,0,0.7);
  border-radius: 16px;
  margin: 2rem auto;
  max-width: 500px;
  box-shadow: 0 0 24px #00fff7, 0 0 8px #00fff7 inset;
}
.glitch {
  font-size: 4rem;
  color: #00fff7;
  text-shadow: 0 0 8px #00fff7, 0 0 2px #fff;
  position: relative;
  margin-bottom: 0.5rem;
}
.cyber-button {
  margin-top: 2rem;
  padding: 0.75rem 2rem;
  background: #00fff7;
  color: #111;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  box-shadow: 0 0 8px #00fff7;
  transition: background 0.2s;
  text-decoration: none;
}
.cyber-button:hover {
  background: #00bfae;
}
</style>
