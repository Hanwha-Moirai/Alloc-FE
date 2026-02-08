<template>
  <aside class="sidebar">
    <div class="admin-logo">
      <span class="logo-text">ADMIN</span>
    </div>

    <nav class="menu">
      <RouterLink
          v-for="item in adminMenu"
          :key="item.path"
          :to="item.path"
          class="menu-item"
          active-class="active"
      >
        <img :src="item.icon" class="icon" />
        <span class="label">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const adminMenu = computed(() => [
  { path: '/admin/users', icon: '/icons/group.png', label: '사용자 관리' },
  { path: '/admin/tech-stack', icon: '/icons/stack.png', label: '기술스택' },
  { path: '/admin/jobs', icon: '/icons/job.png', label: '직무 관리' },
  { path: '/admin/ranks', icon: '/icons/ranks.png', label: '직급 관리' },
  { path: '/admin/documents', icon: '/icons/report.png', label: '문서 관리' },
  { path: '/admin/audit', icon: '/icons/audit.png', label: '감사/보고' }
])
</script>

<style scoped>
.sidebar {
  width: 50px;
  background-color: #4ab8d8;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.admin-logo {
  padding: 15px 0 5px 0;
}

.logo-text {
  color: white;
  font-size: 9px;
  font-weight: 800;
  opacity: 0.7;
}

.menu {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.menu-item {
  width: 100%;
  padding: 8px 0;
  text-decoration: none;
  color: white;

  display: flex;
  flex-direction: column;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  opacity: 0.8;
  transition: all 0.2s;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.15);
  opacity: 1;
  border-radius: 5px;
}

.menu-item.active {
  background-color: rgba(255, 255, 255, 0.25);
  opacity: 1;
  border-radius: 5px;
}

.icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.label {
  margin-top: 5px;
  font-size: 10px;
  font-weight: 500;
  line-height: 1.2;
  white-space: nowrap;
  text-align: center;
}
</style>
