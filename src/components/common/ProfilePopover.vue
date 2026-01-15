<template>
  <div class="popover" @click.stop>
    <!-- 프로필 정보 -->
    <div class="profile">
      <div class="avatar">
        <img src="/user.png" alt="profile" />
      </div>
      <div class="name">{{ displayName }}</div>
      <div class="role">{{ displayRole }}</div>
    </div>

    <!-- 버튼 영역 -->
    <div class="actions">
      <button class="outline" @click="goProfile">
        기본정보
      </button>
      <button class="primary" @click="logout">
        로그아웃
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchMyProfileSummary } from '@/api/profile';

const router = useRouter()

// 상태
const profile = ref<{
  userName: string
  jobName: string
  titleName: string
  profileImageUrl: string
} | null>(null)

// API 호출
const loadProfile = async () => {
  try {
    const res = await fetchMyProfileSummary()
    profile.value = res.data.data
  } catch (e) {
    console.error('프로필 요약 조회 실패', e)
  }
}

onMounted(() => {
  loadProfile()
})

// 표시용
const displayName = computed(() => profile.value?.userName ?? '-')

const displayRole = computed(() => {
  // 직책 + 직군 같이 보여주고 싶으면
  if (!profile.value) return '-'
  return `${profile.value.titleName} · ${profile.value.jobName}`
})

// 액션
const goProfile = () => {
  router.push('/my/profile')
}

const logout = () => {
  localStorage.removeItem('accessToken')
  router.push('/login')
}
</script>

<style scoped>
.popover {
  position: absolute;
  top: 56px;
  right: 0;
  width: 260px;
  background-color: #ffffff;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  z-index: 1000;
}

/* 프로필 */
.profile {
  text-align: center;
  margin-bottom: 20px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #f0f2f5;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar img {
  width: 28px;
  opacity: 0.6;
}

.name {
  font-size: 16px;
  font-weight: 700;
}

.role {
  font-size: 13px;
  color: #777;
  margin-top: 4px;
}

/* 버튼 */
.actions {
  display: flex;
  gap: 12px;
}

.actions button {
  flex: 1;
  height: 40px;
  font-size: 14px;
  cursor: pointer;
}

.outline {
  border: 1px solid #4ab8d8;
  background-color: white;
  color: #4ab8d8;
}

.primary {
  background-color: #4ab8d8;
  color: white;
  border: none;
}
</style>
