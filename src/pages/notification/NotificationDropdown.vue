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

<script setup lang="ts">
import { ref, computed } from 'vue';

/* 알림 데이터 타입 정의 */
interface NotiItem {
  id: number;
  message: string;
  createdAt: string;
  isRead: boolean;
}

const activeTab = ref<'unread' | 'read'>('unread');

// 임시 데이터 (실제로는 API에서 가져오게 됩니다)
const notifications = ref<NotiItem[]>([
  { id: 1, message: '‘알림 서버 재시작 스케줄 적용’ 태스크가 배정되었습니다.', createdAt: '2026.01.08. 12:35:11', isRead: false },
  { id: 2, message: '06.10 ~ 06.16 주간보고가 저장되었습니다.', createdAt: '2026.01.08. 12:35:11', isRead: false },
  { id: 3, message: '‘장애 대응 리뷰 회의’가 06.20 10:00에 예정되어 있습니다.', createdAt: '2026.01.08. 12:35:11', isRead: true },
]);

// 필터링된 목록들
const unreadNotifications = computed(() => notifications.value.filter(n => !n.isRead));
const readNotifications = computed(() => notifications.value.filter(n => n.isRead));

// 현재 탭에 보여줄 데이터
const displayedNotifications = computed(() =>
    activeTab.value === 'unread' ? unreadNotifications.value : readNotifications.value
);

/* 액션 핸들러 */

// 개별 처리 (읽음으로 변경 또는 삭제)
const handleSingleAction = (noti: NotiItem) => {
  if (activeTab.value === 'unread') {
    noti.isRead = true; // 실제로는 여기서 API 호출 (PATCH /read)
  } else {
    notifications.value = notifications.value.filter(n => n.id !== noti.id); // 실제로는 여기서 API 호출 (DELETE)
  }
};

// 모두 읽음 처리
const markAllAsRead = () => {
  notifications.value.forEach(n => n.isRead = true);
  // API 연동: POST /api/notifications/read-all
};

// 모두 삭제 처리
const deleteAllRead = () => {
  notifications.value = notifications.value.filter(n => !n.isRead);
  // API 연동: DELETE /api/notifications/read
};
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