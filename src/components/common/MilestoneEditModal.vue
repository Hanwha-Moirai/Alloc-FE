<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-box">
      <div class="modal-header">
        <input
            v-model="editableData.projectName"
            class="header-title-input"
            placeholder="마일스톤 명을 입력하세요"
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
        <button class="save-btn" @click="handleSave">수정 완료</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'

const props = defineProps<{
  modelValue: any
}>()

const emit = defineEmits(['close', 'save', 'update:modelValue'])

// 부모의 데이터를 안전하게 복사 (Proxy 반응성 유지)
const editableData = reactive({ ...props.modelValue })

// 날짜 포맷 변환 (부모의 2026.01.25 -> input의 2026-01-25)
const formattedStartDate = computed({
  get: () => editableData.startDate?.replace(/\./g, '-') || '',
  set: (val) => { editableData.startDate = val.replace(/-/g, '.') }
})

const formattedEndDate = computed({
  get: () => editableData.endDate?.replace(/\./g, '-') || '',
  set: (val) => { editableData.endDate = val.replace(/-/g, '.') }
})

const handleSave = () => {
  emit('update:modelValue', { ...editableData })
  emit('save', { ...editableData })
}

const close = () => emit('close')
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 10001;
}

.modal-box {
  width: 400px; /* 버튼이 줄어들었으므로 폭을 약간 조정 */
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

/* 푸터 버튼 스타일 */
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
  transition: background 0.2s;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.save-btn {
  flex: 2;
  height: 44px;
  background: #4ab8d8;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}
</style>