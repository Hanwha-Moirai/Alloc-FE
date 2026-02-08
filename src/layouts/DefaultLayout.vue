<template>
  <div class="layout">
    <!-- 상단 바 -->
    <TopBar />

    <!-- 하단 영역 -->
    <div class="body">
      <Sidebar />
      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import TopBar from '@/components/common/TopBar.vue'
import Sidebar from '@/components/common/Sidebar.vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

onMounted(() => {
  if (authStore.isAuthenticated) {
    notificationStore.loadUnreadCount()
    notificationStore.startPolling()
  }
})

watch(
  () => authStore.isAuthenticated,
  (isAuthed) => {
    if (isAuthed) {
      notificationStore.loadUnreadCount()
      notificationStore.startPolling()
    } else {
      notificationStore.stopPolling()
    }
  }
)

onUnmounted(() => {
  notificationStore.stopPolling()
})
</script>

<style scoped>
.layout {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 서비스 영역 기준 통일 */
.content {
  flex: 1;
  background-color: #f5f7f9;
  padding: 30px;
  overflow-y: auto;
}

</style>
