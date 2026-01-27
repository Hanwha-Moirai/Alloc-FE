<template>
  <div class="doc-detail-container">
    <h1 class="page-title">주간보고 등록</h1>

    <div class="top-info-grid">
      <div class="info-card wide">
        <span class="label">프로젝트명</span>
        <div class="value">{{ projectInfo.projectName }}</div>
      </div>
      <div class="info-card">
        <span class="label">프로젝트 기간</span>
        <div class="value">{{ projectInfo.period }}</div>
      </div>
      <div class="info-card">
        <span class="label">고객/협력사</span>
        <div class="value">{{ projectInfo.client }}</div>
      </div>
      <div class="info-card">
        <span class="label">담당자</span>
        <div class="value">{{ projectInfo.manager }}</div>
      </div>
      <div class="info-card">
        <span class="label">주차</span>
        <div class="value" style="color:#9ca3af">
          등록 시 자동 생성됩니다.
        </div>
      </div>
      <div class="info-card">
        <span class="label">보고자</span>
        <div class="value">로그인 사용자</div>
      </div>
    </div>

    <div class="section-card chart-section">
      <h3 class="section-title">금주 진행사항</h3>
      <div class="chart-legend">
        <span class="dot done"></span> 완료
        <span class="dot pending"></span> 미완
      </div>
      <div class="chart-container">
        <div class="edit-progress-box" style="margin-right: 20px;">
          <input type="number" v-model="form.taskCompletionRate" class="percent-input" min="0" max="100" />
          <span style="font-size: 18px; font-weight: 800;">%</span>
        </div>
        <div class="progress-circle" :style="`--p:${form.taskCompletionRate}; --c:#23cc66;`">
          <span class="percent">{{ form.taskCompletionRate }}%</span>
        </div>
      </div>
    </div>

    <div class="section-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 class="section-title" style="margin: 0;">완수 태스크</h3>
        <button class="btn-outline" @click="addTask('completed')" style="padding: 4px 10px; font-size: 11px;">+ 태스크 추가</button>
      </div>
      <table class="task-table">
        <thead>
        <tr>
          <th>태스크명 ↓</th>
          <th>담당자</th>
          <th>태스크 유형</th>
          <th>비고</th>
          <th style="width: 50px;">삭제</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(task, idx) in form.completedTasks" :key="idx">
          <td class="text-left"><input v-model="task.name" class="edit-input-table" /></td>
          <td><input v-model="task.manager" class="edit-input-table" /></td>
          <td><input v-model="task.type" class="edit-input-table" /></td>
          <td><input v-model="task.note" class="edit-input-table" /></td>
          <td><button @click="removeTask('completed', idx)" style="border:none; background:none; color:#ff4d4f; cursor:pointer;">✕</button></td>
        </tr>
        <tr v-if="form.completedTasks.length === 0">
          <td colspan="5" style="color: #999;">추가된 태스크가 없습니다.</td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="section-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 class="section-title" style="margin: 0;">미완수 태스크</h3>
        <button class="btn-outline" @click="addTask('incomplete')" style="padding: 4px 10px; font-size: 11px;">+ 태스크 추가</button>
      </div>
      <table class="task-table">
        <thead>
        <tr>
          <th>태스크명 ↓</th>
          <th>담당자</th>
          <th>태스크 유형</th>
          <th>지연 경과</th>
          <th style="width: 250px">지연 사유</th>
          <th style="width: 50px;">삭제</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in form.incompleteTasks" :key="index">
          <td class="text-left"><input v-model="item.name" class="edit-input-table" /></td>
          <td><input v-model="item.manager" class="edit-input-table" /></td>
          <td><input v-model="item.type" class="edit-input-table" /></td>
          <td><input v-model="item.delay" class="edit-input-table" /></td>
          <td><input v-model="item.reason" class="edit-input-table" placeholder="사유 입력" /></td>
          <td><button @click="removeTask('incomplete', index)" style="border:none; background:none; color:#ff4d4f; cursor:pointer;">✕</button></td>
        </tr>
        <tr v-if="form.incompleteTasks.length === 0">
          <td colspan="6" style="color: #999;">추가된 태스크가 없습니다.</td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="bottom-actions">
      <button class="btn-grey" @click="router.back()">취소</button>
      <button class="btn-cyan" @click="handleCreate">등록</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchProjectDetail } from '@/api/project';
import { createWeeklyReport, updateWeeklyReport } from '@/api/weeklyReport';
import { getGanttTasks } from '@/api/gantt';


const route = useRoute();
const router = useRouter();
const projectId = route.params.projectId;

// 프로젝트 상단 메타 정보
const projectInfo = reactive({
  projectName: '',
  period: '',
  client: '',
  manager: ''
});

// 생성 폼 데이터
const form = reactive({
  weekLabel: '',
  weekStartDate: '',
  weekEndDate: '',
  taskCompletionRate: 0,
  completedTasks: [],
  incompleteTasks: [],
  summaryText: '',
  changeOfPlan: ''
});

// 지연 경과 계산
const calcDelayDays = (endDate: string) => {
  if (!endDate) return '0일';

  const today = new Date();
  const end = new Date(endDate);

  today.setHours(0,0,0,0);
  end.setHours(0,0,0,0);

  const diff = Math.floor(
      (today.getTime() - end.getTime()) / (1000 * 60 * 60 * 24)
  );

  return diff > 0 ? `${diff}일` : '0일';
};

