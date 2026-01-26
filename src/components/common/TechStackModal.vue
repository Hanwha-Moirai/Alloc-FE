<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-window">
        <div class="modal-header">
          <h2 class="title">기술스택 {{ isEdit ? '수정' : '등록' }}</h2>
          <button class="close-btn" @click="$emit('close')">&times;</button>
        </div>

        <div class="modal-body">
          <label class="input-label">기술스택명</label>
          <div class="input-wrapper">
            <input
                type="text"
                v-model="techName"
                placeholder="기술스택 입력"
                class="tech-input"
                @keyup.enter="handleConfirm"
            />
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-cancel" @click="$emit('close')">취소</button>
          <button class="btn btn-submit" @click="handleConfirm">
            {{ isEdit ? '저장' : '등록' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  show: boolean;
  isEdit: boolean;
  initialName?: string;
}>();

const emit = defineEmits(['close', 'confirm']);

const techName = ref('');

watch(() => props.show, (newVal) => {
  if (newVal) {
    techName.value = props.isEdit ? (props.initialName || '') : '';
  }
});

const handleConfirm = () => {
  const trimmedName = techName.value.trim();

  if (!trimmedName) {
    alert('기술스택명을 입력해주세요.');
    return;
  }

  emit('confirm', trimmedName);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.modal-window { background-color: white; width: 440px; border-radius: 2px; padding: 30px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.modal-header .title { font-size: 24px; font-weight: 700; color: #222; margin: 0; }
.close-btn { background: none; border: none; font-size: 28px; color: #333; cursor: pointer; }
.modal-body { margin-bottom: 35px; }
.input-label { display: block; font-size: 14px; font-weight: 600; color: #444; margin-bottom: 12px; }
.input-wrapper { background-color: #f4f6f8; border-bottom: 2px solid #4ab8d8; }
.tech-input { width: 100%; padding: 14px 16px; background: transparent; border: none; outline: none; font-size: 16px; color: #333; }
.modal-footer { display: flex; gap: 15px; }
.btn { flex: 1; height: 50px; font-size: 14px; cursor: pointer; transition: all 0.2s; }
.btn-cancel { background-color: white; border: 1px solid #4ab8d8; color: #4ab8d8; }
.btn-submit { background-color: #4ab8d8; border: none; color: white; }
</style>