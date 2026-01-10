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
          진행중 <span class="green">3</span> · 전체 5
        </div>
      </div>

      <div class="summary-card">
        <div class="icon orange">📋</div>
        <div class="label">내 태스크</div>
        <div class="value">
          진행중 <span class="green">7</span> · 지연 <span class="red">1</span>
        </div>
      </div>

      <div class="summary-card">
        <div class="icon blue">⏰</div>
        <div class="label">이번주 일정</div>
        <div class="value">4건</div>
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
        <h3 class="card-title">내 프로젝트 목록</h3>

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
          <li v-for="task in tasks" :key="task.title">
            <span>{{ task.title }}</span>
            <span class="badge" :class="task.status">
              {{ task.status }}
            </span>
          </li>
        </ul>
      </section>

      <!-- 다가오는 일정 -->
      <section class="card">
        <h3 class="card-title">다가오는 일정</h3>

        <div class="schedule-item">
          <div class="schedule-title">주간회의 보고</div>
          <div class="schedule-date">2026.01.08 09:30</div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js'

// Chart.js 필수 구성 요소 등록
Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

/* ================= 더미 데이터 ================= */

const projects = [
  {
    name: '클라우드 인프라 전환 프로젝트',
    period: '2026.01.02 - 2026.01.31',
    progress: 95,
    status: 'ACTIVE',
  },
  {
    name: '신규 서비스 런칭 준비',
    period: '2026.01.02 - 2026.01.31',
    progress: 100,
    status: 'CLOSED',
  },
  {
    name: '모바일 앱 리뉴얼',
    period: '2026.01.02 - 2026.01.31',
    progress: 10,
    status: 'HOLD',
  },
]

const tasks = [
  { title: 'API 게이트웨이 인증 로직 구현', status: 'in-progress' },
  { title: '트래픽 이상 감지 룰 수정', status: 'done' },
  { title: 'Spring Boot 모니터링 로그 정리', status: 'done' },
  { title: '알림 서버 재시작 스케줄 적용', status: 'to-do' },
]

const donutChartRef = ref<HTMLCanvasElement | null>(null)
let donutChart: InstanceType<typeof Chart> | null = null

onMounted(() => {
  if (!donutChartRef.value) return

  donutChart = new Chart(donutChartRef.value, {
    type: 'doughnut',
    data: {
      labels: ['DRAFT', 'ACTIVE', 'CLOSED'],
      datasets: [{
        data: [20, 45, 35], // 이미지 비율 기준 예시 데이터
        backgroundColor: [
          '#0085FF', // DRAFT (파랑)
          '#2ECC71', // ACTIVE (초록)
          '#FFC107'  // CLOSED (노랑)
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%', // 도넛 두께 조절
      plugins: {
        legend: { display: false } // 커스텀 범례를 사용하므로 기본 범례는 숨김
      }
    }
  })
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
</style>
