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
          <select v-model="selectedTechId" class="select-input">
            <option disabled value="">기술을 선택하세요</option>
            <option
                v-for="tech in techOptions"
                :key="tech.techId"
                :value="tech.techId"
            >
              {{ tech.techName }}
            </option>
          </select>
        </div>
      </div>

      <!-- 숙련도 -->
      <div class="form-group">
        <label class="label">숙련도</label>
        <select v-model="selectedLevel" class="select-input">
          <option value="LV1">LV1</option>
          <option value="LV2">LV2</option>
          <option value="LV3">LV3</option>
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
import { ref, computed, onMounted } from 'vue'
import { fetchTechStacks } from '@/api/hr'

// emit 정의
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: {
    techId: number
    level: number
  }): void
}>()

/* ======================
   상태
====================== */
const selectedTechId = ref<number | null>(null)
const selectedLevel = ref<'LV1' | 'LV2' | 'LV3'>('LV1')

const techOptions = ref<
    { techId: number; techName: string }[]
>([])

/* ======================
   유효성
====================== */
const isValid = computed(() => {
  return selectedTechId.value !== null
})

/* ======================
   API 로드
====================== */
onMounted(async () => {
  const res = await fetchTechStacks({ size: 50 })

  // HrQueryController 응답 구조 기준
  techOptions.value = res.data.data.items
})

/* ======================
   액션
====================== */
const close = () => emit('close')

const submit = () => {
  if (!isValid.value) return

  const selected = techOptions.value.find(
      t => t.techId === selectedTechId.value
  )

  if (!selected) return

  emit('save', {
    techId: selected.techId,
    level: Number(selectedLevel.value.replace('LV', ''))
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