// 프로젝트 데이터 불러오기
const getProjectInfo = async () => {
  try {
    const res = await fetchProjectDetail(projectId);

    const p = res.data.data || res.data;

    if (p) {
      projectInfo.projectName = p.name || p.projectName || '이름 없음';
      projectInfo.client = p.partners || p.client || '고객사 정보 없음';
      projectInfo.manager = p.managerName || p.manager || 'PM 정보 없음';

      // 날짜가 없을 경우를 대비한 방어 코드
      if (p.startDate && p.endDate) {
        projectInfo.period = `${p.startDate} ~ ${p.endDate}`;
      } else {
        projectInfo.period = '기간 정보 없음';
      }
    }

    console.log("매핑된 프로젝트 정보:", projectInfo);
  } catch (e) {
    console.error('프로젝트 메타 정보 로드 실패:', e);
    alert("프로젝트 정보를 불러올 수 없습니다.");
  }
};

const getProjectTasks = async () => {
  const res = await getGanttTasks(Number(projectId));
  const tasks = res.data.data || res.data || [];

  form.completedTasks = [];
  form.incompleteTasks = [];

  tasks.forEach(task => {
    const isDone =
        task.taskStatus === 'DONE' ||
        task.taskStatus === 'COMPLETED' ||
        task.isCompleted === true;

    if (isDone) {
      form.completedTasks.push({
        taskId: task.taskId,
        name: task.taskName,
        manager: task.userName,
        type: task.taskCategory,
        note: task.taskDescription || ''
      });
    } else {
      form.incompleteTasks.push({
        taskId: task.taskId,
        name: task.taskName,
        manager: task.userName,
        type: task.taskCategory,
        delay: calcDelayDays(task.endDate),
        reason: ''
      });
    }
  });

  // 진행률 자동 계산
  const total = tasks.length;
  const done = form.completedTasks.length;
  form.taskCompletionRate =
      total === 0 ? 0 : Math.round((done / total) * 100);
};

onMounted(() => {
  getProjectInfo();
  getProjectTasks();
});


// 행 추가/삭제
const addTask = (type: 'completed' | 'incomplete') => {
  if (type === 'completed') {
    form.completedTasks.push({
      taskId: null,
      name: '',
      manager: '',
      type: '',
      note: ''
    });
  } else {
    form.incompleteTasks.push({
      taskId: null,
      name: '',
      manager: '',
      type: '',
      delay: '',
      reason: ''
    });
  }
};

const removeTask = (type: 'completed' | 'incomplete', index: number) => {
  if (type === 'completed') form.completedTasks.splice(index, 1);
  else form.incompleteTasks.splice(index, 1);
};

// 등록 핸들러
const handleCreate = async () => {
  try {
    // 주간보고 생성 (DRAFT)
    const createRes = await createWeeklyReport(projectId, {
      projectId: Number(projectId),
      taskCompletionRate: Number(form.taskCompletionRate)
    });

    const reportId = createRes.data.data.reportId;

    // 태스크 포함해서 바로 업데이트
    const updatePayload = {
      reportId,
      reportStatus: 'REVIEWED', // 또는 'DRAFT'
      summaryText: form.summaryText || '',
      taskCompletionRate: Number(form.taskCompletionRate),

      completedTasks: form.completedTasks
          .filter(t => t.taskId)
          .map(t => ({
            taskId: t.taskId,
            note: t.note || ''
          })),

      incompleteTasks: form.incompleteTasks
          .filter(t => t.taskId)
          .map(t => ({
            taskId: t.taskId,
            delayReason: t.reason || null
          })),

      nextWeekTasks: []
    };

    await updateWeeklyReport(projectId, updatePayload);

    alert('성공적으로 등록되었습니다.');
    router.push(`/projects/${projectId}/docs`);

  } catch (error) {
    console.error('등록 실패:', error.response?.data);
    alert('등록 실패: ' + (error.response?.data?.message || '서버 오류'));
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
.edit-input-table { width: 95%; border: 1px solid #4ab8d8; padding: 4px; font-size: 12px; text-align: center; outline: none; }
.edit-textarea { width: 100%; height: 80px; border: 1px solid #4ab8d8; padding: 10px; font-size: 12px; resize: none; border-radius: 4px; }
.edit-progress-box { display: flex; align-items: center; gap: 4px; font-weight: 800; color: #555; }
.percent-input { width: 60px; text-align: center; border: 1px solid #4ab8d8; font-size: 18px; font-weight: 800; color: #4ab8d8; }

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
.chart-container { display: flex; justify-content: center; align-items: center; padding: 20px 0; }
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

.bottom-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
.bottom-actions button { padding: 8px 18px; font-size: 13px; cursor: pointer; }
.btn-grey { background: #9ca3af; color: white; border: none; }
.btn-outline { background: white; border: 1px solid #4ab8d8; color: #4ab8d8; }
.btn-cyan { background: #4ab8d8; color: white; border: none; }

/* Chrome, Safari 화살표 제거 */
input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
</style>