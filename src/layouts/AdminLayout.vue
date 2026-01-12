<template>
  <div class="admin-container">
    <TopBar />

    <div class="layout-body">
      <AdminSidebar />

      <main class="admin-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import TopBar from '@/components/common/TopBar.vue'
import AdminSidebar from '@/components/common/AdminSidebar.vue'
</script>

<style scoped>
.admin-container {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background-color: #f8fafc;
}

.layout-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.admin-content {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
}
</style>