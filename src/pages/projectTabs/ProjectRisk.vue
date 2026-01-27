<template>
  <div class="risk-v2-container" v-if="!isLoading">

    <div class="top-summary">
      <div class="summary-info">
        <h3>프로젝트 리스크 현황</h3>
        <p>현재 분석된 리스크는 총 <strong>{{ reports.length }}건</strong>입니다.</p>
      </div>
      <div class="status-chips">
        <div class="chip critical">심각 {{ categorizedReports.high.length }}</div>
        <div class="chip warning">주의 {{ categorizedReports.medium.length }}</div>
        <div class="chip stable">보통 {{ categorizedReports.low.length }}</div>
      </div>
    </div>

    <div class="risk-grid">
      <div v-for="report in reports" :key="report.report_id"
           class="risk-item-card" :class="getStatusColor(report.likelihood * report.impact)">
        <div class="card-side-bar"></div>
        <div class="card-body">
          <div class="card-top">
            <span class="report-id">#{{ report.report_id }}</span>
            <span class="date">{{ new Date(report.generated_at).toLocaleDateString() }}</span>
          </div>
          <h4 class="summary-text">{{ report.summary }}</h4>
          <div class="score-display">
            <div class="score-group">
              <label>L</label> <strong>{{ report.likelihood }}</strong>
            </div>
            <div class="score-group">
              <label>I</label> <strong>{{ report.impact }}</strong>
            </div>
            <div class="total-score">
              Total <span>{{ report.likelihood * report.impact }}</span>
            </div>
          </div>
          <p class="rationale-preview">{{ report.rationale }}</p>
          <button class="view-detail-btn" @click="selectedReport = report; isModalOpen = true">
            상세 분석 결과 보기
          </button>
        </div>
      </div>
    </div>

    <RiskDetailModal
        :isOpen="isModalOpen"
        :report="selectedReport"
        @close="isModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import RiskDetailModal from "@/components/common/RiskDetailModal.vue";

const reports = ref<any[]>([]);
const isLoading = ref(true);
const isModalOpen = ref(false);
const selectedReport = ref<any>(null);

// 1. 전체 리포트 중 가장 높은 위험도 점수 계산
const maxRiskScore = computed(() => {
  if (reports.value.length === 0) return 0;
  return Math.max(...reports.value.map(r => r.likelihood * r.impact));
});

// 2. 위험도별 리포트 분류 (UI 배치를 위해)
const categorizedReports = computed(() => {
  return {
    high: reports.value.filter(r => r.likelihood * r.impact >= 12),
    medium: reports.value.filter(r => r.likelihood * r.impact >= 8 && r.likelihood * r.impact < 12),
    low: reports.value.filter(r => r.likelihood * r.impact < 8)
  };
});

onMounted(() => {
  setTimeout(() => {
    reports.value = [
      { report_id: 104, likelihood: 4, impact: 3, summary: "외부 벤더 응답 지연으로 인한 통합 테스트 일정 지연", rationale: "핵심 API 지연 보고됨", generated_at: "2026-01-26T17:53:58" },
      { report_id: 103, likelihood: 5, impact: 4, summary: "테스트 서버 인프라 다운 이슈", rationale: "Qdrant 연결 상태 불안정", generated_at: "2026-01-26T17:50:00" },
      { report_id: 102, likelihood: 3, impact: 2, summary: "API 스펙 변경으로 인한 프론트엔드 재작업", rationale: "스키마 변경 로그 확인", generated_at: "2026-01-25T14:30:00" },
      { report_id: 101, likelihood: 2, impact: 2, summary: "리소스 부족: 핵심 개발자 병가", rationale: "회의록 인용", generated_at: "2026-01-24T09:00:00" },
    ];
    isLoading.value = false;
  }, 500);
});

const getStatusColor = (score: number) => {
  if (score >= 12) return 'critical';
  if (score >= 8) return 'warning';
  return 'stable';
};
</script>

<style scoped>
.risk-v2-container { padding: 0 20px; display: flex; flex-direction: column; gap: 24px; }

/* 상단 요약 스타일 */
.top-summary { display: flex; justify-content: space-between; align-items: flex-end; }
.top-summary h3 { margin: 0 0 8px 0; font-size: 22px; color: #0f172a; }
.top-summary p { margin: 0; color: #64748b; font-size: 14px; }
.status-chips { display: flex; gap: 8px; }
.chip { padding: 6px 12px; border-radius: 100px; font-size: 12px; font-weight: 700; border: 1px solid transparent; }
.chip.critical { background: #fee2e2; color: #ef4444; border-color: #fca5a5; }
.chip.warning { background: #fef3c7; color: #d97706; border-color: #fcd34d; }
.chip.stable { background: #f0fdf4; color: #22c55e; border-color: #86efac; }

/* 그리드 레이아웃 */
.risk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }

/* 카드 개별 스타일 */
.risk-item-card {
  background: white; border-radius: 16px; overflow: hidden; display: flex;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: transform 0.2s;
}
.risk-item-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
.card-side-bar { width: 6px; }

/* 위험도별 사이드바 색상 */
.critical .card-side-bar { background: #ef4444; }
.warning .card-side-bar { background: #f59e0b; }
.stable .card-side-bar { background: #10b981; }

.card-body { padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 12px; }
.card-top { display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; font-weight: 600; }
.summary-text { margin: 0; font-size: 16px; color: #1e293b; line-height: 1.4; height: 44px; overflow: hidden; }

.score-display {
  display: flex; align-items: center; gap: 12px; padding: 10px; background: #f8fafc; border-radius: 8px;
}
.score-group { font-size: 12px; color: #64748b; }
.score-group strong { color: #0f172a; font-size: 14px; margin-left: 4px; }
.total-score { margin-left: auto; font-size: 12px; font-weight: 700; color: #4f46e5; }
.total-score span { font-size: 18px; }

.rationale-preview { font-size: 13px; color: #64748b; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.view-detail-btn {
  margin-top: 8px; width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;
  background: white; color: #475569; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s;
}
.view-detail-btn:hover { background: #f1f5f9; color: #0f172a; }
</style>