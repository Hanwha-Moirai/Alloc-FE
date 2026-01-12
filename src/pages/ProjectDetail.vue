<!-- 프로젝트 태스크 목록보기 -->
<template>
  <div class="project-detail-page">
    <h1 v-if="!isRecommendPage" class="page-title">프로젝트 상세보기</h1>

    <div v-if="!isRecommendPage" class="tab-header">
      <div class="tabs">
        <button class="tab" :class="{ active: isActive('') }" @click="goTab('')">요약</button>
        <button class="tab" :class="{ active: isActive('tasks') }" @click="goTab('tasks')">태스크</button>
        <button class="tab" :class="{ active: isActive('schedule') }" @click="goTab('schedule')">일정</button>
        <button class="tab" :class="{ active: isActive('calendar') }" @click="goTab('calendar')">캘린더</button>
        <button class="tab" :class="{ active: isActive('docs') }" @click="goTab('docs')">문서</button>
        <button class="tab" :class="{ active: isActive('members') }" @click="goTab('members')">인력</button>
      </div>

      <div class="header-actions">
        <template v-if="isActive('')">
          <button class="edit-btn" :class="{ 'save-mode': isEditing }" @click="toggleEdit">
            {{ isEditing ? '저장' : '수정' }}
          </button>
        </template>

        <div v-if="isActive('tasks')" class="task-actions">
          <button class="filter-btn" @click="isFilterOpen = true">
            <img src="/filter.png" class="filter-icon" alt="filter" />
          </button>
          <button class="add-btn" @click="showAddModal = true">+ 태스크 추가하기</button>
        </div>

        <div v-if="isActive('schedule')" class="schedule-actions">
          <button class="add-btn" @click="showMilestoneAddModal = true">+ 마일스톤 추가하기</button>
        </div>

        <div v-if="isActive('docs')">
          <button class="add-btn btn-gradient" @click="showDocModal = true">+ 주간보고/회의록 생성</button>
        </div>
      </div>
    </div>

    <router-view :is-editing="isEditing" />

  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue' // 🔥 computed 추가
import { useRoute, useRouter } from 'vue-router'

import TaskAddModal from '@/components/common/TaskAddModal.vue'
import TaskFilterDrawer from '@/components/common/TaskFilterDrawer.vue'
import ScheduleAddModal from '@/components/common/ScheduleAddModal.vue'
import DocCreateModal from '@/components/common/DocCreateModal.vue'

const route = useRoute()
const router = useRouter()
const projectId = route.params.projectId

// --- 모달 및 상태 관리 ---
const showAddModal = ref(false)
const showMilestoneAddModal = ref(false)
const showDocModal = ref(false)
const isEditing = ref(false)
const isFilterOpen = ref(false)

// 🔥 [추가] 현재 경로가 '인재 추천' 페이지인지 판별하는 로직
// URL에 'recommend'가 포함되어 있으면 true를 반환하여 template의 UI를 숨깁니다.
const isRecommendPage = computed(() => {
  return route.path.includes('recommend')
})

// --- Watchers ---
// 탭이 바뀌면 수정 모드 해제
watch(() => route.path, () => {
  isEditing.value = false
})

// --- Methods ---
const toggleEdit = () => {
  if (isEditing.value) {
    // 저장 로직 (필요 시 API 호출)
    alert('저장되었습니다.')
  }
  isEditing.value = !isEditing.value
}

const handleAddTask = (newTask: any) => {
  console.log('새로운 태스크 데이터:', newTask)
  showAddModal.value = false
}

const handleFilter = (filterData: any) => {
  console.log('적용할 필터:', filterData)
}

const handleAddMilestone = (newMilestone: any) => {
  console.log('새로운 마일스톤 데이터:', newMilestone)
  showMilestoneAddModal.value = false
}

const handleCreateDoc = (data: any) => {
  console.log('생성 데이터:', data)
}

// --- Navigation ---
const goTab = (tab: string) => {
  router.push(`/projects/${projectId}/${tab}`)
}

const isActive = (tab: string) => {
  const path = route.path

  if (tab === '') {
    return path === `/projects/${projectId}` || path === `/projects/${projectId}/`
  }

  return path.includes(`/projects/${projectId}/${tab}`)
}
</script>

<style scoped>
/* 제목 */
.page-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
}

/* 탭 */
.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 16px;
}

.tabs {
  display: flex;
  gap: 16px;
}

.tab {
  background: none;
  border: none;
  padding: 10px 4px;
  font-size: 14px;
  font-weight: 600;
  color: #555;
  cursor: pointer;
}

.tab.active {
  color: #001D6C;
  border-bottom: 2px solid #001D6C;
}

.count {
  font-size: 12px;
  color: #2563eb;
}

.edit-btn {
  padding: 6px 14px;
  border: 1px solid #4ab8d8;
  background: #fff;
  color: #4ab8d8;
  height: 36px;
  cursor: pointer;
}

/* 저장 버튼으로 변했을 때의 스타일 */
.edit-btn.save-mode {
  background: #4ab8d8;
  color: #fff;
  border-color: #3aa7c7;
}

.header-actions {
  display: flex;
  align-items: center;
}

/* 태스크 탭 버튼 묶음 */
.task-actions {
  display: flex;
  gap: 8px;
}

/* 필터 버튼 */
.filter-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* 태스크 추가 버튼 */
.add-btn {
  height: 36px;
  padding: 0 14px;
  background: #4ab8d8;
  color: #fff;
  border: none;
  font-size: 13px;
  cursor: pointer;
}

/* 필터 버튼 */
.filter-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

/* 필터 아이콘 */
.filter-icon {
  width: 16px;
  height: 16px;
  opacity: 0.6;
}

/* 주간보고 버튼 */
.btn-gradient {
  background: linear-gradient(90deg, #38b6ff 0%, #a450cf 50%, #e94e96 100%);
  background-size: 200% auto;
}
</style>
