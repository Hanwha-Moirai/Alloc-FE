<template>
  <div class="kanban-wrapper">
    <div class="kanban-container">

      <!-- TO DO -->
      <div class="kanban-column">
        <div class="column-header todo">
          <span class="status-circle"></span>
          <h3>TO DO</h3>
        </div>
        <div class="card-list">
          <div
              v-for="task in tasks.filter(t => t.status === 'TO_DO')"
              :key="task.id"
              class="task-card"
              @click="openTask(task)"
          >
            <span
                class="tag"
                :class="categoryClass[task.task_category]"
            >
              {{ categoryLabel[task.task_category] }}
            </span>

            <span class="card-date">
              {{ task.startDate }} - {{ task.endDate }}
            </span>
            <h4 class="card-title">{{ task.title }}</h4>
            <p class="card-desc">{{ task.description }}</p>
            <span class="user-name">{{ task.assignee }}</span>
          </div>
        </div>
      </div>

      <!-- IN PROGRESS -->
      <div class="kanban-column">
        <div class="column-header progress">
          <span class="status-circle"></span>
          <h3>IN PROGRESS</h3>
        </div>
        <div class="card-list">
          <div
              v-for="task in tasks.filter(t => t.status === 'IN_PROGRESS')"
              :key="task.id"
              class="task-card"
              @click="openTask(task)"
          >
            <span
                class="tag"
                :class="categoryClass[task.task_category]"
            >
              {{ categoryLabel[task.task_category] }}
            </span>

            <span class="card-date">
              {{ task.startDate }} - {{ task.endDate }}
            </span>
            <h4 class="card-title">{{ task.title }}</h4>
            <p class="card-desc">{{ task.description }}</p>
            <span class="user-name">{{ task.assignee }}</span>
          </div>
        </div>
      </div>

      <!-- DONE -->
      <div class="kanban-column">
        <div class="column-header done">
          <span class="status-circle">✓</span>
          <h3>DONE</h3>
        </div>
        <div class="card-list">
          <div
              v-for="task in tasks.filter(t => t.status === 'DONE')"
              :key="task.id"
              class="task-card"
              @click="openTask(task)"
          >
            <span
                class="tag"
                :class="categoryClass[task.task_category]"
            >
              {{ categoryLabel[task.task_category] }}
            </span>

            <span class="card-date">
              {{ task.startDate }} - {{ task.endDate }}
            </span>
            <h4 class="card-title">{{ task.title }}</h4>
            <p class="card-desc">{{ task.description }}</p>
            <span class="user-name">{{ task.assignee }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>

  <TaskDetailModal
      v-if="showModal"
      :task="selectedTask"
      @close="closeModal"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TaskDetailModal from '@/components/common/TaskDetailModal.vue'

const selectedTask = ref<any>(null)
const showModal = ref(false)

const openTask = (task: any) => {
  selectedTask.value = task
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedTask.value = null
}

/* ERD ENUM → UI 매핑 */
const categoryLabel = {
  DEVELOPMENT: '개발',
  TESTING: '테스트',
  BUGFIXING: '버그',
  DISTRIBUTION: '배포'
}

const categoryClass = {
  DEVELOPMENT: 'dev',
  TESTING: 'test',
  BUGFIXING: 'bug',
  DISTRIBUTION: 'dist'
}

/* ERD 기준 데이터 */
const tasks = [
  {
    id: 1,
    title: 'API 게이트웨이 인증',
    status: 'DONE',
    startDate: '2025.12.01',
    endDate: '2025.12.31',
    assignee: '김동리',
    description: 'API 게이트웨이 인증 설명입니다.',
    task_category: 'DEVELOPMENT'
  },
  {
    id: 2,
    title: '권한 테스트 시나리오 작성',
    status: 'IN_PROGRESS',
    startDate: '2025.12.05',
    endDate: '2025.12.20',
    assignee: '김동리',
    description: '권한 테스트 케이스 정리',
    task_category: 'TESTING'
  },
  {
    id: 3,
    title: '권한 테스트 시나리오 작성',
    status: 'TO_DO',
    startDate: '2025.12.05',
    endDate: '2025.12.20',
    assignee: '김동리',
    description: '권한 테스트 케이스 정리',
    task_category: 'DISTRIBUTION'
  }
]
</script>

<style scoped>
/* 보드를 감싸는 기본 여백 */
.kanban-wrapper {
  padding-top: 10px;
}

/* 칸반 보드 레이아웃 (3열 고정) */
.kanban-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  align-items: flex-start;
}

/* 각 컬럼 스타일 */
.kanban-column {
  background-color: #f3f4f6;
  border-radius: 4px;
  min-height: 500px; /* 보드 높이 확보 */
}

/* 컬럼 헤더 공통 스타일 */
.column-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background-color: #e5e7eb;
  border-top: 3px solid #ccc;
  border-radius: 4px 4px 0 0;
}

.column-header h3 {
  font-size: 13px;
  font-weight: 700;
  color: #4b5563;
  margin: 0;
}

.status-circle {
  width: 16px;
  height: 16px;
  border: 2px solid #6b7280;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
}

/* 상태별 헤더 포인트 컬러 */
.column-header.todo { border-top-color: #1e3a8a; }
.column-header.todo .status-circle { border-color: #1e3a8a; color: #1e3a8a; font-weight: bold; }
.column-header.progress { border-top-color: #22c55e; }
.column-header.progress .status-circle { border-color: #22c55e; color: #22c55e; font-weight: bold; }
.column-header.done { border-top-color: #FF8D28; }
.column-header.done .status-circle { border-color: #FF8D28; color: #FF8D28; font-weight: bold; }

/* 태스크 카드 목록 */
.card-list {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 개별 카드 디자인 */
.task-card {
  background: white;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 카드 내 카테고리 태그 */
.tag {
  align-self: flex-start;
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
}
.tag.dev { background-color: #3b82f6; }
.tag.bug { background-color: #ef4444; }
.tag.test { background-color: #22c55e; }
.tag.dist { background-color: #8b5cf6; }

/* 카드 텍스트 스타일 */
.card-date { font-size: 11px; color: #9ca3af; }
.card-title { font-size: 14px; font-weight: 700; color: #1f2937; margin: 0; }
.card-desc { font-size: 13px; color: #6b7280; margin: 0; line-height: 1.4; }
.user-name { font-size: 12px; color: #9ca3af; margin-top: 4px; }
</style>