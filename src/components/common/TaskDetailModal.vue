<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-box">
      <div class="modal-header">
        <h2 v-if="!isEdit" class="title">{{ task.title }}</h2>
        <input v-else v-model="editableTask.title" class="edit-input title-input" />
        <button class="close-btn" @click="close">✕</button>
      </div>

      <div class="content">
        <div class="row">
          <span class="icon">ⓘ</span>
          <label>진행사항</label>
          <div v-if="isEdit" class="edit-field">
            <div class="status-select-wrapper" :class="editableTask.status.toLowerCase()">
              <select v-model="editableTask.status" class="status-select-badge">
                <option v-for="(label, value) in statusLabel" :key="value" :value="value">{{ label }}</option>
              </select>
            </div>
          </div>
          <div v-else class="status-select-wrapper" :class="task.status.toLowerCase()">
            <span class="status-display">{{ statusLabel[task.status] }}</span>
          </div>
        </div>

        <div class="row">
          <span class="icon">📍</span>
          <label>태스크 유형</label>
          <select v-if="isEdit" v-model="editableTask.task_category" class="edit-select">
            <option v-for="(label, value) in categoryLabel" :key="value" :value="value">{{ label }}</option>
          </select>
          <span v-else class="type-badge" :class="categoryClass[task.task_category]">
            {{ categoryLabel[task.task_category] }}
          </span>
        </div>

        <div class="row">
          <span class="icon">🏁</span>
          <label>마일스톤</label>
          <select v-if="isEdit" v-model="editableTask.milestoneId" class="edit-select">
            <option v-for="ms in milestoneList" :key="ms.id" :value="ms.id">
              {{ ms.name }}
            </option>
          </select>
          <span v-else class="value">{{ currentMilestoneName }}</span>
        </div>

        <div class="content">
          <div class="row">
            <span class="icon">📅</span>
            <label>시작 날짜</label>
            <input
                v-if="isEdit"
                type="date"
                v-model="editableTask.startDate"
                class="date-input-full"
            />
            <span v-else class="value">{{ task.startDate }}</span>
          </div>

          <div class="row">
            <span class="icon">📅</span>
            <label>종료 날짜</label>
            <input
                v-if="isEdit"
                type="date"
                v-model="editableTask.endDate"
                class="date-input-full"
            />
            <span v-else class="value">{{ task.endDate }}</span>
          </div>

        </div>

        <div class="row">
          <span class="icon">👤</span>
          <label>담당자</label>
          <select v-if="isEdit" v-model="editableTask.userName" class="edit-select">
            <option value="" disabled>담당자 선택</option>
            <option v-for="user in userList" :key="user" :value="user">{{ user }}</option>
          </select>
          <span v-else class="value">{{ task.userName }}</span>
        </div>

        <div class="row description">
          <span class="icon">📄</span>
          <label>설명</label>
          <textarea v-if="isEdit" v-model="editableTask.description" class="edit-textarea"></textarea>
          <p v-else class="desc">{{ task.description }}</p>
        </div>
      </div>

      <div class="footer">
        <template v-if="!isEdit">
          <button class="delete-btn" @click="$emit('delete', task.id)">삭제</button>
          <button class="edit-btn" @click="toggleEdit">수정</button>
        </template>
        <template v-else>
          <button class="cancel-btn" @click="toggleEdit">취소</button>
          <button class="save-btn" @click="handleSave">저장</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'

const props = defineProps<{
  task: any,
  milestoneList: any[]
}>()

const emit = defineEmits(['close', 'save', 'delete'])

const isEdit = ref(false)
const editableTask = reactive<any>({})

watch(() => props.task, (newTask) => {
  if (newTask) {
    Object.assign(editableTask, JSON.parse(JSON.stringify(newTask)))
  }
}, { immediate: true, deep: true })

const toggleEdit = () => {
  if (!isEdit.value) {
    const taskCopy = JSON.parse(JSON.stringify(props.task));

    if (taskCopy.startDate) taskCopy.startDate = taskCopy.startDate.replace(/\./g, '-');
    if (taskCopy.endDate) taskCopy.endDate = taskCopy.endDate.replace(/\./g, '-');

    Object.assign(editableTask, taskCopy);
  }
  isEdit.value = !isEdit.value;
};

const handleSave = () => {
  emit('save', { ...editableTask });
  isEdit.value = false;
};

