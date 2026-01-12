<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-box">
      <div class="modal-header">
        <h2 class="modal-title">마일스톤 삭제</h2>
        <button class="close-x-btn" @click="$emit('close')">×</button>
      </div>

      <div class="modal-body">
        <p class="confirm-message">등록된 마일스톤을 삭제하시겠습니까?</p>
      </div>

      <div class="footer">
        <button class="btn-cancel" @click="$emit('close')">취소</button>
        <button class="btn-delete" @click="$emit('confirm')">삭제</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(['close', 'confirm']);
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 11000; /* 수정 모달보다 더 위에 뜨도록 설정 */
}

.modal-box {
  width: 380px;
  background: #fff;
  border-radius: 2px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 20px;
  font-weight: 800;
  color: #333;
  margin: 0;
}

.close-x-btn {
  background: none; border: none;
  font-size: 24px; color: #999;
  cursor: pointer; line-height: 1;
}

.modal-body {
  margin-bottom: 30px;
}

.confirm-message {
  font-size: 15px;
  color: #4b5563;
  margin: 0;
}

.footer {
  display: flex;
  gap: 12px;
}

.btn-cancel {
  flex: 1;
  height: 48px;
  background: #fff;
  color: #4ab8d8;
  border: 1px solid #4ab8d8;
  cursor: pointer;
}

.btn-delete {
  flex: 1;
  height: 48px;
  background: #ef4444;
  color: #fff;
  border: none;
  cursor: pointer;
}

.btn-delete:hover {
  background: #dc2626;
}
</style>