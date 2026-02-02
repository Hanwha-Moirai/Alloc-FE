<template>
  <div class="modal-overlay" @click.self="closable && emitClose()">
    <div class="modal-content">
      <button
          v-if="closable"
          class="close-x"
          @click="emitClose"
      >
        ×
      </button>

      <div class="loading-icon">
        <img :src="iconSrc" :alt="title" class="gif-img" />
      </div>

      <h2 class="modal-title">{{ title }}</h2>
      <p class="modal-message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  iconSrc: {
    type: String,
    default: '/loading.gif'
  },
  closable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])
const emitClose = () => emit('close')
</script>


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
  padding: 30px 20px 40px;
  text-align: center;
  position: relative;
  border-radius: 2px;
}

.close-x {
  position: absolute;
  top: 10px; right: 15px;
  background: none; border: none; font-size: 20px; cursor: pointer; color: #666;
}

.loading-icon {
  width: 60px;
  height: 60px;
  background-color: #f8fafc;
  margin: 0 auto 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
}

.gif-img {
  width: 80%;
  height: 80%;
  object-fit: contain;
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
  margin: 12px 0 0 0;
  line-height: 1.5;
}
</style>