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
          <p class="noti-text">{{ noti.message }}</p>
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
import { ref, onMounted, computed } from 'vue';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications,
  getNotificationSubscribeUrl
} from '@/api/notification';

const notifications = ref([]);
const unreadCount = ref(0);
const activeTab = ref('unread');

const loadData = async () => {
  try {
    const [listRes, countRes] = await Promise.all([
      fetchNotifications({ page: 0, size: 20 }),
      fetchUnreadCount()
    ]);

    notifications.value = listRes.data.data.content || [];
    unreadCount.value = countRes.data.data || 0;
  } catch (error) {
    console.error("알림 데이터 로딩 실패:", error);
  }
};

const handleSingleAction = async (noti) => {
  try {
    if (activeTab.value === 'unread') {
      await markNotificationAsRead(noti.id);
      noti.isRead = true;
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    } else {
      await deleteNotification(noti.id);
      notifications.value = notifications.value.filter(n => n.id !== noti.id);
    }
  } catch (error) {
    console.error("알림 처리 실패:", error);
  }
};

// 전체 읽음 처리
const markAllAsRead = async () => {
  try {
    await markAllNotificationsAsRead();
    notifications.value.forEach(n => n.isRead = true);
    unreadCount.value = 0;
  } catch (error) {
    console.error("전체 읽음 처리 실패:", error);
  }
};

// 읽은 알림 전체 삭제
const deleteAllRead = async () => {
  try {
    await deleteAllReadNotifications();
    notifications.value = notifications.value.filter(n => !n.isRead);
  } catch (error) {
    console.error("전체 삭제 실패:", error);
  }
};

const unreadNotifications = computed(() => notifications.value.filter(n => !n.isRead));
const readNotifications = computed(() => notifications.value.filter(n => n.isRead));
const displayedNotifications = computed(() => activeTab.value === 'unread' ? unreadNotifications.value : readNotifications.value);

onMounted(() => {
  loadData();
});
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