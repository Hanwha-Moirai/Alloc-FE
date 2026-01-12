<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <header class="modal-header">
          <h2 class="modal-title">주간보고/회의록 생성하기</h2>
          <button class="close-x-btn" @click="$emit('close')">✕</button>
        </header>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">프로젝트 선택</label>
            <div class="select-wrapper">
              <select v-model="form.projectId" class="full-select">
                <option value="" disabled selected>프로젝트명</option>
                <option v-for="pj in projectList" :key="pj.id" :value="pj.id">
                  {{ pj.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">생성 문서</label>
            <div class="radio-group">
              <label class="radio-item">
                <input type="radio" v-model="form.docType" value="weekly" name="docType" />
                <span class="custom-radio"></span>
                주간보고
              </label>
              <label class="radio-item">
                <input type="radio" v-model="form.docType" value="meeting" name="docType" />
                <span class="custom-radio"></span>
                회의록
              </label>
            </div>
          </div>
        </div>

        <footer class="modal-footer">
          <button class="btn-submit" @click="handleCreate">초안 생성</button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(['close', 'create']);

// 예시 프로젝트 리스트
const projectList = ref([
  { id: 1, name: '웹 플랫폼 고도화 프로젝트' },
  { id: 2, name: '차세대 ERP 구축' }
]);

const form = reactive({
  projectId: '',
  docType: 'weekly'
});

const handleCreate = () => {
  if (!form.projectId) {
    alert('프로젝트를 선택해주세요.');
    return;
  }
  emit('create', { ...form });
  emit('close');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4);
  display: flex; align-items: center; justify-content: center; z-index: 5000;
}

.modal-content {
  background: white; width: 400px; border-radius: 2px; overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15); font-family: 'Pretendard', sans-serif;
}

.modal-header {
  padding: 24px 24px 16px; display: flex; justify-content: space-between; align-items: center;
}

.modal-title { font-size: 24px; font-weight: 700; color: #333; margin: 0; }

.close-x-btn { background: none; border: none; font-size: 20px; color: #333; cursor: pointer; }

.modal-body { padding: 0 24px 32px; }

.form-group { margin-top: 24px; }

.form-label { display: block; font-size: 14px; font-weight: 600; color: #4b5563; margin-bottom: 12px; }

/* 셀렉트 박스 스타일 */
.select-wrapper { position: relative; }
.full-select {
  width: 100%; height: 44px; padding: 0 12px; border: 1px solid #d1d5db; border-radius: 2px;
  font-size: 15px; color: #374151; background-color: #f9fafb; outline: none; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 12px center;
}

/* 라디오 버튼 스타일 */
.radio-group { display: flex; flex-direction: column; gap: 16px; }

.radio-item { display: flex; align-items: center; font-size: 15px; color: #374151; cursor: pointer; gap: 10px; }

.radio-item input[type="radio"] { display: none; }

/* 커스텀 라디오 체크 표시 */
.custom-radio {
  width: 18px; height: 18px; border: 2px solid #d1d5db; border-radius: 50%; position: relative;
}

.radio-item input[type="radio"]:checked + .custom-radio { border-color: #4ab8d8; }

.radio-item input[type="radio"]:checked + .custom-radio::after {
  content: ""; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 10px; height: 10px; background-color: #4ab8d8; border-radius: 50%;
}

.modal-footer { padding: 0 24px 24px; }

.btn-submit {
  width: 100%; height: 48px; background-color: #4ab8d8; color: white; border: none;
  font-size: 16px; cursor: pointer; transition: background 0.2s;
}

.btn-submit:hover { background-color: #3daecf; }

</style>