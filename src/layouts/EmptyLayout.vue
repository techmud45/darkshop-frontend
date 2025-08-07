<!-- src/layouts/EmptyLayout.vue (for login/error pages) -->
<template>
  <div class="empty-layout">
    <router-view />
  </div>
</template>

<style scoped>
  .empty-layout {
    height: 100vh;
    overflow: hidden;
  }
</style>
