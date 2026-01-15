<template>
  <div class="gantt-wrapper">
    <div class="gantt-sidebar">
      <div class="sidebar-header">
        <div class="view-selector-container">
          <button class="view-selector-btn" @click="isViewMenuOpen = !isViewMenuOpen">
            <div class="view-btn-left">
              <img src="/icons/calendar.png" alt="calendar" class="calendar-mini-icon" />
              <span>{{ currentViewMode }} 보기</span>
            </div>
            <span class="chevron-down">▼</span>
          </button>

          <ul v-if="isViewMenuOpen" class="view-dropdown-menu">
            <li v-for="mode in viewModes" :key="mode" @click="changeViewMode(mode)">
              {{ mode }} 보기
            </li>
          </ul>
        </div>
      </div>

      <div class="project-list">
        <div v-for="(group, index) in scheduleData" :key="group.id" class="project-item-container">
          <div class="project-item" @click="group.expanded = !group.expanded">
            <div class="project-info">
              <span class="arrow" :class="{ rotated: group.expanded }">〉</span>
              <div class="text">
                <h4 class="name">{{ group.projectName }}</h4>
                <p class="period">{{ group.startDate }} - {{ group.endDate }}</p>
                <p class="count">{{ group.tasks.length }} 태스크</p>
              </div>
              <button class="bar-more-inline" @click.stop="openMilestoneMenu($event, group)">⋮</button>

            </div>
          </div>

          <div v-if="group.expanded" class="sub-task-list">
            <div v-for="task in group.tasks" :key="task.id" class="sub-task-item">
              {{ task.name }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="gantt-chart-container">
      <div class="chart-content" :style="{ width: TOTAL_CHART_WIDTH + 'px' }">
        <div class="chart-grid-background">
          <div v-for="month in months" :key="month.name" class="grid-month-col" :style="{ width: month.width }"></div>
        </div>

        <div class="chart-header">
          <div v-for="month in months" :key="month.name" class="month-col" :style="{ width: month.width }">
            <div class="month-name">{{ month.name }}</div>
            <div class="weeks">
              <span v-for="week in month.weeks" :key="week">{{ week }}</span>
            </div>
          </div>
        </div>

        <div class="chart-body">
          <div class="today-line" :style="todayPos"></div>

          <div v-for="(group, index) in scheduleData" :key="group.id" class="chart-row-group">
            <div class="chart-row main">
              <div class="gantt-bar project-bar" :style="calculatePos(group.startDate, group.endDate)">
                <div class="bar-color-indicator" :style="{ backgroundColor: getProjectColor(index) }"></div>
                <div class="bar-content">
                  <div class="bar-title-row">
                    <span class="bar-label">{{ group.projectName }}</span>
                    <button class="bar-more-inline" @click.stop="openMilestoneMenu($event, group)">⋮</button>
                  </div>
                  <div class="bar-sub-info">
                    <span class="bar-date-range">{{ group.startDate }} - {{ group.endDate }}</span>
                    <span class="bar-task-count">{{ group.tasks.length }} 태스크</span>
                  </div>
                </div>
              </div>
            </div>

            <template v-if="group.expanded">
              <div v-for="task in group.tasks" :key="task.id" class="chart-row sub">
                <div class="gantt-bar task-bar" :style="calculatePos(task.startDate, task.endDate)">
                  <span class="task-label">{{ task.name }}</span>
                  <span class="task-date">🚩 {{ task.startDate }} - {{ task.endDate }}</span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div v-if="activeMenuId !== null" class="context-menu" :style="menuPos">
      <ul>
        <li @click="handleEdit(activeMenuId)"><span>✏️</span> 수정하기</li>
        <li @click="handleDelete(activeMenuId)" class="delete"><span>🗑️</span> 삭제하기</li>
      </ul>
    </div>

    <div class="gantt-wrapper">
      <ScheduleEditModal
          v-if="isEditModalOpen"
          v-model="editingData"
          @close="isEditModalOpen = false"
          @save="saveEdit"
      />
    </div>

    <div class="gantt-wrapper">
      <ScheduleDeleteModal
          v-if="isDeleteModalOpen"
          @close="isDeleteModalOpen = false"
          @confirm="confirmDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import ScheduleEditModal from '@/components/common/ScheduleEditModal.vue'
import ScheduleDeleteModal from '@/components/common/ScheduleDeleteModal.vue'
import { getGanttTasks, getGanttMilestones } from '@/api/gantt'

const route = useRoute()
const projectId = Number(route.params.projectId)

// 상태 관리
const scheduleData = ref([])
const isLoading = ref(true)

//보기 모드 상태
const isViewMenuOpen = ref(false)
const currentViewMode = ref('월간')
const viewModes = ['일간', '주간', '월간']

// API 데이터 로드 함수
const fetchGanttData = async () => {
  isLoading.value = true;
  try {
    const [msRes] = await Promise.all([
      getGanttMilestones(projectId)
    ]);

    const rawMilestones = msRes.data?.data || msRes.data || [];

    scheduleData.value = rawMilestones.map(ms => ({
      id: ms.milestoneId,
      projectName: ms.milestoneName || '제목 없음',
      startDate: dayjs(ms.startDate).format('YYYY.MM.DD'),
      endDate: dayjs(ms.endDate).format('YYYY.MM.DD'),
      expanded: true,

      tasks: (ms.tasks || []).map(t => ({
        id: t.taskId,
        name: t.taskName || t.title || '태스크 제목 없음',
        startDate: dayjs(t.startDate).format('YYYY.MM.DD'),
        endDate: dayjs(t.endDate).format('YYYY.MM.DD')
      }))
    }));

    console.log("매핑 완료 데이터:", scheduleData.value);
  } catch (error) {
    console.error("간트 데이터 로딩 에러:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchGanttData)

// --- 보기 모드별 하루당 차지하는 픽셀 폭 (동적 계산) ---
const pixelPerDay = computed(() => {
  switch (currentViewMode.value) {
    case '일간': return 120; // 하루가 아주 넓게 보임 (텍스트 충분히 표시)
    case '주간': return 40;  // 1주일 단위 보기에 적합
    case '월간': return 8.2; // 기존의 컴팩트한 1년 보기
    case '연간': return 2.5; // 전체 흐름 파악용
    default: return 8.2;
  }
})

//설정값
const currentYear = 2026
const startOfYear = dayjs(`${currentYear}-01-01`)
const endOfYear = dayjs(`${currentYear}-12-31`)
const totalDaysInYear = endOfYear.diff(startOfYear, 'day') + 1
const TOTAL_CHART_WIDTH = computed(() => totalDaysInYear * pixelPerDay.value)
const MONTH_WIDTH = computed(() => TOTAL_CHART_WIDTH.value / 12)

const changeViewMode = (mode: string) => {
  currentViewMode.value = mode
  isViewMenuOpen.value = false
}


// 프로젝트별 고유 색상 배열
const projectColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const getProjectColor = (index: number) => projectColors[index % projectColors.length];

// --- 타임라인 생성 로직 (일간 보기 대응 추가) ---
const months = computed(() => {
  return Array.from({ length: 12 }, (_, i) => {
    const startOfMonth = dayjs(`${currentYear}-${i + 1}-01`);
    const daysInMonth = startOfMonth.daysInMonth();
    const weeks = [];

    if (currentViewMode.value === '일간') {
      // 일간 보기일 때는 해당 월의 모든 날짜(1~31)를 추가
      for (let day = 1; day <= daysInMonth; day++) {
        weeks.push(day);
      }
    } else if (currentViewMode.value === '주간') {
      // 주간 보기는 7일 간격
      for (let day = 1; day <= daysInMonth; day += 7) {
        weeks.push(day);
      }
    } else {
      // 월간 보기는 주요 지점만
      weeks.push(1, 8, 15, 22);
    }

    return {
      name: `${i + 1}월`,
      weeks,
      width: (daysInMonth * pixelPerDay.value) + 'px'
    };
  });
});

// --- 위치 계산 로직 수정 ---
const calculatePos = (start: string, end: string) => {
  const startDate = dayjs(start.replace(/\./g, '-'))
  const endDate = dayjs(end.replace(/\./g, '-'))
  const startDiff = startDate.diff(startOfYear, 'day')
  const duration = endDate.diff(startDate, 'day') + 1

  return {
    left: `${startDiff * pixelPerDay.value}px`,
    width: `${duration * pixelPerDay.value}px`
  }
}

const todayPos = computed(() => {
  const today = dayjs();
  if (today.year() !== currentYear) return { display: 'none' };
  const diff = today.diff(startOfYear, 'day');
  return { left: `${diff * pixelPerDay.value}px`, display: 'block' };
});

// --- 메뉴 상태 관리 ---
const activeMenuId = ref<number | null>(null);
const menuPos = ref({ top: '0px', left: '0px' });

// 메뉴 열기
const openMilestoneMenu = (event: MouseEvent, group: any) => {
  activeMenuId.value = group.id;

  // 클릭한 버튼의 위치를 기준으로 메뉴 위치 설정
  // fixed 포지션이므로 뷰포트 좌표(client)를 그대로 사용합니다.
  menuPos.value = {
    top: `${event.clientY + 5}px`,
    left: `${event.clientX - 100}px`
  };

  // 버블링 방지 및 즉시 닫기 방지를 위해 setTimeout 사용
  setTimeout(() => {
    window.addEventListener('click', closeHandler);
  }, 0);
};

const closeHandler = () => {
  activeMenuId.value = null;
  window.removeEventListener('click', closeHandler);
};

// 수정/삭제 핸들러
const isEditModalOpen = ref(false);
const editingData = ref({ id: 0, projectName: '', startDate: '', endDate: '' });

const handleEdit = (id: number) => {
  const target = scheduleData.value.find(item => item.id === id);
  if (target) {
    editingData.value = { ...target };
    isEditModalOpen.value = true;
  }
  activeMenuId.value = null;
};

const saveEdit = () => {
  const index = scheduleData.value.findIndex(item => item.id === editingData.value.id);
  if (index !== -1) {
    scheduleData.value[index] = { ...editingData.value };
    isEditModalOpen.value = false;
  }
};

const isDeleteModalOpen = ref(false);
const targetDeleteId = ref<number | null>(null);

const handleDelete = (id: number) => {
  targetDeleteId.value = id;
  isDeleteModalOpen.value = true;
  activeMenuId.value = null; // 메뉴 닫기
};

// 2. 삭제 모달에서 최종 확인 시
const confirmDelete = () => {
  if (targetDeleteId.value !== null) {
    scheduleData.value = scheduleData.value.filter(item => item.id !== targetDeleteId.value);
    isDeleteModalOpen.value = false;
    targetDeleteId.value = null;
  }
}
</script>

<style scoped>
.gantt-wrapper {
  display: flex;
  height: calc(100vh - 200px);
  background: #fff;
  border: 1px solid #e5e7eb;
}

/* [왼쪽] 사이드바 */
.gantt-sidebar { width: 280px; min-width: 280px; border-right: 1px solid #e5e7eb; display: flex; flex-direction: column; z-index: 20; background: #fff; }
.sidebar-header { padding: 12px; border-bottom: 1px solid #f3f4f6; }
.project-item { padding: 16px; border-bottom: 1px solid #f3f4f6; position: relative; cursor: pointer; }
/* 리스트 마일스톤 왼쪽 색상 라인 */
.project-item::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: #3b82f6; }
.project-item-container:nth-child(2) .project-item::before { background: #10b981; }
.project-item-container:nth-child(3) .project-item::before { background: #f59e0b; }

.project-info { display: flex; gap: 10px; align-items: flex-start; }
.arrow { font-size: 12px; color: #9ca3af; transition: transform 0.2s; }
.arrow.rotated { transform: rotate(90deg); }
.name { font-size: 13px; font-weight: 700; margin: 0; color: #374151; }
.period, .count { font-size: 11px; color: #9ca3af; margin: 2px 0 0 0; }
.more-btn { background: none; border: none; cursor: pointer; color: #ccc; margin-left: auto; }

.sub-task-list { background-color: #f9fafb; }
.sub-task-item { padding: 10px 16px 10px 45px; font-size: 12px; color: #6b7280; border-bottom: 1px solid #f1f1f1; }

/* [오른쪽] 차트 */
.gantt-chart-container { flex: 1; overflow-x: auto; position: relative; background-color: #fff; }
.chart-content { position: relative; }

.chart-grid-background {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; pointer-events: none;
}
.grid-month-col {
  flex-shrink: 0;
  border-right: 1px solid #e5e7eb;
  position: relative;
}

.grid-month-col::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: v-bind("currentViewMode === '일간' ? 'linear-gradient(to right, #f1f1f1 1px, transparent 1px)' : 'none'");
  background-size: v-bind("pixelPerDay + 'px'") 100%;
  pointer-events: none;
  opacity: 0.5;
}

/* 홀수 달마다 연한 하늘색 배경 추가 */
.grid-month-col:nth-child(odd) { background-color: #f8faff; }

.chart-header { display: flex; border-bottom: 1px solid #e5e7eb; background: #fff; position: relative; z-index: 5; }
.month-col {
  flex-shrink: 0;
  border-right: 1px solid #e5e7eb;
  text-align: center;
  transition: width 0.3s ease; /* 모드 변경 시 부드러운 애니메이션 */
}

.grid-month-col {
  flex-shrink: 0;
  border-right: 1px solid #f1f1f1;
  transition: width 0.3s ease;
}
.month-name { padding: 8px; font-size: 12px; font-weight: 700; color: #333; }
.weeks {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-top: 1px solid #f3f4f6;
  /* 일간 보기에서 날짜가 많을 때를 대비 */
  overflow: hidden;
}

.weeks span {
  font-size: 10px;
  color: #9ca3af;
  flex: 1; /* 날짜마다 균등한 공간 할당 */
  text-align: center;
  min-width: 20px;
}

.chart-body { position: relative; min-height: 100%; padding-top: 20px; z-index: 2; }
.chart-row { position: relative; height: 70px; display: flex; align-items: center; }
.chart-row.main { height: 80px; }
.chart-row.sub { height: 45px; }

/* 마일스톤 바 수정 (그림자 및 왼쪽 컬러바) */
.gantt-bar { position: absolute; border-radius: 6px; display: flex; align-items: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; }
.project-bar {
  background: #fff;
  border: 1px solid #e5e7eb;
  height: 60px; /* 정보를 넣기 위해 높이 상향 */
  z-index: 3;
  padding: 0; /* 내부 content에서 조절 */
  display: flex;
}

.bar-content {
  flex: 1;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.bar-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bar-label {
  font-size: 13px;
  font-weight: 700;
  color: #333;
}

.bar-sub-info {
  display: flex;
  flex-direction: column; /* 날짜와 태스크 수를 세로로 배치 */
  margin-top: 2px;
}

.bar-date-range, .bar-task-count {
  font-size: 11px;
  color: #3b82f6; /* 강조 파란색 (이미지 참고) */
  line-height: 1.2;
}

.bar-task-count {
  color: #9ca3af; /* 태스크 수는 회색으로 처리 */
}

.bar-color-indicator { width: 6px; height: 100%; margin-right: 12px; flex-shrink: 0; }
.bar-label { font-size: 12px; font-weight: 700; color: #333; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bar-more-inline { background: none; border: none; color: #ccc; cursor: pointer; font-size: 14px; }

/* 태스크 바 */
.task-bar {
  background: #10b981;
  color: #fff;
  height: 34px;
  z-index: 2;
  padding: 0 15px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
}

.task-label {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.task-date {
  font-size: 11px;
  opacity: 0.9;
  white-space: nowrap;
}
.today-line { position: absolute; top: 0; bottom: 0; width: 2px; background: #3b82f6; z-index: 10; pointer-events: none; }
.today-line::before { content: ''; position: absolute; top: 0; left: -3px; width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; }

.view-selector-container {
  position: relative;
  width: 100%;
}

.view-selector-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 12px;
  background: white;
  border: 1px solid #333; /* 이미지처럼 선명한 테두리 */
  border-radius: 4px;
  cursor: pointer;
}

.view-btn-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
}

.calendar-mini-icon {
  width: 16px;
  height: 16px;
}

.chevron-down {
  font-size: 10px;
  color: #666;
}

/* 드롭다운 메뉴 스타일 */
.view-dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  list-style: none;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

.view-dropdown-menu li {
  padding: 10px 16px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  text-align: left;
}

.view-dropdown-menu li:hover {
  background-color: #f3f4f6;
}

/* 컨텍스트 메뉴 스타일 */
.context-menu {
  position: fixed; /* 차트 스크롤에 상관없이 화면 기준 배치 */
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 9999; /* 모든 요소보다 위에 표시 */
  width: 140px;
  padding: 6px 0;
  animation: fadeIn 0.1s ease-out;
}

.context-menu ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.context-menu li {
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.context-menu li:hover {
  background-color: #f3f4f6;
}

.context-menu li.delete {
  color: #ef4444; /* 삭제 버튼 강조 */
}

.context-menu li span {
  font-size: 14px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>