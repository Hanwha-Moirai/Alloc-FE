<template>
  <div class="meeting-report-content">
    <h2 class="sub-page-title">회의록 상세</h2>

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
        <input v-if="isEditing" type="date" v-model="form.meetingDate" class="edit-input" />
        <div v-else class="value">{{ form.meetingDate }}</div>
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
          <input v-if="isEditing" v-model="form.topic" class="full-edit-input" placeholder="논의 주제를 입력하세요" />
          <div v-else class="display-text">{{ form.topic }}</div>
        </div>
      </div>

      <div class="content-section">
        <h3 class="section-label">안건 유형</h3>
        <div class="content-card">
          <input v-if="isEditing" v-model="form.agendaType" class="full-edit-input" placeholder="안건 유형을 입력하세요" />
          <div v-else class="display-text">{{ form.agendaType }}</div>
        </div>
      </div>

      <div class="content-section">
        <h3 class="section-label">결정 사항</h3>
        <div class="content-card">
          <textarea v-if="isEditing" v-model="form.decision" class="full-edit-textarea" placeholder="결정 사항을 입력하세요"></textarea>
          <div v-else class="display-text">{{ form.decision }}</div>
        </div>
      </div>
    </div>

    <div class="bottom-actions">
      <template v-if="isEditing">
        <button class="btn-outline" @click="isEditing = false">취소</button>
        <button class="btn-cyan" @click="handleSave">저장</button>
      </template>
      <template v-else>
        <button class="btn-outline" @click="handleDelete">삭제</button>
        <button class="btn-outline" @click="isEditing = true">수정</button>
        <button class="btn-cyan">PDF 출력</button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getMeetingRecordDetail, updateMeetingRecord, deleteMeetingRecord } from '@/api/meetingRecord';
import { fetchProjectDetail } from '@/api/project'

const route = useRoute();
const router = useRouter();
const projectId = Number(route.params.projectId);
const meetingId = Number(route.params.docId);

const isEditing = ref(false);
// 기존 안건의 ID를 보관하기 위한 변수
let originalAgendaId = null;

const form = reactive({
  projectName: '',
  period: '',
  client: '',
  manager: '',
  meetingDate: '',
  reporter: '',
  topic: '',
  agendaType: '',
  decision: ''
});

const fetchMeetingDetail = async () => {
  try {
    const res = await getMeetingRecordDetail(projectId, meetingId);
    const data = res.data.data;
    const agenda = data.agendas?.[0];
    if (agenda) {
      originalAgendaId = agenda.agendaId;
      form.topic = agenda.discussionTitle;
      form.agendaType = agenda.agendaType;
      form.decision = agenda.discussionResult;
    }

    form.meetingDate = formatDate(data.meetingDate);
    form.reporter = data.createdBy;

    if (data.projectName) {
      form.projectName = data.projectName;
      form.period = data.period;
      form.client = data.client;
    } else {
      await fetchProjectInfo();
    }

  } catch (error) {
    console.error('불러오기 실패:', error);
  }
};

const fetchProjectInfo = async () => {
  try {
    const res = await fetchProjectDetail(projectId);
    const p = res.data.data || res.data;
    if (!form.projectName) form.projectName = p.name || p.projectName;
    if (!form.period) form.period = `${p.startDate} ~ ${p.endDate}`;
    if (!form.client) form.client = p.partners || '고객사 정보 없음';

    form.manager = p.managerName || 'PM 정보 없음';
  } catch (e) {
    console.error('프로젝트 정보 조회 실패', e);
  }
};

onMounted(async () => {
  await fetchMeetingDetail();
});

const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

const handleSave = async () => {
  try {
    const updateData = {
      meetingId: meetingId,
      // 날짜 뒤에 T00:00:00를 붙여서 LocalDateTime 형식을 맞춤
      meetingDate: form.meetingDate + 'T00:00:00',
      agendas: [
        {
          agendaId: originalAgendaId,
          discussionTitle: form.topic,
          discussionResult: form.decision,
          agendaType: form.agendaType,
          discussionContent: form.topic
        }
      ]
    };

    console.log('전송 데이터 확인:', updateData);

    const res = await updateMeetingRecord(projectId, updateData);

    if (res.status === 200 || res.data.success) {
      alert('회의록이 저장되었습니다.');
      isEditing.value = false;
      await fetchMeetingDetail();
    }
  } catch (error) {
    // 이제 이 로그에서 파싱 에러가 사라질 것입니다.
    console.error('서버 응답 에러:', error.response?.data);
    alert('저장에 실패했습니다. 날짜 형식을 확인해주세요.');
  }
};

// 삭제 처리 함수
const handleDelete = async () => {
  if (!confirm("이 회의록을 정말로 삭제하시겠습니까?")) return;

  try {
    const res = await deleteMeetingRecord(projectId, meetingId);

    // ApiResponse.success() 구조에 따라 성공 여부 확인
    if (res.status === 200 || res.data.success) {
      alert('회의록이 삭제되었습니다.');
      router.back(); // 삭제 성공 시 이전 목록 페이지로 이동
    }
  } catch (error) {
    console.error('삭제 실패:', error.response?.data);
    alert('삭제에 실패했습니다. 권한을 확인해주세요.');
  }
};
</script>

<style scoped>
/* 외부 레이아웃 여백 제거 (부모 컨테이너가 처리) */
.meeting-report-content { padding: 0; }

.sub-page-title { font-size: 18px; font-weight: 700; margin: 0 0 20px 0; color: #333; }

/* 상단 정보 그리드 */
.top-info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 30px; }
.info-card { background: white; border: 1px solid #e5e7eb; padding: 12px 16px; display: flex; flex-direction: column; }
.info-card .label { font-size: 11px; color: #9ca3af; }
.info-card .value { font-size: 14px; font-weight: 700; color: #333; }
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

.edit-textarea {
  width: 100%;
  height: 100px;
  border: 1px solid #4ab8d8;
  padding: 10px;
  font-size: 14px;
  resize: none;
  border-radius: 4px;
  outline: none;
}

.full-edit-input {
  width: 100%;
  border: 1px solid #4ab8d8;
  padding: 12px 15px;
  outline: none;
  font-size: 14px;
}

/* 회의 내용 섹션 */
.content-section { margin-bottom: 20px; }
.section-label { font-size: 15px; font-weight: 700; margin-bottom: 10px; color: #333; }
.content-card { background: white; border: 1px solid #e5e7eb; min-height: 50px; display: flex; align-items: center; }
.display-text { padding: 12px 15px; color: #555; font-size: 14px; white-space: pre-wrap; }

/* 수정 모드 입력창 */
.full-edit-input { width: 100%; border: 1px solid #4ab8d8; padding: 12px 15px; outline: none; font-size: 14px; }
.full-edit-textarea { width: 100%; min-height: 100px; border: 1px solid #4ab8d8; padding: 12px 15px; outline: none; font-size: 14px; resize: vertical; }

/* 하단 버튼 */
.bottom-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 30px; padding-bottom: 50px; }
.bottom-actions button { padding: 10px 25px; font-size: 13px; cursor: pointer; }
.btn-outline { background: white; border: 1px solid #4ab8d8; color: #4ab8d8; }
.btn-cyan { background: #4ab8d8; color: white; border: none; }
</style>