<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="close-x" @click="$emit('close')">×</button>

      <div class="success-icon">
        <div class="check-icon-svg"></div>
      </div>

      <h2 class="modal-title">저장 완료</h2>
      <p class="modal-message">프로젝트 저장이 완료되었습니다.</p>

      <button class="btn-confirm" @click="$emit('close')">닫기</button>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 320px;
  padding: 30px 20px 20px;
  text-align: center;
  position: relative;
}

.close-x {
  position: absolute;
  top: 10px; right: 15px;
  background: none; border: none; font-size: 20px; cursor: pointer; color: #666;
}

.success-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.check-icon-svg {
  width: 40px;
  height: 40px;
  background-color: #4ab8d8;
  -webkit-mask-image: url('/check.png');
  mask-image: url('/check.png');
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  mask-size: contain;
}

.modal-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  color: #111;
}

.modal-message {
  font-size: 14px;
  color: #666;
  margin: 12px 0 24px 0;
}

.btn-confirm {
  width: 100%;
  background-color: #4ab8d8;
  color: white;
  border: none;
  padding: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 2px;
  transition: background-color 0.2s;
}

.btn-confirm:hover {
  background-color: #3aa6c5;
}
</style>