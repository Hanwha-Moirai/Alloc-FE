<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <header class="modal-header">
          <h3>📅 일정 추가하기</h3>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </header>

        <div class="modal-body">
          <div class="form-group">
            <label>일정 제목</label>
            <input v-model="form.title" type="text" placeholder="제목을 입력하세요" class="input-field" />
          </div>

          <div class="form-group">
            <label>날짜 선택</label>
            <input v-model="form.date" type="date" class="input-field" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>시작 시간</label>
              <input v-model="form.startTime" type="time" class="input-field" />
            </div>
            <div class="form-group">
              <label>소요 시간(h)</label>
              <input v-model.number="form.duration" type="number" step="0.5" class="input-field" />
            </div>
          </div>
        </div>

        <footer class="modal-footer">
          <button class="btn-cancel" @click="$emit('close')">취소</button>
          <button class="btn-save" @click="handleSave">저장</button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 부모로부터 받는 데이터
const props = defineProps<{
  isOpen: boolean;
}>();

// 부모로 보내는 이벤트
const emit = defineEmits(['close', 'add-event']);

// 내부 입력 폼 상태
const form = ref({
  title: '',
  date: '',
  startTime: '09:00',
  duration: 1,
  color: '#dbeafe',
  borderColor: '#3b82f6'
});

const handleSave = () => {
  if (!form.value.title) return alert('제목을 입력해주세요!');

  // 부모에게 데이터 전달
  emit('add-event', { ...form.value, id: Date.now() });

  // 저장 후 폼 초기화
  form.value.title = '';
};
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center; z-index: 2000;
}
.modal-content {
  background: white; width: 400px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}
.modal-header { padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
.modal-body { padding: 20px; }
.form-group { margin-bottom: 15px; display: flex; flex-direction: column; gap: 5px; }
.input-field { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
.form-row { display: flex; gap: 10px; }
.modal-footer { padding: 15px 20px; background: #f9fafb; display: flex; justify-content: flex-end; gap: 8px; border-radius: 0 0 12px 12px; }
.btn-cancel { background: white; border: 1px solid #ddd; padding: 8px 15px; border-radius: 4px; cursor: pointer; }
.btn-save { background: #4ab8d8; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: bold; }

/* 애니메이션 */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>