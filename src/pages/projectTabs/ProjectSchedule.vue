<template>
  <div class="gantt-wrapper">
    <div class="gantt-sidebar">
      <div class="sidebar-header">
        <button class="filter-mini">
          <img src="/filter.png" alt="filter" /> 필터
        </button>
      </div>

      <div class="project-list">
        <div v-for="group in scheduleData" :key="group.id" class="project-item-container">
          <div class="project-item" @click="group.expanded = !group.expanded">
            <div class="project-info">
              <span class="arrow" :class="{ rotated: group.expanded }">〉</span>
              <div class="text">
                <h4 class="name">{{ group.projectName }}</h4>
                <p class="period">{{ group.startDate }} - {{ group.endDate }}</p>
                <p class="count">{{ group.tasks.length }} 태스크</p>
              </div>
              <button class="more-btn" @click.stop>⋮</button>
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
      <div class="chart-header">
        <div v-for="month in months" :key="month.name" class="month-col">
          <div class="month-name">{{ month.name }}</div>
          <div class="weeks">
            <span v-for="week in month.weeks" :key="week">{{ week }}</span>
          </div>
        </div>
      </div>

      <div class="chart-body">
        <div class="today-line"></div>

        <div v-for="group in scheduleData" :key="group.id" class="chart-row-group">
          <div class="chart-row main">
            <div
                class="gantt-bar project-bar"
                :style="calculatePos(group.startDate, group.endDate)"
            >
              <span class="bar-label">{{ group.projectName }}</span>
            </div>
          </div>

          <template v-if="group.expanded">
            <div v-for="task in group.tasks" :key="task.id" class="chart-row sub">
              <div
                  class="gantt-bar task-bar"
                  :style="calculatePos(task.startDate, task.endDate)"
              >
                <span class="bar-label">{{ task.name }}</span>
                <span class="bar-date">🚩 {{ task.startDate }} - {{ task.endDate }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const scheduleData = ref([
  {
    id: 1,
    projectName: '클라우드 인프라 전환 프로젝트',
    startDate: '2026.01.25',
    endDate: '2026.03.25',
    expanded: false, // 펼침 상태 추가
    tasks: [
      { id: 11, name: '서버 가동 범위 설정', startDate: '2026.01.25', endDate: '2026.02.10' }
    ]
  },
  {
    id: 2,
    projectName: '신규 서비스 런칭 준비',
    startDate: '2026.01.03',
    endDate: '2026.01.31',
    expanded: true, // 기본값 펼침
    tasks: [
      { id: 21, name: 'UI/UX 개선 설계', startDate: '2026.01.03', endDate: '2026.01.07' },
      { id: 22, name: '메인 화면 개편', startDate: '2026.01.08', endDate: '2026.01.15' },
      { id: 23, name: '성능 최적화', startDate: '2026.01.16', endDate: '2026.01.25' }
    ]
  }
])

const months = [
  { name: '1월', weeks: [2, 9, 16, 23] },
  { name: '2월', weeks: [1, 8, 15, 22] },
  { name: '3월', weeks: [1, 8, 15, 22] },
  { name: '4월', weeks: [1, 8, 15, 22] }
]

const calculatePos = (start: string, end: string) => {
  // 예시 위치값 (실제로는 날짜 계산 로직 필요)
  if (start === '2026.01.03') return { left: '10%', width: '15%' }
  if (start === '2026.01.08') return { left: '15%', width: '10%' }
  if (start === '2026.01.16') return { left: '20%', width: '12%' }
  return { left: '30%', width: '40%' }
}
</script>

<style scoped>
.project-item {
  cursor: pointer;
  transition: background 0.2s;
}
.project-item:hover { background-color: #f9fafb; }

.arrow {
  font-size: 12px;
  transition: transform 0.2s;
  display: inline-block;
  color: #9ca3af;
}
.arrow.rotated {
  transform: rotate(90deg); /* 클릭 시 화살표 아래로 회전 */
}

/* 하위 태스크 리스트 (왼쪽) */
.sub-task-list {
  background-color: #f9fafb;
}
.sub-task-item {
  padding: 10px 16px 10px 45px; /* 들여쓰기 */
  font-size: 13px;
  color: #6b7280;
  border-bottom: 1px solid #f3f4f6;
}

/* 간트 바 애니메이션 (선택사항) */
.chart-row {
  transition: all 0.3s ease;
  overflow: hidden;
}

.gantt-wrapper {
  display: flex;
  height: calc(100vh - 200px);
  background: #fff;
  border: 1px solid #e5e7eb;
}

/* 사이드바 */
.gantt-sidebar {
  width: 280px;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}
.sidebar-header { padding: 12px; border-bottom: 1px solid #f3f4f6; }
/* 필터 버튼 컨테이너 */
.filter-mini {
  background: white;
  border: 1px solid #e5e7eb;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 4px;
  transition: all 0.2s;
}

.filter-mini:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
}

.filter-mini img {
  width: 14px;
  height: 14px;
  object-fit: contain;
  opacity: 0.7;
}

.project-item { padding: 16px; border-bottom: 1px solid #f3f4f6; position: relative; }
.project-item::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #3b82f6; } /* 프로젝트별 포인트 컬러 */
.project-info { display: flex; gap: 10px; align-items: flex-start; }
.name { font-size: 13px; font-weight: 700; margin: 0; color: #374151; }
.period, .count { font-size: 11px; color: #9ca3af; margin: 2px 0 0 0; }
.more-btn { background: none; border: none; cursor: pointer; color: #9ca3af; }

/* 차트 영역 */
.gantt-chart-container {
  flex: 1;
  overflow-x: auto;
  position: relative;
}

.chart-header {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}
.month-col { flex: 1; min-width: 200px; border-right: 1px solid #f3f4f6; text-align: center; }
.month-name { padding: 8px; font-size: 12px; font-weight: 600; color: #374151; }
.weeks { display: flex; justify-content: space-around; padding-bottom: 8px; border-top: 1px solid #f3f4f6; padding-top: 4px; }
.weeks span { font-size: 10px; color: #9ca3af; }

.chart-body { position: relative; min-height: 100%; padding-top: 20px; background-image: linear-gradient(to right, #f3f4f6 1px, transparent 1px); background-size: 50px 100%; }

/* 간트 바 */
.chart-row { height: 60px; display: flex; align-items: center; padding: 0 20px; }
.chart-row.sub { height: 40px; }

.gantt-bar {
  position: absolute;
  height: 80%;
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.project-bar { background: #fff; border: 1px solid #e5e7eb; z-index: 2; height: 50px; }
.task-bar { background: #10b981; color: #fff; height: 30px; }

.bar-label { font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bar-date { font-size: 10px; margin-left: 8px; opacity: 0.9; }

/* 오늘 날짜 수직선 */
.today-line {
  position: absolute;
  left: 45%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #3b82f6;
  z-index: 5;
}
</style>