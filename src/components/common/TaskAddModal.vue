<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-box">
      <div class="modal-header">
        <h2 class="title">태스크 등록하기</h2>
        <button class="close-btn" @click="close">✕</button>
      </div>

      <div class="content">
        <div class="input-section">
          <label>태스크 제목</label>
          <input
              type="text"
              v-model="newTask.title"
              placeholder="태스크 제목 입력"
              class="full-input"
          />
        </div>

        <div class="input-section">
          <label>기간</label>
          <div class="date-range-group">
            <div class="date-input-wrapper">
              <input type="date" v-model="newTask.startDate" class="date-input" />
              <span class="date-label">시작 날짜</span>
            </div>
            <span class="separator">→</span>
            <div class="date-input-wrapper">
              <input type="date" v-model="newTask.endDate" class="date-input" />
              <span class="date-label">종료 날짜</span>
            </div>
          </div>
        </div>

        <div class="input-section">
          <label>담당자</label>
          <select v-model="newTask.assignee" class="full-input select-input">
            <option value="" disabled selected>담당자 선택</option>
            <option v-for="user in userList" :key="user" :value="user">{{ user }}</option>
          </select>
        </div>

        <div class="input-section">
          <label>태스크 유형</label>
          <select v-model="newTask.task_category" class="full-input select-input">
            <option value="DEVELOPMENT">개발</option>
            <option value="TESTING">테스트</option>
            <option value="BUGFIXING">버그</option>
            <option value="DISTRIBUTION">배포</option>
          </select>
        </div>

        <div class="input-section">
          <label>마일스톤</label>
          <select v-model="newTask.milestoneId" class="full-input select-input">
            <option value="" disabled selected>마일스톤 선택</option>
            <option v-for="ms in milestoneList" :key="ms.id" :value="ms.id">
              {{ ms.name }}
            </option>
          </select>
        </div>

        <div class="input-section">
          <label>설명</label>
          <textarea
              v-model="newTask.description"
              placeholder="설명 입력"
              class="full-textarea"
          ></textarea>
        </div>
      </div>

      <div class="footer">
        <button class="cancel-btn" @click="close">취소</button>
        <button class="submit-btn" @click="handleSubmit">등록</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const props = defineProps<{
  milestoneList: any[]
}>()

const emit = defineEmits(['close', 'add-task'])

// 담당자 목록 데이터
const userList = ['김동리', '이철수', '박영희', '최민수']

// 새 태스크 데이터 초기값
const newTask = reactive({
  title: '',
  startDate: '',
  endDate: '',
  assignee: '',
  task_category: 'DEVELOPMENT',
  milestoneId: '',
  description: '',
  status: 'TO_DO'
})

const close = () => emit('close')

const handleSubmit = () => {
  if (!newTask.title || !newTask.startDate || !newTask.endDate) {
    alert('필수 정보를 모두 입력해주세요.')
    return
  }
  emit('add-task', { ...newTask, id: Date.now() })
  close()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-box {
  width: 440px;
  background: #fff;
  border-radius: 2px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 22px;
  color: #9ca3af;
  cursor: pointer;
}

.input-section {
  margin-bottom: 20px;
}

.input-section label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 8px;
}

.full-input, .full-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 2px;
  font-size: 14px;
  box-sizing: border-box;
  outline-color: #4ab8d8;
  background-color: #f9fafb;
}

.full-textarea {
  min-height: 50px;
  resize: vertical;
}

.date-range-group {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
}

.date-input-wrapper {
  flex: 1;
  min-width: 0;
}

.date-input {
  width: 100%;
  height: 40px;
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 2px;
  font-size: 13px;
  box-sizing: border-box;
  background-color: #f9fafb;
}

.date-label {
  display: block;
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
}

.separator {
  padding-top: 12px;
  color: #9ca3af;
}

.date-label {
  display: block;
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
}

/* 하단 버튼 */
.footer {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.cancel-btn, .submit-btn {
  flex: 1;
  height: 36px;
  font-size: 13px;
  cursor: pointer;
}

.cancel-btn {
  background: #fff;
  border: 1px solid #4ab8d8;
  color: #4ab8d8;
}

.submit-btn {
  background: #4ab8d8;
  border: none;
  color: #fff;
}

.submit-btn:hover {
  background: #3daecf;
}
</style>