const handleDelete = () => {
  if (confirm('이 태스크를 삭제하시겠습니까?')) {
    emit('delete', props.task.id)
  }
}

const close = () => {
  isEdit.value = false
  emit('close')
}

const currentMilestoneName = computed(() => {
  const found = props.milestoneList?.find(m => m.id === props.task.milestoneId)
  return found ? found.name : '지정되지 않음'
})

// 담당자 목록
const userList = ['김동리', '이철수', '박영희', '최민수']

// 매핑 상수
const statusLabel = { TO_DO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }
const categoryLabel = { DEVELOPMENT: '개발', TESTING: '테스트', BUGFIXING: '버그', DISTRIBUTION: '배포' }
const categoryClass = { DEVELOPMENT: 'dev', TESTING: 'test', BUGFIXING: 'bug', DISTRIBUTION: 'dist' }
</script>

<style scoped>
.edit-input, .edit-select, .edit-textarea, .date-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 13px;
  outline-color: #4ab8d8;
}

.close-btn {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font-size: 20px;
  font-weight: 400;
  color: #9ca3af;
  cursor: pointer;
  line-height: 1;
  outline: none;
  transition: color 0.2s;
}

.title {
  font-size: 18px;
  font-weight: 700;
  margin: 10px 0 10px 0;
  padding: 0;
  line-height: 1.2;
}

.title-input {
  font-size: 18px;
  font-weight: 700;
}

.date-input-full {
  width: 100%;
  height: 32px;
  padding: 0 8px;
  font-size: 13px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  box-sizing: border-box;
  outline-color: #4ab8d8;
  font-family: inherit;
}

.edit-textarea {
  width: 100%;
  min-height: 100px;
  padding: 8px;
  font-size: 13px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  line-height: 1.5;
  box-sizing: border-box;
  resize: vertical;
  outline-color: #4ab8d8;
}

/* 상태값 표시 (비편집 모드) */
.status-display {
  padding: 4px 12px 4px 14px;
  font-size: 12px;
  font-weight: 600;
}

/* 버튼 스타일 추가 */
.save-btn, .cancel-btn {
  flex: 1;
  height: 36px;
  cursor: pointer;
}

.save-btn {
  background: #4ab8d8;
  color: white;
  border: none;
}

.cancel-btn {
  background: white;
  color: #4ab8d8;
  border: 1px solid #4ab8d8;
  margin-right: 8px;
}

/* 기존 드롭다운 래퍼 스타일 유지 */
.status-select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: fit-content;
  border-radius: 999px;
  padding-left: 12px;
}
.status-select-wrapper::before {
  content: ''; width: 8px; height: 8px; border-radius: 50%;
  position: absolute; left: 12px; z-index: 1;
}
.status-select-wrapper.to_do { background: #e6f0ff; }
.status-select-wrapper.to_do::before { background: #2563eb; }
.status-select-wrapper.in_progress { background: #dcfce7; }
.status-select-wrapper.in_progress::before { background: #22c55e; }
.status-select-wrapper.done { background: #FFEDDD; }
.status-select-wrapper.done::before { background: #FF8D28; }

.status-select-badge {
  appearance: none; background: transparent; border: none; outline: none;
  cursor: pointer; font-size: 12px; font-weight: 600;
  padding: 4px 12px 4px 14px; z-index: 2;
}

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal-box { width: 420px; background: #fff; border-radius: 3px; padding: 16px 18px; }
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 12px;
  gap: 10px;
}
.row { display: grid; grid-template-columns: 24px 80px 1fr; align-items: center; padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
.icon { text-align: center; }
label { color: #555; }
.description { align-items: start; }
.desc { white-space: pre-line; line-height: 1.5; margin: 0; }
.footer { display: flex; justify-content: space-between; margin-top: 16px; }
.delete-btn { flex: 1; margin-right: 8px; height: 36px; border: 1px solid #4ab8d8; background: #fff; color: #4ab8d8; cursor: pointer; }
.edit-btn { flex: 1; height: 36px; background: #4ab8d8; color: #fff; border: none; cursor: pointer; }

.type-badge { display: inline-block; font-size: 11px; padding: 2px 10px; border-radius: 12px; color: #fff; font-weight: 600; width: fit-content; }
.type-badge.dev { background-color: #3b82f6; }
.type-badge.bug { background-color: #ef4444; }
.type-badge.test { background-color: #22c55e; }
.type-badge.dist { background-color: #8b5cf6; }
</style>