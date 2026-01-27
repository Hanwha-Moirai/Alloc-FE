<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <div class="header-left">
            <span class="report-tag">Report #{{ report.report_id }}</span>
            <h2>리스크 상세 분석 결과</h2>
          </div>
          <button class="close-btn" @click="emit('close')">×</button>
        </div>

        <div class="modal-body" v-if="report">
          <div class="score-viz-section">
            <div class="main-score-card" :class="riskLevel.class">
              <span class="label">종합 위험도</span>
              <div class="score-val">{{ report.likelihood * report.impact }}</div>
              <span class="level-text">{{ riskLevel.text }} 상태</span>
            </div>

            <div class="detail-scores">
              <div class="gauge-item">
                <div class="gauge-info">
                  <label>발생 가능성 (Likelihood)</label>
                  <span>{{ report.likelihood }} / 5</span>
                </div>
                <div class="gauge-bar"><div class="fill" :style="{width: (report.likelihood/5*100)+'%'}"></div></div>
              </div>
              <div class="gauge-item">
                <div class="gauge-info">
                  <label>영향도 (Impact)</label>
                  <span>{{ report.impact }} / 5</span>
                </div>
                <div class="gauge-bar"><div class="fill purple" :style="{width: (report.impact/5*100)+'%'}"></div></div>
              </div>
            </div>
          </div>

          <div class="analysis-section">
            <div class="section-title">AI 분석 요약</div>
            <p class="summary-box">{{ report.summary }}</p>

            <div class="section-title">판단 근거 (Rationale)</div>
            <div class="rationale-box">
              {{ report.rationale }}
            </div>
          </div>

          <div class="citations-section">
            <div class="section-title">근거 데이터 ({{ report.citations?.length || 0 }})</div>
            <div class="citation-list">
              <div v-for="(cite, idx) in report.citations" :key="idx" class="citation-item">
                <div class="cite-meta">
                  <span class="cite-icon">{{ getSourceIcon(cite.source_type) }}</span>
                  <span class="cite-type">{{ cite.source_type }}</span>
                  <span class="cite-id">ID: {{ cite.source_id }}</span>
                </div>
                <p class="cite-excerpt">"{{ cite.excerpt }}"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  report: any;
}>();

const emit = defineEmits(['close']);

// 위험도 레벨 계산 [cite: 13]
const riskLevel = computed(() => {
  if (!props.report) return { text: '-', class: 'stable' };
  const score = props.report.likelihood * props.report.impact;
  if (score >= 12) return { text: '심각', class: 'critical' };
  if (score >= 8) return { text: '주의', class: 'warning' };
  return { text: '안정', class: 'stable' };
});

// 출처 타입별 아이콘 매핑 [cite: 13, 14, 15]
const getSourceIcon = (type: string) => {
  const icons: Record<string, string> = {
    weekly_report: '📊',
    meeting_record: '🤝',
    events_log: '🕒',
    task_update_log: '📝',
    project_document: '📄',
    vector_evidence: '🔍'
  };
  return icons[type] || '📎';
};
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}

.modal-content {
  background: white; width: 90%; max-width: 800px; max-height: 90vh;
  border-radius: 10px; display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  padding: 24px; border-bottom: 1px solid #f1f5f9;
  display: flex; justify-content: space-between; align-items: center;
}

.report-tag { font-size: 12px; font-weight: 700; color: #6366f1; background: #eef2ff; padding: 4px 8px; border-radius: 6px; }
.modal-header h2 { margin: 8px 0 0 0; font-size: 20px; color: #1e293b; }

.modal-body { padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 32px; }

/* 점수 시각화 */
.score-viz-section { display: grid; grid-template-columns: 180px 1fr; gap: 24px; }
.main-score-card {
  border-radius: 20px; padding: 20px; text-align: center; color: white;
  display: flex; flex-direction: column; justify-content: center;
}
.main-score-card.critical { background: linear-gradient(135deg, #ef4444, #b91c1c); }
.main-score-card.warning { background: linear-gradient(135deg, #f59e0b, #d97706); }
.main-score-card.stable { background: linear-gradient(135deg, #10b981, #047857); }

.score-val { font-size: 48px; font-weight: 800; line-height: 1; margin: 8px 0; }
.level-text { font-size: 14px; font-weight: 600; opacity: 0.9; }

.detail-scores { display: flex; flex-direction: column; justify-content: center; gap: 16px; }
.gauge-info { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; font-weight: 600; color: #475569; }
.gauge-bar { height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
.gauge-bar .fill { height: 100%; background: #6366f1; }
.gauge-bar .fill.purple { background: #a855f7; }

/* 텍스트 섹션 */
.section-title { font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
.section-title::before { content: ''; width: 4px; height: 16px; background: #6366f1; border-radius: 2px; }

.summary-box { background: #f8fafc; padding: 16px; border-radius: 12px; color: #334155; line-height: 1.6; border-left: 4px solid #e2e8f0; }
.rationale-box { font-size: 14px; color: #475569; line-height: 1.7; white-space: pre-line; }

/* 인용 리스트 */
.citation-list { display: flex; flex-direction: column; gap: 12px; }
.citation-item { padding: 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; }
.cite-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.cite-type { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
.cite-id { font-size: 11px; color: #94a3b8; }
.cite-excerpt { font-size: 13px; color: #1e293b; font-style: italic; margin: 0; }

.close-btn {
  background: none; border: none;
  font-size: 24px; color: #999;
  cursor: pointer; line-height: 1;
}

/* 애니메이션 */
.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>