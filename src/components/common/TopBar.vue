<template>
  <header class="topbar">
    <div class="left">
      <img src="/alloc-logo.png" class="logo" />
    </div>

    <div class="right">
      <div class="noti-wrapper" @click.stop="toggleNoti">
        <img src="/alert.png" class="icon" />
        <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>

        <NotificationDropdown
            v-if="isNotiOpen"
            @close="closeNoti"
        />
      </div>

      <div class="profile-wrapper" @click.stop="toggleProfile">
        <img src="/user.png" class="icon" />
        <ProfilePopover
            v-if="isProfileOpen"
            @logout="handleLogout"
            @goProfile="goMyProfile"
        />
      </div>
    </div>
  </header>

  <div
      v-if="isProfileOpen || isNotiOpen"
      class="overlay"
      @click="allClose"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ProfilePopover from '@/components/common/ProfilePopover.vue'
import NotificationDropdown from '@/pages/notification/NotificationDropdown.vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const isProfileOpen = ref(false)
const isNotiOpen = ref(false)
const unreadCount = computed(() => notificationStore.unreadCount)

/* 예시 사용자 ID (로그인 정보에서 가져와야 함) */
const myUserId = 1

// 토글 로직들
const toggleProfile = () => {
  isNotiOpen.value = false
  isProfileOpen.value = !isProfileOpen.value
}

const toggleNoti = () => {
  isProfileOpen.value = false
  isNotiOpen.value = !isNotiOpen.value
}

const allClose = () => {
  isProfileOpen.value = false
  isNotiOpen.value = false
}

const closeNoti = () => {
  isNotiOpen.value = false
}

const closeProfile = () => {
  isProfileOpen.value = false
}

const goMyProfile = () => {
  closeProfile()
  router.push(`/profile/${myUserId}`)
}

const handleLogout = () => {
  closeProfile()
  authStore.clearAuth()
  notificationStore.stopPolling()
  localStorage.removeItem('refreshToken')
  router.push('/login')
}
</script>

<style scoped>
.topbar {
  height: 50px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  border-bottom: 1px solid #eaeaea;
}

/* 로고 */
.left {
  display: flex;
  align-items: center;
}

.logo {
  height: 32px;
}

/* 오른쪽 아이콘 영역 */
.right {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* 아이콘 버튼 */
.icon-btn {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
}

/* 아이콘 이미지 */
.icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  cursor: pointer;
}

/* 유저 아이콘 크기 조금 키우고 싶을 때 */
.user-icon {
  width: 28px;
  height: 28px;
}

/* 알림 뱃지 */
.badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background-color: #ff4d4f;
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 50%;
  padding: 2px 6px;
}

.overlay {
  position: fixed;
  inset: 0;
  z-index: 900;
}

.noti-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.badge {
  position: absolute;
  top: -4px;
  right: -6px;
  background-color: #ff4d4f;
  color: white;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 10px;
  line-height: 1;
}
</style>
