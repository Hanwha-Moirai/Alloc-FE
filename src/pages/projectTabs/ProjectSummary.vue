<template>
  <div class="project-summary">

    <!-- ================= 상단 정보 ================= -->
    <div class="info-grid">
      <div class="info-box wide">
        <label>프로젝트명</label>
        <input v-if="isEditing" v-model="form.projectName" class="edit-input" />
        <strong v-else>{{ form.projectName }}</strong>
      </div>

      <div class="info-box">
        <label>프로젝트 상태</label>
        <select v-if="isEditing" v-model="form.status" class="edit-select">
          <option value="DRAFT">DRAFT</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="CLOSED">CLOSED</option>
          <option value="HOLD">HOLD</option>
        </select>
        <span v-else class="badge active">{{ form.status }}</span>
      </div>

      <div class="info-box">
        <label>프로젝트 유형</label>
        <select v-if="isEditing" v-model="form.type" class="edit-select">
          <option value="NEW">NEW</option>
          <option value="OPERATION">OPERATION</option>
          <option value="MAINTENANCE">MAINTENANCE</option>
        </select>
        <span v-else class="badge operation">{{ form.type }}</span>
      </div>

      <div class="info-box">
        <label>프로젝트 기간</label>
        <div v-if="isEditing" class="date-edit-group">
          <input type="date" v-model="form.startDate" class="edit-date" />
          ~
          <input type="date" v-model="form.endDate" class="edit-date" />
        </div>
        <strong v-else>{{ form.startDate }} ~ {{ form.endDate }}</strong>
      </div>

      <div class="info-box">
        <label>고객/협력사</label>
        <input v-if="isEditing" v-model="form.client" class="edit-input" />
        <strong v-else>{{ form.client }}</strong>
      </div>
    </div>

    <!-- ================= 프로젝트 설명 ================= -->
    <div class="info-grid bottom">
      <div class="description-box">
        <label>프로젝트 설명</label>
        <textarea v-if="isEditing" v-model="form.description" class="edit-textarea"></textarea>
        <p v-else>{{ form.description }}</p>
      </div>

      <div class="info-box budget">
        <label>예산</label>
        <div v-if="isEditing" class="budget-edit-group">
          <span class="unit">₩</span>
          <input type="number" v-model="form.budget" class="edit-input-budget" />
        </div>
        <strong v-else class="value">
          ₩{{ Number(form.budget).toLocaleString() }}
          <span class="sub">({{ convertToKoreanWon(form.budget) }})</span>
        </strong>
      </div>
    </div>

    <!-- ================= 차트 ================= -->
    <div class="project-summary">
      <div class="chart-grid">
        <div class="chart-box">
          <h4>진행률</h4>
          <div class="legend">
            <span><span class="dot green"></span> 진행률</span>
            <span><span class="dot gray"></span> 잔여</span>
          </div>

          <div class="progress-container">
            <div class="canvas-half">
              <canvas ref="progressChart"></canvas>
              <div class="percent">67%</div>
            </div>
          </div>
        </div>

        <div class="chart-box">
          <h4>리스크 유형 분포</h4>
          <div class="legend">
            <span><span class="dot red"></span> 일정 지연</span>
            <span><span class="dot blue"></span> 보고 미완</span>
            <span><span class="dot yellow"></span> 이벤트 실패</span>
          </div>

          <div class="risk-wrapper">
            <div class="canvas-full">
              <canvas ref="riskChart"></canvas>
            </div>

            <ul class="risk-counts">
              <li>
                <span class="dot red"></span>
                <span class="label">일정 지연</span>
                <span class="count-val">2</span>
              </li>
              <li>
                <span class="dot blue"></span>
                <span class="label">보고 미완</span>
                <span class="count-val">3</span>
              </li>
              <li>
                <span class="dot yellow"></span>
                <span class="label">이벤트 실패</span>
                <span class="count-val">2</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= 하단 ================= -->
    <div class="bottom-grid">
      <div class="log-box">
        <h4>프로젝트 최신 로그</h4>
        <ul>
          <li>[2025.06.16 18:40] 주간보고가 업데이트되었습니다.</li>
          <li>[2025.06.15 14:20] 마일스톤 일정이 변경되었습니다.</li>
          <li>[2025.06.14 10:00] 주간 스크럼 회의가 기록되었습니다.</li>
          <li>[2025.06.13 17:05] 태스크 상태가 변경되었습니다.</li>
        </ul>
      </div>

      <div class="schedule-box">
        <h4>다음 일정 요약</h4>
        <ul>
          <li>마일스톤: 로그 수집 완료 (D-5)</li>
          <li>이벤트: 운영 배포 (06.25)</li>
          <li>회의: 장애 대응 리뷰 (06.20)</li>
          <li>이벤트: 운영 배포 (06.25)</li>
        </ul>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { Chart, ArcElement, Tooltip, DoughnutController } from 'chart.js'

Chart.register(ArcElement, Tooltip, DoughnutController)

const progressChart = ref<HTMLCanvasElement | null>(null)
const riskChart = ref<HTMLCanvasElement | null>(null)
const props = defineProps({
  isEditing: {
    type: Boolean,
    default: false
  }
});

