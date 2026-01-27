<script setup lang="ts">
import { computed, ref, onMounted } from "vue";

const reports = ref<any[]>([]);
const isLoading = ref(true);

// 상단 요약 데이터 (가장 최근 리포트 기준)
const latestSummary = computed(() => {
  if (reports.value.length === 0) return { likelihood: 0, impact: 0, score: 0, level: '-' };
  const latest = reports.value[0];
  const score = latest.likelihood * latest.impact;
  let level = score >= 12 ? '높음' : score >= 8 ? '보통' : '낮음';
  return { ...latest, score, level };
});

// 중단 표를 위한 추이 데이터 (최근 5~6개)
const trendTableData = computed(() => {
  return reports.value.slice(0, 6).map((r, idx, arr) => {
    const currentScore = r.likelihood * r.impact;
    const prevScore = arr[idx + 1] ? arr[idx + 1].likelihood * arr[idx + 1].impact : currentScore;
    const diff = currentScore - prevScore; // 이전 대비 증감
    return { ...r, score: currentScore, diff };
  });
});

// SVG 경로 생성을 위한 헬퍼 함수
const generatePath = (isArea: boolean) => {
  const data = trendTableData.value.slice().reverse();
  if (data.length === 0) return "";

  const width = 500;
  const height = 120;
  const maxScore = 25; // 최대 가능 점수 (5x5)

  const points = data.map((item, i) => {
    const x = i * (width / (data.length - 1));
    const y = height - (item.score / maxScore * (height - 20)) - 10;
    return { x, y };
  });

  // 큐빅 베지어 곡선 경로 생성 (image_9e03f8.png의 부드러운 느낌)
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cpX = (curr.x + next.x) / 2;
    d += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
  }

  if (isArea) {
    d += ` L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
  }
  return d;
};

onMounted(() => {
  setTimeout(() => {
    reports.value = [
      { report_id: 1, likelihood: 4, impact: 3, summary: "외부 벤더 응답 지연 및 리소스 부족", generated_at: "2026-01-26T17:53:58" },
      { report_id: 2, likelihood: 3, impact: 3, summary: "테스트 환경 불안정 이슈 발생", generated_at: "2026-01-19T10:20:00" },
      { report_id: 3, likelihood: 4, impact: 2, summary: "API 스펙 변경으로 인한 재작업", generated_at: "2026-01-12T14:30:00" },
      { report_id: 4, likelihood: 2, impact: 2, summary: "프로젝트 초기 설정 완료", generated_at: "2026-01-05T09:00:00" },
    ];
    isLoading.value = false;
  }, 500);
});

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
</script>

<template>
  <div class="dashboard-container" v-if="!isLoading">

    <div class="summary-row">
      <div class="stat-card main">
        <p class="label">현재 리스크 수준</p>
        <div class="val-row">
          <span class="score">{{ latestSummary.score }}</span>
          <span class="level-tag" :class="latestSummary.level">{{ latestSummary.level }}위험</span>
        </div>
      </div>
      <div class="stat-card">
        <p class="label">발생 가능성</p>
        <div class="val-row">
          <span class="num">{{ latestSummary.likelihood }}</span><span class="total">/ 5</span>
        </div>
      </div>
      <div class="stat-card">
        <p class="label">영향도</p>
        <div class="val-row">
          <span class="num">{{ latestSummary.impact }}</span><span class="total">/ 5</span>
        </div>
      </div>
    </div>

    <div class="content-card">
      <div class="card-header">
        <div class="title-group">
          <h4>주차별 리스크 변동 추이</h4>
          <span class="sub-info">최근 6회 리포트의 종합 점수 변화</span>
        </div>
        <div class="chart-legend">
          <span class="dot"></span> 점수(L×I)
        </div>
      </div>

      <div class="visual-chart-container">
        <div class="y-axis-guides">
          <div v-for="n in 4" :key="n" class="guide-line"></div>
        </div>

        <svg class="trend-svg" viewBox="0 0 500 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chart-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:rgba(99, 102, 241, 0.4); stop-opacity:1" />
              <stop offset="100%" style="stop-color:rgba(99, 102, 241, 0); stop-opacity:1" />
            </linearGradient>
          </defs>

          <path
              class="chart-area"
              :d="generatePath(true)"
              fill="url(#chart-grad)"
          />

          <path
              class="chart-line"
              :d="generatePath(false)"
              fill="none"
              stroke="#6366f1"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
          />
        </svg>

        <div class="points-layer">
          <div
              v-for="(item, idx) in trendTableData.slice().reverse()"
              :key="idx"
              class="data-point-wrapper"
              :style="{ left: (idx * (100 / (trendTableData.length - 1))) + '%' }"
          >
            <div class="point-dot" :style="{ bottom: (item.score / 25 * 100) + 'px' }">
              <span class="point-val">{{ item.score }}</span>
            </div>
            <div class="x-axis-label">{{ formatDate(item.generated_at) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="content-card">
      <div class="card-header">
        <h4>리스크 리포트 히스토리</h4>
      </div>
      <div class="list-wrapper">
        <div v-for="report in reports" :key="report.report_id" class="list-item">
          <div class="item-date">{{ formatDate(report.generated_at) }}</div>
          <div class="item-content">
            <div class="item-summary">{{ report.summary }}</div>
            <div class="item-meta">점수: {{ report.likelihood * report.impact }} | {{ report.report_id }}번 리포트</div>
          </div>
          <button class="detail-btn">리포트 보기</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.dashboard-container { display: flex; flex-direction: column; gap: 20px; background: #f4f7fa; }

/* 공통 카드 */
.content-card { background: white; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.03); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.card-header h4 { margin: 0; font-size: 16px; color: #334155; }
.sub-info { font-size: 12px; color: #94a3b8; }

/* 상단 요약 */
.summary-row { display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 15px; }
.stat-card { background: white; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.03); }
.stat-card.main { background: #6366f1; color: white; }
.stat-card.main .label { color: #e0e7ff; }
.label { font-size: 13px; color: #64748b; margin-bottom: 10px; }
.val-row { display: flex; align-items: baseline; gap: 4px; }
.score { font-size: 32px; font-weight: 800; }
.num { font-size: 24px; font-weight: 700; }
.total { font-size: 14px; opacity: 0.7; }
.level-tag { margin-left: auto; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; background: rgba(255,255,255,0.5); }

/* 중단 추이 표 */
.visual-chart-container {
  height: 180px;
  position: relative;
  margin-top: 30px;
  padding: 0 10px;
}

.y-axis-guides {
  position: absolute;
  width: 100%;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 0;
}

.guide-line {
  width: 100%;
  height: 1px;
  background: #f1f5f9;
}

.trend-svg {
  width: 100%;
  height: 100px;
  overflow: visible;
  z-index: 1;
  position: relative;
}

.points-layer {
  position: absolute;
  top: 0;
  left: 10px;
  right: 10px;
  height: 100px;
}

.data-point-wrapper {
  position: absolute;
  height: 100%;
  width: 1px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.point-dot {
  position: absolute;
  width: 10px;
  height: 10px;
  background: white;
  border: 3px solid #6366f1;
  border-radius: 50%;
  z-index: 2;
  transform: translateY(50%);
}

.point-val {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 800;
  color: #6366f1;
  background: #eef2ff;
  padding: 2px 6px;
  border-radius: 4px;
}

.x-axis-label {
  position: absolute;
  bottom: -35px;
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
}

.chart-legend {
  font-size: 12px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.chart-legend .dot {
  width: 8px;
  height: 8px;
  background: #6366f1;
  border-radius: 50%;
}

/* 하단 목록 */
.list-wrapper { display: flex; flex-direction: column; gap: 10px; }
.list-item { display: flex; align-items: center; padding: 15px; border: 1px solid #f1f5f9; border-radius: 12px; transition: 0.2s; }
.list-item:hover { border-color: #6366f1; background: #f8faff; }
.item-date { width: 60px; font-size: 13px; font-weight: 700; color: #6366f1; }
.item-content { flex: 1; padding: 0 15px; }
.item-summary { font-size: 14px; color: #334155; margin-bottom: 4px; font-weight: 500; }
.item-meta { font-size: 12px; color: #94a3b8; }
.detail-btn { padding: 8px 16px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; font-size: 12px; cursor: pointer; }
</style>