<template>
  <div class="dashboard">
    <!-- 페이지 타이틀 -->
    <h1 class="page-title">Dashboard</h1>

    <!-- ================= 상단 요약 카드 ================= -->
    <div class="summary-cards">
      <div class="summary-card">
        <div class="icon purple">📊</div>
        <div class="label">내 프로젝트</div>
        <div class="value">
          진행중 <span class="green">{{ summary.active }}</span> ·
          전체 {{ summary.active + summary.closed }}
        </div>
      </div>

      <div class="summary-card">
        <div class="icon orange">📋</div>
        <div class="label">내 태스크</div>
        <div class="value">
          진행중 <span class="green">{{ taskSummary.inProgress }}</span> ·
          지연 <span class="red">{{ taskSummary.delayed }}</span>
        </div>
      </div>

      <div class="summary-card">
        <div class="icon blue">⏰</div>
        <div class="label">이번주 일정</div>
        <div class="value">{{ weeklyEventCount }}건</div>
      </div>

      <div class="summary-card">
        <div class="icon yellow">⚠️</div>
        <div class="label">주의 필요</div>
        <div class="value">2건</div>
      </div>
    </div>

    <!-- ================= 메인 영역 ================= -->
    <div class="main-grid">
      <!-- 내 프로젝트 -->
      <section class="card">
        <div class="card-header-row">
          <h3 class="card-title">내 프로젝트 목록</h3>
          <button class="more-btn" @click="goToProjectList">
            프로젝트 더보기 →
          </button>
        </div>

        <table class="project-table">
          <thead>
          <tr>
            <th>프로젝트명</th>
            <th>프로젝트 일정</th>
            <th>진행률</th>
            <th>상태</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="p in projects" :key="p.name">
            <td>{{ p.name }}</td>
            <td>{{ p.period }}</td>
            <td>{{ p.progress }}%</td>
            <td>
                <span class="status" :class="p.status.toLowerCase()">
                  {{ p.status }}
                </span>
            </td>
          </tr>
          </tbody>
        </table>
      </section>

      <!-- 프로젝트 상태 분포 -->
      <section class="card chart-card">
        <div class="card-header">
          <h3 class="card-title">프로젝트 상태 분포</h3>
        </div>

        <div class="custom-legend">
          <span class="legend-item"><i class="dot draft"></i> DRAFT</span>
          <span class="legend-item"><i class="dot active"></i> ACTIVE</span>
          <span class="legend-item"><i class="dot closed"></i> CLOSED</span>
        </div>

        <div class="chart-container">
          <canvas ref="donutChartRef"></canvas>
        </div>
      </section>

      <!-- 내 태스크 -->
      <section class="card">
        <h3 class="card-title">내 태스크</h3>

        <ul class="task-list">
          <li v-for="task in delayedTasks" :key="task.taskId">
            <span>{{ task.taskName }}</span>
            <span class="badge to-do">지연</span>
          </li>
        </ul>
      </section>

      <!-- 다가오는 일정 -->
      <section class="card">
        <h3 class="card-title">다가오는 일정</h3>

        <div v-if="upcomingEvents.length === 0" class="schedule-item">
          <div class="schedule-item empty">
            다가오는 일정이 없습니다.
          </div>
        </div>

        <div
            v-for="e in upcomingEvents"
            :key="e.eventId"
            class="schedule-item"
        >
          <div class="schedule-title">{{ e.title }}</div>
          <div class="schedule-date">
            {{ dayjs(e.startDateTime).format('YYYY.MM.DD HH:mm') }}
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js'
import dayjs from 'dayjs'
import { fetchProjectList } from '@/api/project'
import { getMyWeeklyEventCount, getUpcomingProjectEvents } from '@/api/calendar'
import { getGanttTasks } from '@/api/gantt'
import {useRouter} from "vue-router";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

/* ================= 상태 ================= */

const summary = ref({
  active: 0,
  delayed: 0,
  closed: 0
})

const taskSummary = ref({
  inProgress: 0,
  delayed: 0
})

const tasks = ref<any[]>([])
const projectList = ref<any[]>([])
const upcomingEvents = ref<any[]>([])
const delayedTasks = ref<any[]>([])
const weeklyEventCount = ref(0)
const router = useRouter()
const goToProjectList = () => {
  router.push('/projects') // 프로젝트 목록 라우트
}

/* ================= computed ================= */

const projects = computed(() =>
    projectList.value.slice(0, 5).map(p => ({
      id: p.projectId,
      name: p.projectName,
      period: `${p.startDate} ~ ${p.endDate}`,
      progress: p.progressRate,
      status: p.status
    }))
)

/* ================= API ================= */
const calculateSummaryFromProjects = (list) => {
  const active = list.filter(p => p.status === 'ACTIVE').length
  const closed = list.filter(p => p.status === 'CLOSED').length
  const delayed = list.filter(p =>
      p.status === 'DELAYED' || p.status === 'HOLD'
  ).length

  summary.value = { active, delayed, closed }
}

