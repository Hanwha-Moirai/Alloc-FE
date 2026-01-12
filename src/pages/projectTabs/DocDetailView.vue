<template>
  <div class="doc-detail-container">
    <h1 class="page-title">{{ pageTitle }}</h1>

    <div class="top-info-grid">
      <div class="info-card wide">
        <span class="label">프로젝트명</span>
        <div class="value">트래픽 모니터링 및 장애 대응 고도화</div>
      </div>
      <div class="info-card">
        <span class="label">프로젝트 기간</span>
        <div class="value">2026.01.06 - 2026.01.25</div>
      </div>
      <div class="info-card">
        <span class="label">고객/협력사</span>
        <div class="value">삼성전자</div>
      </div>
      <div class="info-card">
        <span class="label">담당자</span>
        <div class="value">김현수</div>
      </div>
      <div class="info-card">
        <span class="label">주차</span>
        <div class="value">2025 FEB 12</div>
      </div>
      <div class="info-card">
        <span class="label">보고자</span>
        <div class="value">김현수</div>
      </div>
    </div>

    <div class="section-card chart-section">
      <h3 class="section-title">금주 진행사항</h3>
      <div class="chart-legend">
        <span class="dot done"></span> 완료
        <span class="dot pending"></span> 미완
      </div>
      <div class="chart-container">
        <div class="progress-circle" style="--p:67; --c:#23cc66;">
          <span class="percent">67%</span>
        </div>
      </div>
    </div>

    <div class="section-card">
      <h3 class="section-title">완수 태스크</h3>
      <table class="task-table">
        <thead>
        <tr>
          <th>태스크명 ↓</th>
          <th>담당자</th>
          <th>태스크 유형</th>
          <th>비고</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td class="text-left">로그 기반 이상 트래픽 자동 감지 알림 시스...</td>
          <td>김현수</td>
          <td>개발</td>
          <td>log 변경됨</td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="section-card">
      <h3 class="section-title">미완수 태스크</h3>
      <table class="task-table accordion-table">
        <thead>
        <tr>
          <th>태스크명 ↓</th>
          <th>담당자</th>
          <th>태스크 유형</th>
          <th>지연 경과</th>
          <th style="width: 250px">지연 사유</th>
        </tr>
        </thead>
        <tbody>
        <template v-for="(item, index) in uncompletedTasks" :key="index">
          <tr
              class="clickable-row"
              :class="{ 'active-row': expandedRow === index }"
              @click="toggleRow(index)"
          >
            <td class="text-left">{{ item.name }}</td>
            <td>{{ item.manager }}</td>
            <td>{{ item.type }}</td>
            <td>{{ item.delay }}</td>
            <td class="text-left">
              <div class="reason-ellipsis" v-if="expandedRow !== index">
                {{ item.reason }}
              </div>
              <span v-else class="status-text center-text">상세 보기 중 ▲</span>
            </td>
          </tr>
          <tr v-if="expandedRow === index" class="detail-row">
            <td colspan="5">
              <div class="detail-content">
                <div class="detail-item">
                  <span class="detail-label">지연 사유 전문</span>
                  <p class="detail-text">{{ item.reason }}</p>
                </div>
              </div>
            </td>
          </tr>
        </template>
        </tbody>
      </table>
    </div>

    <div class="section-card">
      <h3 class="section-title">다음주 진행사항</h3>
      <table class="task-table">
        <thead>
        <tr>
          <th>태스크명 ↓</th>
          <th>담당자</th>
          <th>지연 경과</th>
          <th>생성 날짜</th>
          <th>최신 수정 날짜</th>
          <th style="width: 40px">+</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td class="text-left">로그 기반 이상 트래픽 자동 감지 알림 시스...</td>
          <td>2025. 12. 24</td>
          <td>506543</td>
          <td>2025. 12. 24</td>
          <td>2025. 12. 31</td>
          <td></td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="bottom-actions">
      <template v-if="isEditing">
        <button class="btn-grey" @click="isEditing = false">취소</button>
        <button class="btn-cyan" @click="handleSave">저장</button>
      </template>

      <template v-else>
        <button class="btn-grey">검토 보류</button>
        <button class="btn-outline">삭제</button>
        <button class="btn-outline" @click="toggleEditMode">수정</button>
        <button class="btn-red">PDF 출력</button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const { type } = route.params;

const pageTitle = computed(() => {
  return type === 'weekly' ? '주간보고 상세' : '회의록 상세';
});

