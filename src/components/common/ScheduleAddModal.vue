<template>
  <Transition name="modal">
    <div class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <header class="modal-header">
          <h2>마일스톤 추가하기</h2>
          <button class="close-x-btn" @click="close">✕</button>
        </header>

        <div class="modal-body">
          <div class="form-row">
            <label class="form-label">마일스톤</label>
            <div class="form-input-group">
              <input
                  v-model="newData.projectName"
                  type="text"
                  placeholder="마일스톤 제목을 입력하세요"
                  class="full-input"
                  ref="nameInput"
              />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label">시작 날짜</label>
            <div class="form-input-group">
              <input
                  type="date"
                  v-model="formattedStartDate"
                  class="full-input date-input-full"
              />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label">종료 날짜</label>
            <div class="form-input-group">
              <input
                  type="date"
                  v-model="formattedEndDate"
                  class="full-input date-input-full"
              />
            </div>
          </div>
        </div>

        <footer class="modal-footer">
          <button class="btn-cancel" @click="close">취소</button>
          <button
              class="btn-save"
              @click="handleAdd"
              :disabled="!isFormValid"
          >
            등록하기
          </button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, ref } from 'vue'
import dayjs from 'dayjs'

const emit = defineEmits(['close', 'add'])
const nameInput = ref<HTMLInputElement | null>(null)

// 1. 신규 데이터 초기 상태
const newData = reactive({
  projectName: '',
  startDate: dayjs().format('YYYY.MM.DD'),
  endDate: dayjs().add(1, 'month').format('YYYY.MM.DD'),
  expanded: false,
  tasks: []
})

// 2. 날짜 포맷 변환 로직
const formattedStartDate = computed({
  get: () => newData.startDate.replace(/\./g, '-'),
  set: (val) => { newData.startDate = val.replace(/-/g, '.') }
})

const formattedEndDate = computed({
  get: () => newData.endDate.replace(/\./g, '-'),
  set: (val) => { newData.endDate = val.replace(/-/g, '.') }
})

// 3. 유효성 검사
const isFormValid = computed(() => {
  return newData.projectName.trim().length > 0 && newData.startDate && newData.endDate
})

const handleAdd = () => {
  if (!isFormValid.value) return
  emit('add', { ...newData })
}

const close = () => emit('close')

onMounted(() => {
  nameInput.value?.focus()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 10001;
}

.modal-content {
  background: white; width: 520px; border-radius: 2px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  overflow: hidden; font-family: 'Pretendard', sans-serif;
}

.modal-header {
  padding: 20px 24px; border-bottom: 1px solid #f0f0f0;
  display: flex; justify-content: space-between; align-items: center;
}

.modal-header h2 { margin: 0; font-size: 18px; font-weight: 700; color: #111; }

.close-x-btn {
  background: none; border: none; font-size: 20px;
  cursor: pointer; color: #999;
}

.modal-body { padding: 24px; }

.form-row { display: flex; margin-bottom: 20px; align-items: center; }

.form-label {
  width: 90px; font-size: 14px; font-weight: 600;
  color: #666; flex-shrink: 0;
}

.form-input-group { flex: 1; display: flex; align-items: center; gap: 8px; }

.full-input {
  width: 100%; padding: 10px 12px; border: 1px solid #ddd;
  border-radius: 2px; font-size: 14px; outline: none;
}

.full-input:focus { border-color: #4ab8d8; }

.date-input-full { cursor: pointer; }

.modal-footer {
  padding: 0 24px 24px 24px;
  background: #fff;
  display: flex;
  justify-content: flex-end; gap: 10px;
}

.btn-cancel {
  padding: 10px 20px; border: 1px solid #ddd;
  background: white; cursor: pointer; color: #666;
}

.btn-save {
  padding: 10px 24px; border: none;
  background: #4ab8d8; color: white; cursor: pointer;
  font-weight: 600;
}

.btn-save:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 애니메이션 */
.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>