const form = reactive({
  projectName: '트래픽 모니터링 및 장애 대응 고도화',
  status: 'ACTIVE', // ENUM: DRAFT, ACTIVE, CLOSED, HOLD
  type: 'OPERATION', // ENUM: NEW, OPERATION, MAINTENANCE
  startDate: '2025-01-03',
  endDate: '2025-12-31',
  client: '삼성전자',
  description: '기존 서비스의 트래픽 모니터링 체계를 개선하고, 장애 발생 시 원인 파악과 대응 시간을 단축하기 위한 운영 중심의 알림 기능을 고도화합니다. 주요 API 구간의 이상 징후를 사전에 감지하여 서비스 가용성을 확보하고, 장애 지표를 통합 시각화하여 운영 효율성을 높이는 것을 목표로 합니다.',
  budget: 180000000
})

// 예산 숫자를 한글 읽기로 변환 (예: 1억 8천만 원)
const convertToKoreanWon = (num: number) => {
  if (!num) return '0원';
  const won = num / 100000000;
  return won >= 1 ? `${won.toLocaleString(undefined, { maximumFractionDigits: 1 })}억 원` : `${(num / 10000).toLocaleString()}만 원`;
}

onMounted(() => {
  if (progressChart.value) {
    new Chart(progressChart.value, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [67, 33],
          backgroundColor: ['#22c55e', '#e5e7eb'],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        rotation: -90,
        circumference: 180,
        cutout: '80%',
        plugins: { tooltip: { enabled: false } },
      },
    })
  }

  if (riskChart.value) {
    new Chart(riskChart.value, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [2, 3, 2],
          backgroundColor: ['#ef4444', '#3b82f6', '#facc15'],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: { tooltip: {
            enabled: true,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return context.raw + '개';
              }
            }
          },
        },
      },
    })
  }
})
</script>

<style scoped>
.project-summary {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ================= 상단 정보 ================= */
/* 상단 */
.info-grid.top {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr 1fr;
  gap: 12px;
}

/* 설명 + 예산 */
.info-grid.bottom {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 12px;
  margin-top: 12px;
}

.description-box {
  background: #fff;
  border: 1px solid #e5e7eb;
  padding: 16px;
}

.info-box.budget {
  align-self: stretch;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}

.info-box {
  background: #fff;
  border: 1px solid #e5e7eb;
  padding: 12px;
  font-size: 13px;
}

.info-box.wide {
  grid-column: span 2;
}

.info-box.wide strong {
  display: block;
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  margin-top: 4px;
  line-height: 1.4;
}

.info-box label {
  display: block;
  margin-bottom: 6px;
  color: #6b7280;
  font-size: 12px;
}

.info-box .value {
  display: block;
  font-weight: 700;
  line-height: 1.3;
}

.info-box .sub {
  display: block;
  margin-top: 4px;
  color: #6b7280;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge.active {
  background: #e6f9ed;
  color: #16a34a;
}

.badge.operation {
  background: #e0f2fe;
  color: #0284c7;
}

/* ================= 설명 ================= */
.description-box {
  background: #fff;
  border: 1px solid #e5e7eb;
  padding: 12px;
}

.description-box label {
  font-size: 12px;
  color: #6b7280;
}

.description-box p {
  margin: 6px 0 0 0;
  font-size: 13px;
  line-height: 1.3;
}

h4 {
  margin: 0;
}

/* ================= 차트 ================= */
.canvas-box {
  position: relative;
  margin: 0 auto;
  width: 180px;
  height: 180px;
}

.chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.chart-box {
  background: #fff;
  border: 1px solid #e5e7eb;
  padding: 16px;
  min-height: 250px;
}

/* --- 진행률 차트 --- */
.progress-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 140px;
  margin-top: 20px;
}

.canvas-half {
  position: relative;
  width: 180px;
  height: 90px;
}

.percent {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  font-weight: 800;
}

/* --- 리스크 차트 (이미지 레이아웃 핵심) --- */
.risk-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 차트 왼쪽, 리스트 오른쪽 끝으로 배치 */
  padding: 20px 20px 0 10px;
}

.canvas-full {
  position: relative;
  width: 150px; /* 캔버스 크기 고정 */
  height: 150px;
}

.risk-counts {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 150px; /* 리스트 너비 고정 */
}

.risk-counts li {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  font-size: 14px;
}

.risk-counts .label {
  flex: 1;
  margin-left: 10px;
  color: #374151;
}

.count-val {
  background: #f3f4f6;
  padding: 2px 10px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 12px;
  color: #4b5563;
}

/* 공통 스타일 */
canvas {
  width: 100% !important;
  height: 100% !important;
}

.legend {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
}

.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 4px;
}
.green { background: #22c55e; }
.gray { background: #e5e7eb; }
.red { background: #ef4444; }
.blue { background: #3b82f6; }
.yellow { background: #facc15; }

/* ================= 하단 ================= */
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.log-box,
.schedule-box {
  background: #fff;
  border: 1px solid #e5e7eb;
  padding: 16px;
}

.log-box ul,
.schedule-box ul {
  padding-left: 0;
  list-style: none;
}

.log-box li,
.schedule-box li {
  font-size: 13px;
  margin-bottom: 6px;
}

/* 수정 */
.edit-input,
.edit-select,
.edit-textarea,
.edit-date,
.edit-input-budget {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #4ab8d8;
  padding: 6px 8px;
  font-size: 13px;
  outline: none;
  background: #fff;
  margin-top: 4px;
}

.edit-textarea {
  height: 100px;
  resize: none;
  line-height: 1.5;
  display: block;
}

.date-edit-group {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
}

.edit-date {
  flex: 1;
  font-size: 12px;
  padding: 4px;
}

.budget-edit-group {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.edit-input-budget {
  margin-top: 0;
  font-weight: 700;
  text-align: right;
}
</style>
