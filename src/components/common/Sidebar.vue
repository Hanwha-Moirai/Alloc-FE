<template>
  <aside class="sidebar">
    <nav class="menu">
      <RouterLink
          v-for="item in menu"
          :key="item.path"
          :to="item.path"
          class="menu-item"
          active-class="active"
          exact-active-class="active"
      >
        <img :src="item.icon" class="icon" />
        <span class="label">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

/* 현재 사용자 role 판별 */
const getHomePath = () => {
  const role = authStore.role
  if (!role) return '/home'
  return role === 'PM' ? '/home/pm' : '/home/user'
}

/* 메뉴 정의 */
const menu = computed(() => [
  {
    path: getHomePath(),
    icon: '/icons/home.png',
    label: '홈',
  },
  {
    path: '/projects',
    icon: '/icons/project.png',
    label: '프로젝트',
  },
  {
    path: '/talent',
    icon: '/icons/group.png',
    label: '인력',
  },
  {
    path: '/documents',
    icon: '/icons/report.png',
    label: '문서',
  },
])
</script>

<style scoped>
.sidebar {
  width: 50px;
  background-color: #4ab8d8;
  display: flex;
  justify-content: center;
}

.menu {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  line-height: 1;
  white-space: nowrap;
}
</style>
