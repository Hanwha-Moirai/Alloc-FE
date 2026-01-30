<template>
  <div class="notification-dropdown" @click.stop>
    <div class="tabs">
      <button
          :class="{ active: activeTab === 'unread' }"
          @click="activeTab = 'unread'"
      >
        읽지않음
        <span class="badge" v-if="unreadNotifications.length > 0">
          {{ unreadNotifications.length }}
        </span>
      </button>
      <button
          :class="{ active: activeTab === 'read' }"
          @click="activeTab = 'read'"
      >
        읽음
      </button>
    </div>

    <div class="notification-list">
      <div
          v-for="noti in displayedNotifications"
          :key="noti.id"
          class="notification-item"
      >
        <div class="noti-icon">⚠️</div>
        <div class="noti-content">
          <p class="noti-text">{{ noti.content }}</p>
          <span class="noti-date">{{ noti.createdAt }}</span>
        </div>

        <button class="action-btn" @click="handleSingleAction(noti)">
          <span v-if="activeTab === 'unread'">∨</span> <span v-else>×</span> </button>
      </div>

      <div v-if="displayedNotifications.length === 0" class="empty-msg">
        {{ activeTab === 'unread' ? '새로운 알림이 없습니다.' : '읽은 알림 기록이 없습니다.' }}
      </div>
    </div>

    <div class="dropdown-footer" v-if="displayedNotifications.length > 0">
      <button v-if="activeTab === 'unread'" @click="markAllAsRead">
        모두 읽음
      </button>
      <button v-else @click="deleteAllRead">
        모두 삭제
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'

const notificationStore = useNotificationStore()
const activeTab = ref('unread')

const notifications = computed(() => notificationStore.notifications)

const loadData = async () => {
  await Promise.all([
    notificationStore.loadNotifications({ page: 0, size: 20 }),
    notificationStore.loadUnreadCount(),
  ])
}

const handleSingleAction = async (noti) => {
  if (activeTab.value === 'unread') {
    await notificationStore.markAsRead(noti.id)
  } else {
    await notificationStore.removeNotification(noti.id)
  }
}

// 전체 읽음 처리
const markAllAsRead = async () => {
  await notificationStore.markAllAsRead()
}

// 읽은 알림 전체 삭제
const deleteAllRead = async () => {
  await notificationStore.removeAllRead()
}

const unreadNotifications = computed(() => notifications.value.filter((n) => !n.isRead))
const readNotifications = computed(() => notifications.value.filter((n) => n.isRead))
const displayedNotifications = computed(() =>
  activeTab.value === 'unread' ? unreadNotifications.value : readNotifications.value
)

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.notification-dropdown {
  position: absolute;
  top: 45px;
  right: 0;
  width: 360px;
  background: white;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  overflow: hidden;
}

.tabs {
  display: flex;
  background: #fdfdfd;
  border-bottom: 1px solid #eee;
}

.tabs button {
  flex: 1;
  padding: 14px;
  border: none;
  background: none;
  cursor: pointer;
  color: #888;
  font-size: 14px;
  transition: all 0.2s;
}

.tabs button.active {
  color: #000;
  font-weight: 700;
  border-bottom: 2px solid #333;
}

.badge {
  background: #ff4d4f;
  color: white;
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 10px;
  margin-left: 4px;
  vertical-align: middle;
}

.notification-list {
  max-height: 380px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
  align-items: flex-start;
  gap: 12px;
  transition: background 0.2s;
}

.notification-item:hover {
  background-color: #fafafa;
}

.noti-icon {
  font-size: 16px;
  margin-top: 2px;
}

.noti-content {
  flex: 1;
}

.noti-text {
  font-size: 13px;
  margin: 0 0 6px 0;
  line-height: 1.5;
  color: #333;
  word-break: keep-all;
}

.noti-date {
  font-size: 11px;
  color: #aaa;
}

.action-btn {
  padding: 4px 8px;
  border: none;
  background: none;
  cursor: pointer;
  color: #ccc;
  font-size: 16px;
}

.action-btn:hover {
  color: #666;
}

.empty-msg {
  padding: 40px 20px;
  text-align: center;
  color: #bbb;
  font-size: 13px;
}

.dropdown-footer {
  padding: 12px;
  background: #f9fafb;
  border-top: 1px solid #eee;
}

.dropdown-footer button {
  width: 100%;
  padding: 8px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  font-size: 12px;
  font-weight: 500;
}

.dropdown-footer button:hover {
  background: #f3f4f6;
  color: #333;
}
</style>
