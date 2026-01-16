<!-- 프로젝트 태스크 목록보기 -->
<template>
  <div class="project-detail-page">
    <h1 v-if="!isRecommendPage" class="page-title">프로젝트 상세보기</h1>

    <div v-if="!isRecommendPage" class="tab-header">
      <div class="tabs">
        <button class="tab" :class="{ active: isActive('') }" @click="goTab('')">요약</button>
        <button class="tab" :class="{ active: isActive('tasks') }" @click="goTab('tasks')">태스크</button>
        <button class="tab" :class="{ active: isActive('gantt') }" @click="goTab('gantt')">마일스톤</button>
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

        <div v-if="isActive('gantt')" class="milstone-actions">
          <button class="add-btn" @click="showMilestoneAddModal = true">+ 마일스톤 추가하기</button>
        </div>

        <div v-if="isActive('docs')">
          <button class="add-btn btn-gradient" @click="showDocModal = true">+ 주간보고/회의록 생성</button>
        </div>
      </div>
    </div>

    <router-view :is-editing="isEditing" :refresh-trigger="refreshKey" />

    <TaskAddModal
        v-if="showAddModal"
        :is-open="showAddModal"
        :milestone-list="milestoneList"
        @close="showAddModal = false"
        @add="handleAddTask"
    />

    <TaskFilterDrawer
        :is-open="isFilterOpen"
        @close="isFilterOpen = false"
        @filter="handleFilter"
    />

    <MilestoneAddModal
        v-if="showMilestoneAddModal"
        :is-open="showMilestoneAddModal"
        @close="showMilestoneAddModal = false"
        @add="handleAddMilestone"
    />

    <DocCreateModal
        :is-open="showDocModal"
        @close="showDocModal = false"
        @create="handleCreateDoc"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import TaskAddModal from '@/components/common/TaskAddModal.vue'
import TaskFilterDrawer from '@/components/common/TaskFilterDrawer.vue'
import MilestoneAddModal from '@/components/common/MilestoneAddModal.vue'
import DocCreateModal from '@/components/common/DocCreateModal.vue'

import { createMilestone, createTask, getGanttMilestones } from '@/api/gantt'

const route = useRoute()
const router = useRouter()
const projectId = route.params.projectId

// --- 모달 및 상태 관리 ---
const showAddModal = ref(false)
const showMilestoneAddModal = ref(false)
const showDocModal = ref(false)
const isEditing = ref(false)
const isFilterOpen = ref(false)
const milestoneList = ref<any[]>([])

// URL에 'recommend'가 포함되어 있으면 true를 반환하여 template의 UI를 숨김
const isRecommendPage = computed(() => {
  return route.path.includes('recommend')
})

// --- Methods ---
const toggleEdit = () => {
  isEditing.value = !isEditing.value
}

// 마일스톤 목록 조회
const fetchMilestones = async () => {
  try {
    const res = await getGanttMilestones(Number(projectId))
    milestoneList.value = res.data?.data || res.data || []
  } catch (e) {
    console.error('마일스톤 목록 조회 실패', e)
  }
}

const handleAddTask = async (newTask: any) => {
  try {
    const requestData = {
      milestoneId: Number(newTask.milestoneId),
      taskName: newTask.title,
      taskDescription: newTask.description,
      taskCategory: newTask.task_category,
      startDate: newTask.startDate,
      endDate: newTask.endDate,
      assigneeId: 9
    }

    const res = await createTask(Number(projectId), requestData)

    if (res.status === 200 || res.data?.success) {
      alert('태스크가 등록되었습니다.')
      showAddModal.value = false

      // 태스크 목록 새로고침
      refreshKey.value++
    }
  } catch (e: any) {
    console.error('태스크 등록 실패:', e)
    alert(e.response?.data?.message || '태스크 등록 중 오류가 발생했습니다.')
  }
}

const handleFilter = (filterData: any) => {
  console.log('적용할 필터:', filterData)
}

const refreshKey = ref(0)

const handleAddMilestone = async (newMilestone: any) => {
  try {
    const requestData = {
      milestoneName: newMilestone.projectName,
      startDate: newMilestone.startDate.replace(/\./g, '-'),
      endDate: newMilestone.endDate.replace(/\./g, '-'),
      achievementRate: 0
    }

    const response = await createMilestone(Number(projectId), requestData)

    if (response.data && (response.data.success || response.data.status === 'SUCCESS')) {
      alert('마일스톤이 등록되었습니다.')
      showMilestoneAddModal.value = false

      refreshKey.value++
    } else {
      alert(response.data?.message || '등록에 실패했습니다.')
    }
  } catch (error) {
    console.error('마일스톤 등록 실패:', error)

    if (error.response?.status === 403) {
      alert('마일스톤 생성 권한이 없습니다. (PM 전용)')
    } else {
      alert('서버 오류가 발생했습니다. 로그를 확인해주세요.')
    }
  }
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

  // URL에 /docs/ 가 포함되어 있거나, docs로 끝나는 경우 모두 활성화
  if (tab === 'docs') {
    return path.includes(`/projects/${projectId}/docs`)
  }

  // 기타 탭
  return path.includes(`/projects/${projectId}/${tab}`)
}

// Watchers
watch(
    () => route.path,
    (path) => {
      if (path.includes('/tasks')) {
        fetchMilestones()
      }
    },
    { immediate: true }
)
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
