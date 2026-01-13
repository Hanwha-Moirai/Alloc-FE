<template>
  <div class="modal-overlay" @click="close">
    <div class="modal" @click.stop>
      <!-- 헤더 -->
      <div class="modal-header">
        <h3>기술스택 추가</h3>
        <button class="close-btn" @click="close">×</button>
      </div>

      <!-- 기술 스택명 -->
      <div class="form-group">
        <label class="label">기술스택명</label>
        <div class="select-box">
          <select v-model="skillName">
            <option disabled value="">기술스택 선택</option>
            <option
                v-for="tech in techOptions"
                :key="tech"
                :value="tech"
            >
              {{ tech }}
            </option>
          </select>
        </div>
      </div>

      <!-- 숙련도 -->
      <div class="form-group">
        <label class="label">숙련도</label>
        <select v-model="level">
          <option disabled value="">숙련도 선택</option>
          <option :value="1">L1</option>
          <option :value="2">L2</option>
          <option :value="3">L3</option>
        </select>
      </div>

      <!-- 버튼 -->
      <div class="modal-footer">
        <button class="cancel" @click="close">취소</button>
        <button
            class="submit"
            :disabled="!isValid"
            @click="submit"
        >
          등록
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: { name: string; level: number }): void
}>()

const techOptions = [
  'Spring Boot',
  'JPA',
  'MySQL',
  'Docker',
  'Redis',
  'JavaScript',
]

const skillName = ref('')
const level = ref<number | ''>('')

const isValid = computed(() => {
  return skillName.value !== '' && level.value !== ''
})

const close = () => emit('close')

const submit = () => {
  if (!isValid.value) return

  emit('submit', {
    name: skillName.value,
    level: Number(level.value),
  })

  close()
}
</script>

<style scoped>
/* overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

/* modal */
.modal {
  width: 360px;
  background: #fff;
  border-radius: 4px;
  padding: 20px;
}

/* header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-btn {
  border: none;
  background: none;
  font-size: 18px;
  cursor: pointer;
}

/* form */
.form-group {
  margin-bottom: 16px;
}

.label {
  display: block;
  font-size: 13px;
  margin-bottom: 6px;
}

h3 {
  margin : 0;
}

select {
  width: 100%;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #dcdfe3;
}

/* footer */
.modal-footer {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.cancel {
  flex: 1;
  background: #fff;
  border: 1px solid #4ab8d8;
  color: #4ab8d8;
  height: 36px;
  cursor: pointer;
}

.submit {
  flex: 1;
  background: #4ab8d8;
  border: none;
  color: #fff;
  height: 36px;
  cursor: pointer;
}

.submit:disabled {
  background: #cfe9f4;
  cursor: not-allowed;
}
</style>
