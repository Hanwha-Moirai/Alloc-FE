<template>
  <div class="meeting-report-content">
    <h2 class="sub-page-title">회의록 등록</h2>

    <div class="top-info-grid">
      <div class="info-card wide">
        <span class="label">프로젝트명</span>
        <div class="value readonly-value">{{ form.projectName }}</div>
      </div>
      <div class="info-card">
        <span class="label">프로젝트 기간</span>
        <div class="value readonly-value">{{ form.period }}</div>
      </div>
      <div class="info-card">
        <span class="label">고객/협력사</span>
        <div class="value readonly-value">{{ form.client }}</div>
      </div>
      <div class="info-card">
        <span class="label">담당자</span>
        <div class="value readonly-value">{{ form.manager }}</div>
      </div>
      <div class="info-card">
        <span class="label">회의 날짜</span>
        <input type="date" v-model="form.meetingDate" class="edit-input" />
      </div>
      <div class="info-card">
        <span class="label">보고자</span>
        <div class="value readonly-value">{{ form.reporter }}</div>
      </div>
    </div>

    <div class="meeting-content">
      <div class="content-section">
        <h3 class="section-label">논의 주제</h3>
        <div class="content-card">
          <input v-model="form.topic" class="full-edit-input" placeholder="논의 주제를 입력하세요" />
        </div>
      </div>

      <div class="content-section">
        <h3 class="section-label">안건 유형</h3>
        <div class="content-card">
          <input v-model="form.agendaType" class="full-edit-input" placeholder="안건 유형을 입력하세요" />
        </div>
      </div>

      <div class="content-section">
        <h3 class="section-label">결정 사항</h3>
        <div class="content-card">
          <textarea v-model="form.decision" class="full-edit-textarea" placeholder="결정 사항을 입력하세요"></textarea>
        </div>
      </div>
    </div>

    <div class="bottom-actions">
      <button class="btn-outline" @click="router.back()">취소</button>
      <button class="btn-cyan" @click="handleCreate">등록하기</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createMeetingRecord } from '@/api/meetingRecord';
import { fetchProjectDetail } from '@/api/project';
import { useAuthStore } from '@/stores/auth'

const route = useRoute();
const router = useRouter();
const projectId = Number(route.params.projectId);
const authStore = useAuthStore()

// 생성 페이지이므로 isEditing은 필요 없거나 true인 상태와 같습니다.
const form = reactive({
  projectName: '',
  period: '',
  client: '',
  manager: '',
  meetingDate: new Date().toISOString().split('T')[0], // 오늘 날짜 기본값
  reporter: '',
  topic: '',
  agendaType: '',
  decision: ''
});

// 프로젝트 정보를 조회하여 폼의 상단 메타 데이터를 채웁니다.
const fetchProjectInfo = async () => {
  try {
    const res = await fetchProjectDetail(projectId);
    const p = res.data.data || res.data;

    form.projectName = p.name || p.projectName;
    form.period = (p.startDate && p.endDate) ? `${p.startDate} ~ ${p.endDate}` : '기간 정보 없음';
    form.client = p.partners || '고객사 정보 없음';
    form.manager = p.managerName || 'PM 정보 없음';
    // 보고자(작성자) 이름은 현재 로그인한 사용자 정보를 사용하도록 설정 가능
  } catch (e) {
    console.error('프로젝트 정보 조회 실패', e);
  }
};

onMounted(async () => {
  await fetchProjectInfo();
  if (!authStore.user) {
    await authStore.fetchMe()
  }
  form.reporter = authStore.user?.name ?? ''
});

const handleCreate = async () => {
  if (!form.topic.trim()) {
    alert('논의 주제를 입력해 주세요.');
    return;
  }

  try {
    const payload = {
      projectId: projectId,
      meetingDate: form.meetingDate + 'T00:00:00',
      agendas: [
        {
          discussionTitle: form.topic,
          discussionContent: form.topic,
          discussionResult: form.decision || "결정 사항 없음",
          agendaType: form.agendaType || "공통"
        }
      ]
    };

    console.log('최종 전송 데이터:', payload);

    const res = await createMeetingRecord(projectId, payload);

    if (res.status === 200 || res.data.success) {
      alert('회의록이 성공적으로 등록되었습니다.');

      router.push(`/projects/${projectId}/docs?tab=meeting`);
    }
  } catch (error) {
    console.error('서버 응답 에러:', error.response?.data);

    const errorMsg = error.response?.data?.message || '등록 중 오류가 발생했습니다.';
    alert(`등록 실패: ${errorMsg}`);
  }
};
</script>

<style scoped>
.meeting-report-content { padding: 0; }
.sub-page-title { font-size: 18px; font-weight: 700; margin: 0 0 20px 0; color: #333; }
.top-info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 30px; }
.info-card { background: white; border: 1px solid #e5e7eb; padding: 12px 16px; display: flex; flex-direction: column; }
.info-card .label { font-size: 11px; color: #9ca3af; }
.info-card .value { font-size: 14px; font-weight: 700; color: #333; }
.readonly-value { color: #666; }

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

.content-section { margin-bottom: 20px; }
.section-label { font-size: 15px; font-weight: 700; margin-bottom: 10px; color: #333; }
.content-card { background: white; border: 1px solid #e5e7eb; min-height: 50px; display: flex; align-items: center; }

.full-edit-input { width: 100%; border: 1px solid #4ab8d8; padding: 12px 15px; outline: none; font-size: 14px; }
.full-edit-textarea { width: 100%; min-height: 120px; border: 1px solid #4ab8d8; padding: 12px 15px; outline: none; font-size: 14px; resize: vertical; }

.bottom-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 30px; padding-bottom: 50px; }
.bottom-actions button { padding: 10px 25px; font-size: 13px; cursor: pointer; }
.btn-outline { background: white; border: 1px solid #4ab8d8; color: #4ab8d8; }
.btn-cyan { background: #4ab8d8; color: white; border: none; }
</style>
