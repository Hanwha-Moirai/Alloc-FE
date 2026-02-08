<template>
  <div class="risk-v2-container" v-if="!isLoading">

    <div class="top-summary">
      <div class="summary-info">
        <h3 class="analysis-title">프로젝트 리스크 현황</h3>
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
          <button class="view-detail-btn" @click="openDetail(report)">
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
import { computed, ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import RiskDetailModal from "@/components/common/RiskDetailModal.vue";
import { fetchRiskReportDetail, fetchRiskReports } from "@/api/risk";

const props = defineProps({
  refreshTrigger: {
    type: Number,
    default: 0,
  },
});

const route = useRoute();
const projectId = Number(route.params.projectId);

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

const loadReports = async () => {
  isLoading.value = true;
  if (!projectId) {
    console.error("Missing projectId in route params");
    reports.value = [];
    isLoading.value = false;
    return;
  }
  try {
    const { data } = await fetchRiskReports(projectId);
    const items = Array.isArray(data?.items) ? data.items : [];
    reports.value = items.map((item: any) => ({
      ...item,
      rationale: item.rationale ?? "",
    }));
  } catch (err) {
    console.error("Failed to load risk reports", err);
    reports.value = [];
  } finally {
    isLoading.value = false;
  }
};

const openDetail = async (report: any) => {
  try {
    const { data } = await fetchRiskReportDetail(projectId, report.report_id);
    selectedReport.value = data;
  } catch (err) {
    console.error("Failed to load risk report detail", err);
    selectedReport.value = report;
  } finally {
    isModalOpen.value = true;
  }
};

onMounted(() => {
  loadReports();
});

watch(
  () => props.refreshTrigger,
  () => {
    loadReports();
  }
);

const getStatusColor = (score: number) => {
  if (score >= 12) return 'critical';
  if (score >= 8) return 'warning';
  return 'stable';
};
</script>

<style scoped>
.risk-v2-container { display: flex; flex-direction: column; gap: 24px; }
.analysis-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  position: relative;
  padding-left: 10px;
}

.analysis-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  width: 3px;
  height: 18px;
  background: #4ab8d8;
  border-radius: 2px;
}

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
