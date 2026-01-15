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
import {ref, onMounted, watch} from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import TaskDetailModal from '@/components/common/TaskDetailModal.vue'
import { getGanttTasks } from '@/api/gantt'

const route = useRoute()
const projectId = Number(route.params.projectId)
const tasks = ref<any[]>([])
const isLoading = ref(false)
const selectedTask = ref<any>(null)
const showModal = ref(false)

const props = defineProps({

  isEditing: {
    type: Boolean,
    default: false
  },
  refreshTrigger: {
    type: Number,
    default: 0
  }
});

// 카테고리 매핑 정보
const categoryLabel: Record<string, string> = {
  DEVELOPMENT: '개발',
  TESTING: '테스트',
  BUGFIXING: '버그',
  DISTRIBUTION: '배포'
}

const categoryClass: Record<string, string> = {
  DEVELOPMENT: 'dev',
  TESTING: 'test',
  BUGFIXING: 'bug',
  DISTRIBUTION: 'dist'
}

// 데이터 로드
const fetchTasks = async () => {
  isLoading.value = true;
  try {
    const response = await getGanttTasks(projectId);
    const rawData = response.data?.data || response.data || [];

    tasks.value = rawData.map((t: any) => {
      // DB의 INPROGRESS를 프론트의 IN_PROGRESS로 변환하는 안전한 로직
      let mappedStatus = t.taskStatus;
      if (t.taskStatus === 'TODO') mappedStatus = 'TO_DO';
      if (t.taskStatus === 'INPROGRESS') mappedStatus = 'IN_PROGRESS';

      return {
        id: t.taskId,
        title: t.taskName,
        status: mappedStatus,
        startDate: dayjs(t.startDate).format('YYYY.MM.DD'),
        endDate: dayjs(t.endDate).format('YYYY.MM.DD'),
        assignee: t.userId,
        description: t.taskDescription,
        task_category: t.taskCategory
      };
    });
  } catch (error) {
    console.error("조회 실패:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (projectId) {
    fetchTasks()
  }
})

watch(() => props.refreshTrigger, () => {
  fetchTasks();
});

const openTask = (task: any) => {
  selectedTask.value = task
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedTask.value = null
  fetchTasks() // 변경 사항이 있을 수 있으므로 새로고침
}
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