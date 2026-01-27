<template>
  <div class="doc-detail-container">
    <h1 class="page-title">{{ pageTitle }}</h1>

    <div class="top-info-grid">
      <div class="info-card wide">
        <span class="label">프로젝트명</span>
        <div class="value">{{ form.projectName }}</div>
      </div>
      <div class="info-card">
        <span class="label">프로젝트 기간</span>
        <div class="value">{{ form.period }}</div>
      </div>
      <div class="info-card">
        <span class="label">고객/협력사</span>
        <div class="value">{{ form.client }}</div>
      </div>
      <div class="info-card">
        <span class="label">담당자</span>
        <div class="value">{{ form.manager }}</div>
      </div>
      <div class="info-card">
        <span class="label">주차</span>
        <div class="value">{{ form.week }}</div>
      </div>
      <div class="info-card">
        <span class="label">보고자</span>
        <div class="value">{{ form.reporter }}</div>
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
          <span class="percent">{{ form.progress }}%</span>
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

    <div class="bottom-actions">
      <template v-if="isEditing">
        <button class="btn-grey" @click="isEditing = false">취소</button>
        <button class="btn-cyan" @click="handleSave">저장</button>
      </template>

      <template v-else>
        <button class="btn-grey">검토 보류</button>
        <button class="btn-outline" @click="handleDelete">삭제</button>
        <button class="btn-outline" @click="toggleEditMode">수정</button>
        <button class="btn-red">PDF 출력</button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, computed, onMounted} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from '@/lib/axios';
import { fetchProjectDetail } from '@/api/project';

const route = useRoute();
const router = useRouter();

const projectId = route.params.projectId;
const reportId = route.params.docId;

const pageTitle = computed(() => {
  if (route.params.type === 'weekly') return '주간보고 상세';
  if (route.params.type === 'meeting') return '회의록 상세';
  if (form.week) return '주간보고 상세';

  return '상세 보기';
});

const form = reactive({
  projectName: '',
  period: '',
  client: '',
  manager: '',
  week: '',
  reporter: '',
  progress: 0
});

// 태스크 데이터 리스트
const completedTasks = ref([]);
const uncompletedTasks = ref([]);
const nextWeekTasks = ref([]);

const expandedRow = ref<number | null>(null);
const isEditing = ref(false);

const getProjectInfo = async () => {
  try {
    const res = await fetchProjectDetail(projectId);
    const p = res.data.data || res.data;

    form.projectName = p.name || p.projectName;
    form.client = p.partners || '고객사 정보 없음';
    form.manager = p.managerName || 'PM 정보 없음';

    if (!form.period || form.period.includes('undefined')) {
      form.period = `${p.startDate} ~ ${p.endDate}`;
    }
  } catch (e) {
    console.error('프로젝트 메타 정보 로드 실패:', e);
  }
};

const fetchDetail = async () => {
  try {
    console.log('🔥 fetchDetail CALLED');
    const response = await axios.get(
        `/api/projects/${projectId}/docs/report/${reportId}`
    );
    console.log('🔥 RAW RESPONSE:', response.data);

    const data = response.data.data;
    console.log('🔥 data keys:', Object.keys(data));
    console.log('🔥 completedTasks raw:', data.completedTasks);
    console.log('🔥 incompleteTasks raw:', data.incompleteTasks);


    form.week = data.weekLabel ?? '-';
    form.reporter = data.reporterName ?? '-';
    form.progress = Math.round(data.taskCompletionRate ?? 0);
    form.period = `${data.weekStartDate} ~ ${data.weekEndDate}`;

    completedTasks.value = (data.completedTasks ?? []).map(t => ({
      name: t.taskName,
      manager: t.managerName,
      type: t.taskCategory,
      note: t.note || ''
    }));

    uncompletedTasks.value = (data.incompleteTasks ?? []).map(t => ({
      name: t.taskName,
      manager: t.managerName,
      type: t.taskCategory,
      delay: t.delayDays ? `${t.delayDays}일` : '',
      reason: t.reason || ''
    }));

    await getProjectInfo();

  } catch (error) {
    console.error('데이터 로드 실패:', error);
  }
};

onMounted(() => {
  if (reportId) fetchDetail();
});

const toggleRow = (index: number) => {
  if (isEditing.value) return;
  expandedRow.value = expandedRow.value === index ? null : index;
};

const toggleEditMode = () => { isEditing.value = true; };

// 저장 로직 연결
const handleSave = async () => {
  try {
    const payload = {
      reportId: Number(reportId),
      progressRate: form.progress,
      completedTasks: completedTasks.value,
      uncompletedTasks: uncompletedTasks.value,
      nextWeekTasks: nextWeekTasks.value
    };

    await axios.patch(`/api/projects/${projectId}/docs/report/save`, payload);

    alert('성공적으로 저장되었습니다.');
    isEditing.value = false;
    fetchDetail();
  } catch (error) {
    console.error("저장 실패:", error);
    alert("저장 권한이 없거나 실패했습니다. (PM만 가능)");
  }
};

// 삭제
const handleDelete = async () => {
  if (!confirm("정말 삭제하시겠습니까?")) return;

  try {
    await axios.delete(`/api/projects/${projectId}/docs/report/delete`, {
      data: {
        reportId: Number(reportId)
      }
    });

    alert("삭제되었습니다.");
    router.back(); // 삭제 후 리스트로 이동
  } catch (error) {
    console.error("삭제 실패 상세:", error.response);
    if (error.response?.status === 403) {
      alert("삭제 권한이 없습니다. (PM 권한 필요)");
    } else {
      alert("삭제 처리 중 오류가 발생했습니다.");
    }
  }
};
</script>

<style scoped>
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