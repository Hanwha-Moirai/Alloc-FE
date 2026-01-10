<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-box">
      <div class="modal-header">
        <input
            v-model="newData.projectName"
            class="header-title-input"
            placeholder="새 마일스톤명을 입력하세요"
            ref="nameInput"
        />
        <button class="close-btn" @click="close">✕</button>
      </div>

      <div class="modal-body">
        <div class="row">
          <span class="icon">📅</span>
          <label>시작 날짜</label>
          <div class="input-wrapper">
            <input
                type="date"
                v-model="formattedStartDate"
                class="date-input-full"
            />
          </div>
        </div>

        <div class="row">
          <span class="icon">📅</span>
          <label>종료 날짜</label>
          <div class="input-wrapper">
            <input
                type="date"
                v-model="formattedEndDate"
                class="date-input-full"
            />
          </div>
        </div>
      </div>

      <div class="footer">
        <button class="cancel-btn" @click="close">취소</button>
        <button class="save-btn" @click="handleAdd" :disabled="!isFormValid">등록하기</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, ref } from 'vue'
import dayjs from 'dayjs'

const emit = defineEmits(['close', 'add'])
const nameInput = ref<HTMLInputElement | null>(null)

// 1. 신규 데이터 초기 상태 (오늘 날짜 기준으로 기본 세팅)
const newData = reactive({
  projectName: '',
  startDate: dayjs().format('YYYY.MM.DD'),
  endDate: dayjs().add(1, 'month').format('YYYY.MM.DD'),
  expanded: false,
  tasks: []
})

// 2. 날짜 포맷 변환 로직 (YYYY.MM.DD <-> YYYY-MM-DD)
const formattedStartDate = computed({
  get: () => newData.startDate.replace(/\./g, '-'),
  set: (val) => { newData.startDate = val.replace(/-/g, '.') }
})

const formattedEndDate = computed({
  get: () => newData.endDate.replace(/\./g, '-'),
  set: (val) => { newData.endDate = val.replace(/-/g, '.') }
})

// 3. 유효성 검사 (이름이 비어있으면 버튼 비활성화)
const isFormValid = computed(() => {
  return newData.projectName.trim().length > 0 && newData.startDate && newData.endDate
})

const handleAdd = () => {
  if (!isFormValid.value) return

  // 부모에게 신규 객체 전달 (ID는 부모에서 생성하도록 위임)
  emit('add', { ...newData })
}

const close = () => emit('close')

// 모달 열릴 때 이름 입력창에 포커스
onMounted(() => {
  nameInput.value?.focus()
})
</script>

<style scoped>
/* 기존 수정 모달의 스타일을 그대로 유지합니다 */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 10001;
}

.modal-box {
  width: 400px;
  background: #fff;
  border-radius: 2px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #4ab8d8;
}

.header-title-input {
  border: none;
  font-size: 18px;
  font-weight: 700;
  color: #333;
  width: 90%;
  outline: none;
}

.close-btn {
  background: none; border: none;
  font-size: 20px; color: #9ca3af;
  cursor: pointer;
}

.modal-body {
  padding: 10px 20px;
}

.row {
  display: grid;
  grid-template-columns: 30px 100px 1fr;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f3f4f6;
}

.row:last-child {
  border-bottom: none;
}

.row label {
  font-size: 14px;
  color: #666;
}

.date-input-full {
  width: 100%;
  border: none;
  font-size: 14px;
  color: #333;
  text-align: right;
  outline: none;
  font-family: inherit;
  cursor: pointer;
}

.footer {
  padding: 0 24px 24px;
  display: flex;
  gap: 12px;
}

.cancel-btn {
  flex: 1;
  height: 44px;
  background: #f3f4f6;
  color: #4b5563;
  border: none;
  cursor: pointer;
}

.save-btn {
  flex: 2;
  height: 44px;
  background: #4ab8d8;
  color: #fff;
  border: none;
  cursor: pointer;
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>