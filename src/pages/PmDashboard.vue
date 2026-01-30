<template>
  <div class="dashboard">
    <!-- 페이지 타이틀 -->
    <h1 class="page-title">Project Manager Dashboard</h1>

    <!-- ================= 상단 요약 카드 ================= -->
    <div class="summary-cards">
      <div class="summary-card">
        <div class="icon purple">📊</div>
        <div class="label">프로젝트 진행상황</div>
        <div class="value">
          진행중 <span class="green">{{ summary.active }}</span> ·
          지연 <span class="red">{{ summary.delayed }}</span> ·
          종료 {{ summary.closed }}
        </div>
      </div>

      <div class="summary-card">
        <div class="icon orange">⚠️</div>
        <div class="label">지연 위험 프로젝트</div>
        <div class="value red">2건</div>
      </div>

      <div class="summary-card">
        <div class="icon blue">⏰</div>
        <div class="label">이번주 일정</div>
        <div class="value">4건</div>
      </div>

      <div class="summary-card">
        <div class="icon yellow">📝</div>
        <div class="label">주간 보고서 작성 여부</div>
        <div class="value">
          작성 <span class="green">0</span> ·
          미작성 <span class="red">1</span>
        </div>
      </div>
    </div>

    <!-- ================= 메인 그리드 ================= -->
    <div class="main-grid">
      <!-- 내 프로젝트 목록 -->
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
          <tr v-for="p in projects" :key="p.id">
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

      <!-- 지연 태스크 -->
      <section class="card">
        <h3 class="card-title">지연 태스크</h3>

        <table class="task-table">
          <thead>
          <tr>
            <th>태스크명</th>
            <th>프로젝트명</th>
            <th>담당자</th>
            <th>지연</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="t in delayedTasks" :key="t.name">
            <td>{{ t.name }}</td>
            <td>{{ t.projectname }}</td>
            <td>{{ t.owner }}</td>
            <td>
                <span class="delay" :class="t.delayClass">
                  {{ t.delay }}
                </span>
            </td>
          </tr>
          </tbody>
        </table>
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
import { useRouter } from 'vue-router'
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js'
import { fetchHomeSummary, fetchHomeProjectList } from '@/api/home'
import { getUpcomingProjectEvents } from '@/api/calendar'
import dayjs from "dayjs";

const router = useRouter()
const goToProjectList = () => {
  router.push('/projects') // 프로젝트 목록 라우트
}

Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

// ================= 상태 =================
const summary = ref({
  active: 0,
  delayed: 0,
  closed: 0
})

const projectList = ref<any[]>([])
const upcomingEvents = ref<any[]>([])
const delayedTasks = ref<any[]>([])

// ================= computed =================
const projects = computed(() =>
    projectList.value
        .slice(0, 5) // 5개만 보이게
        .map(p => ({
          id: p.projectId,
          name: p.projectName,
          period: `${p.startDate} ~ ${p.endDate}`,
          progress: p.progressRate,
          status: p.status
        }))
)

const chartData = computed(() => [
  summary.value.active,
  summary.value.delayed,
  summary.value.closed
])

// ================= API =================
const fetchDashboardData = async () => {
  try {
    const [summaryRes, listRes] = await Promise.all([
      fetchHomeSummary(),
      fetchHomeProjectList()
    ])

    const s = summaryRes.data.data ?? summaryRes.data

    summary.value = {
      active: s.activeCount ?? 0,
      delayed: s.delayedCount ?? 0,
      closed: s.closedCount ?? 0
    }

    projectList.value = listRes.data.data ?? listRes.data ?? []
  } catch (e) {
    console.error('홈 대시보드 로드 실패', e)
  }
}

const fetchUpcomingEvents = async () => {
  if (projectList.value.length === 0) return

  const projectId = projectList.value[0].projectId

  try {
    const res = await getUpcomingProjectEvents(projectId, 3)

    console.log('📅 upcoming response:', res.data)

    upcomingEvents.value = res.data.data?.items ?? []

    console.log('📅 upcomingEvents:', upcomingEvents.value)
  } catch (e) {
    console.error('다가오는 일정 조회 실패', e)
    upcomingEvents.value = []
  }
}

// ================= Chart =================
const donutChartRef = ref<HTMLCanvasElement | null>(null)
let donutChart: Chart | null = null

onMounted(async () => {
  await fetchDashboardData()
  await fetchUpcomingEvents()

  if (!donutChartRef.value) return

  donutChart = new Chart(donutChartRef.value, {
    type: 'doughnut',
    data: {
      labels: ['ACTIVE', 'DELAYED', 'CLOSED'],
      datasets: [{
        data: chartData.value,
        backgroundColor: ['#0085FF', '#2ECC71', '#FFC107'],
        borderWidth: 2,
        borderColor: '#ffffff'
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

// summary 변경 시 차트 갱신
watch(chartData, (newVal) => {
  if (donutChart) {
    donutChart.data.datasets[0].data = newVal
    donutChart.update()
  }
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

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
  color: #0085FF;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.more-btn:hover {
  text-decoration: underline;
}

/* 테이블 */
.project-table,
.task-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.project-table th,
.project-table td,
.task-table th,
.task-table td {
  text-align: left;
  padding: 8px;
  border-bottom: 1px solid #eee;
}

/* 상태 */
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

.status.draft {
  background: #f0f0f0;
  color: #999;
}

/* 지연 표시 */
.delay {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
}

.delay.d1 { background: #eafaf1; color: #2ecc71; }
.delay.d2 { background: #fff3d6; color: #f39c12; }
.delay.d3 { background: #ffecec; color: #e74c3c; }

/* 차트 */
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
