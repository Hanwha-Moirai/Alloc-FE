<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-window">
        <div class="modal-header">
          <h2 class="title">사용자 {{ isEdit ? '수정하기' : '추가하기' }}</h2>
          <button class="close-btn" @click="$emit('close')">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="input-label">사용자 ID</label>
            <div class="input-wrapper">
              <input type="text" v-model="formData.userId" placeholder="ID 입력" class="form-input" :disabled="isEdit" />
            </div>
          </div>

          <div class="form-group">
            <label class="input-label">비밀번호</label>
            <div class="input-wrapper">
              <input type="password" v-model="formData.password" placeholder="비밀번호 입력" class="form-input" />
            </div>
            <p class="helper-text">영문, 숫자, 특수문자 중 2종류 이상을 조합하여 최소 10자리 이상</p>
          </div>

          <div class="form-group">
            <label class="input-label">이름</label>
            <div class="input-wrapper">
              <input type="text" v-model="formData.name" placeholder="이름 입력" class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label class="input-label">이메일</label>
            <div class="input-wrapper">
              <input type="email" v-model="formData.email" placeholder="이메일 입력" class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label class="input-label">연락처</label>
            <div class="input-wrapper">
              <input type="text" v-model="formData.phone" placeholder="연락처 입력" class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label class="input-label">생년월일</label>
            <div class="input-wrapper date-field-wrapper">
              <input
                  type="date"
                  v-model="formData.birthDate"
                  class="form-input date-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="input-label">직군</label>
            <div class="input-wrapper select-wrapper">
              <select v-model="formData.jobGroup" class="form-input">
                <option v-for="job in jobOptions" :key="job" :value="job">{{ job }}</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="input-label">직급</label>
            <div class="input-wrapper select-wrapper">
              <select v-model="formData.position" class="form-input">
                <option v-for="pos in positionOptions" :key="pos" :value="pos">{{ pos }}</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="input-label">부서</label>
            <div class="input-wrapper select-wrapper">
              <select v-model="formData.department" class="form-input">
                <option v-for="dept in deptOptions" :key="dept" :value="dept">{{ dept }}</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="input-label">권한</label>
            <div class="input-wrapper select-wrapper">
              <select v-model="formData.role" class="form-input">
                <option value="ADMIN">ADMIN</option>
                <option value="PM">PM</option>
                <option value="USER">USER</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="input-label">프로필 이미지</label>
            <div class="image-upload-box">
              <div v-if="!imagePreview" class="placeholder-img">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="21" x2="21" y2="3"></line>
                </svg>
              </div>
              <img v-else :src="imagePreview" class="preview-img" />
              <button class="image-add-btn" @click="triggerFileInput">
                <span>+</span> 이미지 추가
              </button>
              <input type="file" ref="fileInput" @change="onFileChange" hidden accept="image/*" />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-cancel" @click="$emit('close')">취소</button>
          <button class="btn btn-submit" @click="handleConfirm">
            {{ isEdit ? '수정' : '등록' }}
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
  initialData?: any;
}>();

const emit = defineEmits(['close', 'confirm']);

// --- 옵션 데이터 리스트 ---
const jobOptions = ['백엔드 개발자', '프론트엔드 개발자', 'UI/UX 디자이너', '기획자', '데브옵스'];
const positionOptions = ['사원', '대리', '과장', '차장', '부장'];
const deptOptions = ['정보보안팀', '플랫폼개발팀', '인프라팀', '디자인팀', '기획팀'];

const fileInput = ref<HTMLInputElement | null>(null);
const imagePreview = ref<string | null>(null);

const formData = ref({
  userId: '',
  password: '',
  name: '',
  email: '',
  phone: '',
  birthDate: '2000-01-01',
  jobGroup: '백엔드 개발자', // 초기값
  position: '대리',        // 초기값
  department: '정보보안팀',  // 초기값
  role: 'ADMIN',
  profileImage: null as File | null
});

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.isEdit && props.initialData) {
      formData.value = { ...props.initialData, password: '' };
      imagePreview.value = props.initialData.profileImageUrl || null;
    } else {
      formData.value = {
        userId: '', password: '', name: '', email: '',
        phone: '', birthDate: '2000-01-01',
        jobGroup: '백엔드 개발자', position: '대리', department: '정보보안팀',
        role: 'ADMIN', profileImage: null
      };
      imagePreview.value = null;
    }
  }
});

const triggerFileInput = () => fileInput.value?.click();
const onFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    formData.value.profileImage = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};
const handleConfirm = () => emit('confirm', { ...formData.value });
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 10000;
}

.modal-window {
  background: white;
  width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 30px;
  border-radius: 2px;
}

.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 25px;
}

.title { font-size: 24px; font-weight: 700; color: #333; margin: 0; }

.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; }

.form-group { margin-bottom: 20px; }

.input-label {
  display: block; font-size: 13px; font-weight: 600; color: #444; margin-bottom: 8px;
}

.input-wrapper {
  background-color: #f8fafc;
  border-bottom: 2px solid #4ab8d8;
}

.form-input {
  width: 100%; padding: 12px 14px; border: none; background: transparent;
  outline: none; font-size: 14px; color: #333;
}

.helper-text { font-size: 11px; color: #ef4444; margin-top: 6px; }

.select-wrapper {
  position: relative;
}

.date-field-wrapper {
  display: flex;
  align-items: center;
  background-color: #f8fafc;
  border-bottom: 2px solid #4ab8d8;
}

.date-input {
  flex: 1; /* 남은 공간을 모두 차지 */
  cursor: pointer;
  position: relative;
  background: transparent;
  padding-right: 10px; /* 아이콘과 텍스트 사이 여백 */
}

.date-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  margin-left: 0;
  padding: 0;
  opacity: 0.6;
  /* 아이콘을 입력란 안쪽 오른쪽 끝에 고정 */
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
}

/* 이미지 업로드 영역 */
.image-upload-box {
  background-color: #f1f5f9;
  height: 200px;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  position: relative; border-radius: 4px; overflow: hidden;
}

.placeholder-img { opacity: 0.5; }

.preview-img { width: 100%; height: 100%; object-fit: cover; }

.image-add-btn {
  position: absolute; bottom: 0; width: 100%;
  background-color: #4ab8d8; color: white; border: none;
  padding: 12px; cursor: pointer; font-size: 13px;
  display: flex; justify-content: center; align-items: center; gap: 8px;
}

.modal-footer {
  display: flex; gap: 12px; margin-top: 30px;
}

.btn { flex: 1; height: 48px; cursor: pointer; }
.btn-cancel { background: white; border: 1px solid #4ab8d8; color: #4ab8d8; }
.btn-submit { background: #4ab8d8; border: none; color: white; }

.modal-window::-webkit-scrollbar { width: 6px; }
.modal-window::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
</style>