const fetchDashboardData = async () => {
  const res = await fetchProjectList()
  const list = res.data.data ?? res.data ?? []

  projectList.value = list

  calculateSummaryFromProjects(list)
}

const fetchWeeklyEventCount = async () => {
  const res = await getMyWeeklyEventCount()
  weeklyEventCount.value = res.data.data?.count ?? 0
}

const fetchUpcomingEvents = async () => {
  if (!projectList.value.length) return

  const projectId = projectList.value[0].projectId
  const res = await getUpcomingProjectEvents(projectId, 3)

  upcomingEvents.value = res.data.data?.items ?? []
}

const fetchMyTasks = async () => {
  if (!projectList.value.length) return

  const projectId = projectList.value[0].projectId

  const res = await getGanttTasks(projectId)
  const list = res.data.data ?? res.data ?? []

  tasks.value = list

  // 요약 계산
  const inProgress = list.filter(
      t => t.status === 'IN_PROGRESS'
  ).length

  const delayed = list.filter(
      t => t.status === 'DELAYED'
  ).length

  taskSummary.value = {
    inProgress,
    delayed
  }

  // 지연 태스크만 따로
  delayedTasks.value = list.filter(
      t => t.status === 'DELAYED'
  )
}

/* ================= Chart ================= */

const donutChartRef = ref<HTMLCanvasElement | null>(null)
let donutChart: Chart | null = null

const chartData = computed(() => [
  summary.value.active,
  summary.value.delayed,
  summary.value.closed
])
console.log('summary', summary.value)
console.log('chartData', chartData.value)


onMounted(async () => {
  await fetchDashboardData()
  await fetchUpcomingEvents()
  await fetchMyTasks()
  await fetchWeeklyEventCount()

  if (!donutChartRef.value) return

  donutChart = new Chart(donutChartRef.value, {
    type: 'doughnut',
    data: {
      labels: ['ACTIVE', 'DELAYED', 'CLOSED'],
      datasets: [{
        data: chartData.value,
        backgroundColor: ['#0085FF', '#2ECC71', '#FFC107'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: { legend: { display: false } }
    }
  })
})

watch(chartData, (val) => {
  if (!donutChart) return
  donutChart.data.datasets[0].data = val
  donutChart.update()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 페이지 타이틀 */
.page-title {
  margin: 0 0 0 0;
  font-size: 22px;
  font-weight: 700;
}

/* ================= 요약 카드 ================= */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.summary-card {
  background: #fff;
  padding: 16px;
}

.summary-card .icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.icon.purple { background: #f1e8ff; }
.icon.orange { background: #ffe9d9; }
.icon.blue   { background: #e7f0ff; }
.icon.yellow { background: #fff3d6; }

.summary-card .label {
  font-size: 13px;
  color: #666;
}

.summary-card .value {
  font-size: 15px;
  font-weight: 600;
  margin-top: 4px;
}

.green { color: #2ecc71; }
.red   { color: #e74c3c; }

/* ================= 메인 그리드 ================= */
.main-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}

/* 카드 */
.card {
  background: #fff;
  padding: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 12px 0;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.more-btn {
  font-size: 12px;
  color: #6fd3e8;
  background: #ffffff;
  border: 1px solid #6fd3e8;
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.more-btn:hover {
  background: #eaf8fc;
}

/* 테이블 */
.project-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.project-table th,
.project-table td {
  text-align: left;
  padding: 8px;
  border-bottom: 1px solid #eee;
}

.status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
}

.status.active {
  background: #eafaf1;
  color: #2ecc71;
}

.status.closed {
  background: #f5f5f5;
  color: #777;
}

.status.hold {
  background: #fff0f0;
  color: #e74c3c;
}

/* 차트 */
.chart-card {
  display: flex;
  flex-direction: column;
}

/* 도넛 차트 전용 커스텀 범례 스타일 */
.custom-legend {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot.draft  { background-color: #0085FF; }
.dot.active { background-color: #2ECC71; }
.dot.closed { background-color: #FFC107; }

/* 차트 컨테이너 */
.chart-container {
  flex: 1;
  margin: 0 auto;
  position: relative;
}

canvas {
  max-width: 100%;
  max-height: 200px;
}

/* 태스크 */
.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-list li {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
}

.badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
}

.badge.in-progress {
  background: #e8f3ff;
  color: #3498db;
}

.badge.done {
  background: #eafaf1;
  color: #2ecc71;
}

.badge.to-do {
  background: #f0f0f0;
  color: #777;
}

/* 일정 */
.schedule-item {
  border-top: 1px solid #eee;
  padding-top: 12px;
}

.schedule-title {
  font-size: 14px;
  font-weight: 600;
}

.schedule-date {
  font-size: 12px;
  color: #777;
  margin-top: 4px;
}

/* 일정 없음 상태 */
.schedule-item.empty {
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
  padding: 16px 0;
  border-top: none;
}
</style>
