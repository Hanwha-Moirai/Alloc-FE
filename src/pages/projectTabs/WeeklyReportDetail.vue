<template>
  <div class="doc-detail-container">
    <h1 class="page-title">{{ pageTitle }}</h1>

    <div class="top-info-grid">
      <div class="info-card wide">
        <span class="label">프로젝트명</span>
        <input v-if="isEditing" v-model="form.projectName" class="edit-input" />
        <div v-else class="value">{{ form.projectName }}</div>
      </div>
      <div class="info-card">
        <span class="label">프로젝트 기간</span>
        <input v-if="isEditing" v-model="form.period" class="edit-input" />
        <div v-else class="value">{{ form.period }}</div>
      </div>
      <div class="info-card">
        <span class="label">고객/협력사</span>
        <input v-if="isEditing" v-model="form.client" class="edit-input" />
        <div v-else class="value">{{ form.client }}</div>
      </div>
      <div class="info-card">
        <span class="label">담당자</span>
        <input v-if="isEditing" v-model="form.manager" class="edit-input" />
        <div v-else class="value">{{ form.manager }}</div>
      </div>
      <div class="info-card">
        <span class="label">주차</span>
        <input v-if="isEditing" v-model="form.week" class="edit-input" />
        <div v-else class="value">{{ form.week }}</div>
      </div>
      <div class="info-card">
        <span class="label">보고자</span>
        <input v-if="isEditing" v-model="form.reporter" class="edit-input" />
        <div v-else class="value">{{ form.reporter }}</div>
      </div>
    </div>

    <div class="section-card chart-section">
      <h3 class="section-title">금주 진행사항</h3>
      <div class="chart-legend">
        <span class="dot done"></span> 완료
        <span class="dot pending"></span> 미완
      </div>
      <div class="chart-container">
        <div class="progress-circle" :style="`--p:${form.progress}; --c:#23cc66;`">
          <div v-if="isEditing" class="edit-progress-box">
            <input v-model="form.progress" type="number" class="percent-input" /> %
          </div>
          <span v-else class="percent">{{ form.progress }}%</span>
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
        <tr v-for="(task, idx) in completedTasks" :key="idx">
          <td class="text-left">
            <input v-if="isEditing" v-model="task.name" class="edit-input-table" />
            <span v-else>{{ task.name }}</span>
          </td>
          <td>
            <input v-if="isEditing" v-model="task.manager" class="edit-input-table" />
            <span v-else>{{ task.manager }}</span>
          </td>
          <td>
            <input v-if="isEditing" v-model="task.type" class="edit-input-table" />
            <span v-else>{{ task.type }}</span>
          </td>
          <td>
            <input v-if="isEditing" v-model="task.note" class="edit-input-table" />
            <span v-else>{{ task.note }}</span>
          </td>
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
          <tr class="clickable-row" :class="{ 'active-row': expandedRow === index }" @click="toggleRow(index)">
            <td class="text-left">
              <input v-if="isEditing" v-model="item.name" class="edit-input-table" @click.stop />
              <span v-else>{{ item.name }}</span>
            </td>
            <td>
              <input v-if="isEditing" v-model="item.manager" class="edit-input-table" @click.stop />
              <span v-else>{{ item.manager }}</span>
            </td>
            <td>
              <input v-if="isEditing" v-model="item.type" class="edit-input-table" @click.stop />
              <span v-else>{{ item.type }}</span>
            </td>
            <td>
              <input v-if="isEditing" v-model="item.delay" class="edit-input-table" @click.stop />
              <span v-else>{{ item.delay }}</span>
            </td>
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
                  <textarea v-if="isEditing" v-model="item.reason" class="edit-textarea"></textarea>
                  <p v-else class="detail-text">{{ item.reason }}</p>
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
        </tr>
        </thead>
        <tbody>
        <tr v-for="(next, idx) in nextWeekTasks" :key="idx">
          <td class="text-left">
            <input v-if="isEditing" v-model="next.name" class="edit-input-table" />
            <span v-else>{{ next.name }}</span>
          </td>
          <td>
            <input v-if="isEditing" v-model="next.manager" class="edit-input-table" />
            <span v-else>{{ next.manager }}</span>
          </td>
          <td>
            <input v-if="isEditing" v-model="next.delay" class="edit-input-table" />
            <span v-else>{{ next.delay }}</span>
          </td>
          <td>
            <input v-if="isEditing" v-model="next.created" class="edit-input-table" />
            <span v-else>{{ next.created }}</span>
          </td>
          <td>
            <input v-if="isEditing" v-model="next.updated" class="edit-input-table" />
            <span v-else>{{ next.updated }}</span>
          </td>
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
import { ref, reactive, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const { type } = route.params;

const pageTitle = computed(() => {
  // 1순위: URL 파라미터 체크
  if (route.params.type === 'weekly') return '주간보고 상세';
  if (route.params.type === 'meeting') return '회의록 상세';

  // 2순위: 데이터 필드 기반 체크 (주간보고에만 있는 '주차' 정보 등)
  if (form.week) return '주간보고 상세';

  return '상세 보기';
});

// 1. 공통 정보 데이터 (form)
const form = reactive({
  projectName: '트래픽 모니터링 및 장애 대응 고도화',
  period: '2026.01.06 - 2026.01.25',
  client: '삼성전자',
  manager: '김현수',
  week: '2025 FEB 12',
  reporter: '김현수',
  progress: 67
});

// 2. 완수 태스크 데이터
const completedTasks = ref([
  { name: '로그 기반 이상 트래픽 자동 감지 알림 시스...', manager: '김현수', type: '개발', note: 'log 변경됨' }
]);

// 3. 미완수 태스크 데이터
const uncompletedTasks = ref([
  {
    name: '로그 기반 이상 트래픽 자동 감지 알림 시스...',
    manager: '김현수',
    type: '개발',
    delay: '3일',
    reason: '초기 기획 단계에서 정의된 로그 수집 방식과 현재 시스템의 로그 포맷이 상이하여 정규식 재설계가 필요함.'
  }
]);

// 4. 다음주 진행사항 데이터
const nextWeekTasks = ref([
  {
    name: '로그 기반 이상 트래픽 자동 감지 알림 시스...',
    manager: '2025. 12. 24',
    delay: '506543',
    created: '2025. 12. 24',
    updated: '2025. 12. 31'
  }
]);

const expandedRow = ref<number | null>(null);
const isEditing = ref(false);

const toggleRow = (index: number) => {
  if (isEditing.value) return; // 수정 중에는 토글 방지 (선택 사항)
  expandedRow.value = expandedRow.value === index ? null : index;
};

const toggleEditMode = () => { isEditing.value = true; };
const handleSave = () => {
  alert('성공적으로 저장되었습니다.');
  isEditing.value = false;
};
</script>

<style scoped>
/* 입력창 디자인 스타일 */
.edit-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #4ab8d8;
  padding: 6px 8px;
  font-size: 14px;
  font-weight: 700;
  color: #333;
  margin-top: 4px;
  outline: none;
}
.edit-input-table { width: 95%; border: 1px solid #4ab8d8; padding: 4px; font-size: 12px; text-align: center; }
.edit-textarea { width: 100%; height: 80px; border: 1px solid #4ab8d8; padding: 10px; font-size: 12px; resize: none; border-radius: 4px; }
.edit-progress-box { display: flex; align-items: center; gap: 4px; font-weight: 800; color: #555; }
.percent-input { width: 50px; text-align: center; border: 1px solid #4ab8d8; font-size: 18px; font-weight: 800; }

/* 레이아웃 & 공통 스타일 */
.page-title { font-size: 22px; font-weight: 700; margin-bottom: 20px; }
.top-info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
.info-card { background: white; border: 1px solid #e5e7eb; padding: 12px 16px; display: flex; flex-direction: column; justify-content: center; }
.info-card .label { display: block; font-size: 12px; color: #9ca3af; margin-bottom: 4px; }
.info-card .value { font-size: 14px; font-weight: 700; color: #333; }

.section-card { background: white; border: 1px solid #e5e7eb; padding: 20px; margin-bottom: 24px; }
.section-title { font-size: 14px; font-weight: 700; margin: 0 0 16px 0; color: #333; }

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

.task-table { width: 100%; border-collapse: collapse; font-size: 12px; table-layout: fixed; }
.task-table th { background: #f1f3f6; padding: 10px; border-bottom: 1px solid #e5e7eb; color: #4b5563; }
.task-table td { padding: 12px 10px; border-bottom: 1px solid #f3f4f6; text-align: center; color: #333; overflow: hidden; }
.text-left { text-align: left !important; }

.reason-ellipsis { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 230px; color: #666; }
.status-text { color: #4ab8d8; font-size: 11px; text-align: center; display: block; width: 100%; }
.clickable-row { cursor: pointer; transition: background-color 0.2s; }
.active-row { background-color: #f0f9ff !important; }

.detail-row td { padding: 0 !important; border-bottom: 1px solid #e5e7eb; }
.detail-content { background-color: #fcfcfc; padding: 16px 20px; border-left: 4px solid #4ab8d8; }
.detail-label { display: block; font-weight: 700; color: #333; margin-bottom: 10px; font-size: 12px; }
.detail-text { color: #666; line-height: 1.6; margin: 0; text-align: left; white-space: normal; }

.bottom-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
.bottom-actions button { padding: 8px 18px; font-size: 13px; cursor: pointer; }
.btn-grey { background: #9ca3af; color: white; border: none; }
.btn-outline { background: white; border: 1px solid #4ab8d8; color: #4ab8d8; }
.btn-cyan { background: #4ab8d8; color: white; border: none; }
.btn-red { background: #ff4d4f; color: white; border: none; }
</style>