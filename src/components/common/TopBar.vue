<template>
  <header class="topbar">
    <!-- 왼쪽 로고 -->
    <div class="left">
      <img src="/alloc-logo.png" class="logo" />
    </div>

    <!-- 오른쪽 영역 -->
    <div class="right">
      <!-- 알림 아이콘 -->
      <img src="/alert.png" class="icon" />

      <!-- 프로필 아이콘 -->
      <div class="profile-wrapper" @click.stop="toggleProfile">
        <img src="/user.png" class="icon" />

        <!-- 프로필 팝오버 -->
        <ProfilePopover
            v-if="isProfileOpen"
            @logout="handleLogout"
            @goProfile="goMyProfile"
        />
      </div>
    </div>
  </header>

  <div
      v-if="isProfileOpen"
      class="overlay"
      @click="closeProfile"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ProfilePopover from './ProfilePopover.vue'

const router = useRouter()
const isProfileOpen = ref(false)

/* 예시 사용자 ID */
const myUserId = 1

const toggleProfile = () => {
  isProfileOpen.value = !isProfileOpen.value
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

  localStorage.removeItem('accessToken')
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
</style>
