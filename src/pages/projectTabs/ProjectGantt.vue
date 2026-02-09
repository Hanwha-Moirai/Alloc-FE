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

    <div class="gantt-chart-container" ref="chartContainer">
      <div class="chart-content" :style="{ width: TOTAL_CHART_WIDTH + 'px' }">
        <div class="chart-grid-background">
          <div v-for="month in months" :key="month.name" class="grid-month-col" :style="{ width: month.width }"></div>
        </div>

        <div class="chart-header">
          <div v-for="month in months" :key="month.key" class="month-col" :style="{ width: month.width }">
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
      <MilestoneEditModal
          v-if="isEditModalOpen"
          v-model="editingData"
          @close="isEditModalOpen = false"
          @save="saveEdit"
      />
    </div>

    <div class="gantt-wrapper">
      <MilestoneDeleteModal
          v-if="isDeleteModalOpen"
          @close="isDeleteModalOpen = false"
          @confirm="confirmDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, watch, nextTick} from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import MilestoneEditModal from '@/components/common/MilestoneEditModal.vue'
import MilestoneDeleteModal from '@/components/common/MilestoneDeleteModal.vue'
import { getGanttMilestones, updateMilestone, deleteMilestone } from '@/api/gantt'

const route = useRoute()
const projectId = Number(route.params.projectId)

// 상태 관리
const scheduleData = ref([])
const isLoading = ref(true)
const chartContainer = ref<HTMLElement | null>(null)

//보기 모드 상태
const isViewMenuOpen = ref(false)
const currentViewMode = ref('월간')
const viewModes = ['일간', '주간', '월간']

const props = defineProps({
  refreshTrigger: {
    type: Number,
    default: 0
  }
});

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
      achievementRate: ms.achievementRate ?? 0,
      memberUserIds: ms.memberUserIds ?? [],
      expanded: true, // task 펼치기 : true

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
    await nextTick();
    scrollToFocus();
  }
};

onMounted(fetchGanttData)

watch(() => props.refreshTrigger, () => {
  console.log("부모로부터 데이터 갱신 요청을 받았습니다.");
  fetchGanttData();
});

watch([scheduleData, currentViewMode], async () => {
  await nextTick();
  scrollToFocus();
});

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

const parseDate = (value: string) => dayjs(value.replace(/\./g, '-'))

const allDates = computed(() => {
  const dates: dayjs.Dayjs[] = []
  scheduleData.value.forEach((group: any) => {
    if (group?.startDate) dates.push(parseDate(group.startDate))
    if (group?.endDate) dates.push(parseDate(group.endDate))
    group?.tasks?.forEach((task: any) => {
      if (task?.startDate) dates.push(parseDate(task.startDate))
      if (task?.endDate) dates.push(parseDate(task.endDate))
    })
  })
  return dates
})

const timelineStart = computed(() => {
  if (allDates.value.length === 0) return dayjs().startOf('year')
  const minDate = allDates.value.reduce((min, d) => d.isBefore(min) ? d : min, allDates.value[0])
  return minDate.startOf('month')
})

const timelineEnd = computed(() => {
  if (allDates.value.length === 0) return dayjs().endOf('year')
  const maxDate = allDates.value.reduce((max, d) => d.isAfter(max) ? d : max, allDates.value[0])
  return maxDate.endOf('month')
})

const totalDaysInRange = computed(() => timelineEnd.value.diff(timelineStart.value, 'day') + 1)
const TOTAL_CHART_WIDTH = computed(() => totalDaysInRange.value * pixelPerDay.value)

const changeViewMode = (mode: string) => {
  currentViewMode.value = mode
  isViewMenuOpen.value = false
}


// 프로젝트별 고유 색상 배열
const projectColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const getProjectColor = (index: number) => projectColors[index % projectColors.length];

// --- 타임라인 생성 로직 (일간 보기 대응 추가) ---
const months = computed(() => {
  const result: Array<{ key: string; name: string; weeks: number[]; width: string }> = []
  let cursor = timelineStart.value.startOf('month')
  const end = timelineEnd.value.startOf('month')

  while (cursor.isSame(end) || cursor.isBefore(end)) {
    const daysInMonth = cursor.daysInMonth()
    const weeks: number[] = []

    if (currentViewMode.value === '일간') {
      for (let day = 1; day <= daysInMonth; day++) {
        weeks.push(day)
      }
    } else if (currentViewMode.value === '주간') {
      for (let day = 1; day <= daysInMonth; day += 7) {
        weeks.push(day)
      }
    } else {
      weeks.push(1, 8, 15, 22)
    }

    result.push({
      key: cursor.format('YYYY-MM'),
      name: `${cursor.month() + 1}월`,
      weeks,
      width: (daysInMonth * pixelPerDay.value) + 'px'
    })

    cursor = cursor.add(1, 'month')
  }

  return result
})