const uncompletedTasks = ref([
  {
    name: '로그 기반 이상 트래픽 자동 감지 알림 시스...',
    manager: '김현수',
    type: '개발',
    delay: '3일',
    reason: '초기 기획 단계에서 정의된 로그 수집 방식과 현재 시스템의 로그 포맷이 상이하여 정규식 재설계가 필요함. 이로 인해 분석 엔진 적용이 약 3일간 지연되었습니다.'
  },
  {
    name: 'DB 클러스터링 모니터링 모듈 통합 테스트',
    manager: '이민아',
    type: '테스트',
    delay: '1일',
    reason: '스테이징 환경에서의 네트워크 순회 지연 문제로 인해 동기화 테스트가 예정보다 늦게 시작되었습니다.'
  }
]);

const expandedRow = ref<number | null>(null);

const toggleRow = (index: number) => {
  expandedRow.value = expandedRow.value === index ? null : index;
};

const isEditing = ref(false); // 초기값은 '보기 모드'

const toggleEditMode = () => {
  isEditing.value = !isEditing.value;
};

const handleSave = () => {
  // 여기서 서버 저장 로직 수행 (API 호출 등)
  alert('저장되었습니다.');
  isEditing.value = false; // 저장 후 다시 '보기 모드'로 전환
};
</script>

<style scoped>
.page-title { font-size: 22px; font-weight: 700; margin-bottom: 20px; }

/* 상단 정보 카드 그리드 */
.top-info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
.info-card { background: white; border: 1px solid #e5e7eb; padding: 12px 16px; }
.info-card .label { display: block; font-size: 11px; color: #9ca3af; margin-bottom: 4px; }
.info-card .value { font-size: 14px; font-weight: 700; color: #333; }

/* 섹션 공통 */
.section-card { background: white; border: 1px solid #e5e7eb; padding: 20px; margin-bottom: 24px; }
.section-title { font-size: 14px; font-weight: 700; margin: 0 0 16px 0; color: #333; }

/* 차트 영역 */
.chart-section { position: relative; text-align: center; }
.chart-legend { position: absolute; top: 20px; left: 20px; font-size: 12px; color: #666; }
.dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; }
.dot.done { background: #23cc66; }
.dot.pending { background: #e5e7eb; }
.chart-container { display: flex; justify-content: center; padding: 20px 0; }
.progress-circle {
  width: 150px; height: 150px; border-radius: 50%;
  background: radial-gradient(closest-side, white 80%, transparent 0% 100%),
  conic-gradient(var(--c) calc(var(--p) * 1%), #e5e7eb 0);
  display: flex; align-items: center; justify-content: center;
}
.progress-circle .percent { font-size: 24px; font-weight: 800; color: #555; }

/* 테이블 스타일 */
.task-table { width: 100%; border-collapse: collapse; font-size: 12px; table-layout: fixed; }
.task-table th { background: #f1f3f6; padding: 10px; border-bottom: 1px solid #e5e7eb; color: #4b5563; }
.task-table td { padding: 12px 10px; border-bottom: 1px solid #f3f4f6; text-align: center; color: #333; }
.text-left { text-align: left !important; }

/* 지연 사유 말줄임 처리 핵심 CSS */
.reason-ellipsis {
  white-space: nowrap;      /* 줄바꿈 금지 */
  overflow: hidden;         /* 넘치는 부분 숨김 */
  text-overflow: ellipsis;  /* ... 표시 */
  max-width: 230px;         /* 너비 제한 (th 너비에 맞춰 조정) */
  color: #666;
}

.status-text {
  color: #4ab8d8;
  font-size: 11px;
  text-align: center;
  display: block;
  width: 100%;
}

/* 아코디언 스타일 */
.clickable-row { cursor: pointer; transition: background-color 0.2s; }
.clickable-row:hover { background-color: #f9fafb; }
.active-row { background-color: #f0f9ff !important; }

.detail-row td { padding: 0 !important; border-bottom: 1px solid #e5e7eb; }
.detail-content {
  background-color: #fcfcfc;
  padding: 16px 20px;
  border-left: 4px solid #4ab8d8;
}
.detail-label { display: block; font-weight: 700; color: #333; margin-bottom: 10px; font-size: 12px; }
.detail-text { color: #666; line-height: 1.6; margin: 0; text-align: left; white-space: normal; }

/* 하단 버튼 */
.bottom-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
.bottom-actions button { padding: 8px 18px; font-size: 13px; cursor: pointer; }
.btn-grey { background: #9ca3af; color: white; border: none; }
.btn-outline { background: white; border: 1px solid #4ab8d8; color: #4ab8d8; }
.btn-cyan { background: #4ab8d8; color: white; border: none; }
.btn-red { background: #ff4d4f; color: white; border: none; }
</style>