<!-- 프로젝트 태스크 목록보기 -->
<template>
  <div class="project-detail-page">
    <!-- 대제목 -->
    <h1 class="page-title">프로젝트 상세보기</h1>

    <!-- 탭 + 수정 버튼 -->
    <div class="tab-header">
      <div class="tabs">
        <button
            class="tab"
            :class="{ active: isActive('') }"
            @click="goTab('')"
        >
          요약
        </button>

        <button
            class="tab"
            :class="{ active: isActive('tasks') }"
            @click="goTab('tasks')"
        >
          태스크
        </button>

        <button
            class="tab"
            :class="{ active: isActive('schedule') }"
            @click="goTab('schedule')"
        >
          일정
        </button>

        <button
            class="tab"
            :class="{ active: isActive('calendar') }"
            @click="goTab('calendar')"
        >
          캘린더
        </button>

        <button
            class="tab"
            :class="{ active: isActive('docs') }"
            @click="goTab('docs')"
        >
          문서
        </button>

        <button
            class="tab"
            :class="{ active: isActive('members') }"
            @click="goTab('members')"
        >
          인력
        </button>
      </div>

      <!-- 오른쪽 액션 버튼 영역 -->
      <div class="header-actions">

        <!-- 요약 탭 -->
        <button
            v-if="isActive('')"
            class="edit-btn"
        >
          수정
        </button>

        <!-- 태스크 탭 -->
        <div
            v-if="isActive('tasks')"
            class="task-actions"
        >
          <button class="filter-btn" @click="isFilterOpen = true">
            <img src="/filter.png" class="filter-icon" alt="filter" />
          </button>

          <button class="add-btn" @click="showAddModal = true">
            + 태스크 추가하기
          </button>
        </div>

        <!-- 일정 탭 -->
        <div
            v-if="isActive('schedule')"
            class="schedule-actions"
        >
          <button class="add-btn" @click="showMilestoneAddModal = true">
            + 마일스톤 추가하기
          </button>
        </div>

        <!-- 문서 탭 -->
        <div
            v-if="isActive('docs')"
        >
          <button class="add-btn btn-gradient" @click="showDocModal = true">
          + 주간보고/회의록 생성
          </button>
        </div>


      </div>

    </div>

    <router-view />

    <TaskAddModal
        v-if="showAddModal"
        @close="showAddModal = false"
        @add-task="handleAddTask"
    />

    <TaskFilterDrawer
        :is-open="isFilterOpen"
        @close="isFilterOpen = false"
        @filter="handleFilter"
    />

    <ScheduleAddModal
        v-if="showMilestoneAddModal"
        @close="showMilestoneAddModal = false"
        @add="handleAddMilestone"
    />

    <DocCreateModal
        :isOpen="showDocModal"
        @close="showDocModal = false"
        @create="handleCreateDoc"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import TaskAddModal from '@/components/common/TaskAddModal.vue'
import TaskFilterDrawer from '@/components/common/TaskFilterDrawer.vue'
import ScheduleAddModal from '@/components/common/ScheduleAddModal.vue'
import DocCreateModal from '@/components/common/DocCreateModal.vue'

const route = useRoute()
const router = useRouter()
const projectId = route.params.projectId

const showAddModal = ref(false)
const showMilestoneAddModal = ref(false)
const showDocModal = ref(false);

const handleAddTask = (newTask: any) => {
  console.log('새로운 태스크 데이터:', newTask)
  showAddModal.value = false
}

const isFilterOpen = ref(false)

const handleFilter = (filterData: any) => {
  console.log('적용할 필터:', filterData)
}

const handleAddMilestone = (newMilestone: any) => {
  console.log('새로운 마일스톤 데이터:', newMilestone)
  showMilestoneAddModal.value = false
}

const goTab = (tab: string) => {
  router.push(`/projects/${projectId}/${tab}`)
}

const isActive = (tab: string) => {
  const path = route.path;

  if (tab === '') {
    return path === `/projects/${projectId}` || path === `/projects/${projectId}/`;
  }

  return path.includes(`/projects/${projectId}/${tab}`);
}

const handleCreateDoc = (data: any) => {
  console.log('생성 데이터:', data);
};
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