// --- 위치 계산 로직 수정 ---
const calculatePos = (start: string, end: string) => {
  const startDate = parseDate(start)
  const endDate = parseDate(end)
  const startDiff = startDate.diff(timelineStart.value, 'day')
  const duration = endDate.diff(startDate, 'day') + 1

  return {
    left: `${startDiff * pixelPerDay.value}px`,
    width: `${duration * pixelPerDay.value}px`
  }
}

const todayPos = computed(() => {
  const today = dayjs()
  if (today.isBefore(timelineStart.value) || today.isAfter(timelineEnd.value)) return { display: 'none' }
  const diff = today.diff(timelineStart.value, 'day')
  return { left: `${diff * pixelPerDay.value}px`, display: 'block' };
});

const scrollToFocus = () => {
  if (!chartContainer.value) return
  const today = dayjs()
  const focus = (today.isBefore(timelineStart.value) || today.isAfter(timelineEnd.value))
    ? allDates.value[0]
    : today

  if (!focus) return

  const diff = focus.diff(timelineStart.value, 'day')
  const target = Math.max(0, diff * pixelPerDay.value - 200)
  chartContainer.value.scrollLeft = target
}

// --- 메뉴 상태 관리 ---
const activeMenuId = ref<number | null>(null);
const menuPos = ref({ top: '0px', left: '0px' });

// 메뉴 열기
const openMilestoneMenu = (event: MouseEvent, group: any) => {
  activeMenuId.value = group.id;

  menuPos.value = {
    top: `${event.clientY + 5}px`,
    left: `${event.clientX - 100}px`
  };

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
const editingData = ref({
  id: 0,
  projectName: '',
  startDate: '',
  endDate: '',
  achievementRate: 0,
  memberUserIds: [] as number[]
});

const handleEdit = (id: number) => {
  const target = scheduleData.value.find(item => item.id === id);
  if (target) {
    editingData.value = { ...target };
    isEditModalOpen.value = true;
  }
  activeMenuId.value = null;
};

// 마일스톤 수정 로직
const saveEdit = async (updatedData: any) => {
  try {
    const requestData = {
      milestoneName: updatedData.projectName,
      startDate: updatedData.startDate.replace(/\./g, '-'),
      endDate: updatedData.endDate.replace(/\./g, '-'),
      achievementRate: updatedData.achievementRate ?? 0,
      memberUserIds: updatedData.memberUserIds
    };

    const response = await updateMilestone(projectId, updatedData.id, requestData);

    if (response.data.success || response.status === 200) {
      alert('마일스톤이 수정되었습니다.');
      isEditModalOpen.value = false;
      await fetchGanttData(); // 데이터 재조회
    }
  } catch (error: any) {
    console.error("수정 실패:", error);
    alert(error.response?.data?.message || '수정 중 오류가 발생했습니다.');
  }
};

// 마일스톤 삭제 로직
const handleDelete = (id: number) => {
  console.log("삭제할 마일스톤 ID 선택됨:", id); // <-- ID가 제대로 찍히는지 확인!
  targetDeleteId.value = id;
  isDeleteModalOpen.value = true;
  activeMenuId.value = null;
};

const confirmDelete = async () => {
  if (targetDeleteId.value === null) {
    console.error("삭제할 ID가 없습니다!");
    return;
  }

  try {
    console.log(`서버로 삭제 요청 보냄: 프로젝트=${projectId}, 마일스톤=${targetDeleteId.value}`);

    // 이 함수의 return값이 success인지 확인
    const response = await deleteMilestone(projectId, targetDeleteId.value);

    console.log("서버 응답:", response.data);

    if (response.data.success || response.status === 200) {
      alert('삭제되었습니다.');
      isDeleteModalOpen.value = false;
      targetDeleteId.value = null;
      await fetchGanttData(); // 새로고침
    }
  } catch (error) {
    console.error("삭제 요청 중 에러 발생:", error);
  }
};

const isDeleteModalOpen = ref(false);
const targetDeleteId = ref<number | null>(null);
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
.gantt-chart-container { flex: 1; overflow-x: auto; overflow-y: hidden; position: relative; background-color: #fff; }
.chart-content { position: relative; min-width: max-content; }

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
