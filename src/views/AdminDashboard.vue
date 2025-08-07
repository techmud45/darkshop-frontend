<!-- AdminDashboard.vue -->
<template>
  <div class="admin-dashboard">
    <AdminSidebar />
    <div class="admin-content">
      <router-view></router-view>
      <!-- Nested routes will render here -->
    </div>
  </div>
</template>

<script>
  import AdminSidebar from '@/components/admin/AdminSidebar.vue';

  export default {
    name: 'AdminDashboard',
    components: { AdminSidebar },
  };
</script>
