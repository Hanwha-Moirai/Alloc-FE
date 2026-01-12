<template>
  <div class="meeting-report-content">
    <h2 class="sub-page-title">회의록 상세</h2>

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
        <span class="label">회의 날짜</span>
        <input v-if="isEditing" v-model="form.meetingDate" class="edit-input" />
        <div v-else class="value">{{ form.meetingDate }}</div>
      </div>
      <div class="info-card">
        <span class="label">보고자</span>
        <input v-if="isEditing" v-model="form.reporter" class="edit-input" />
        <div v-else class="value">{{ form.reporter }}</div>
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
        <button class="btn-outline">삭제</button>
        <button class="btn-outline" @click="isEditing = true">수정</button>
        <button class="btn-cyan">PDF 출력</button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

const isEditing = ref(false);

const form = reactive({
  projectName: '트래픽 모니터링 및 장애 대응 고도화',
  period: '2026.01.06 - 2026.01.25',
  client: '삼성전자',
  manager: '김현수',
  meetingDate: '2025 FEB 12',
  reporter: '김현수',
  topic: '트래픽 모니터링 및 장애 대응 고도화',
  agendaType: '트래픽 모니터링 및 장애 대응 고도화',
  decision: '트래픽 모니터링 및 장애 대응 고도화'
});

const handleSave = () => {
  alert('회의록이 저장되었습니다.');
  isEditing.value = false;
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