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
              <input type="text" v-model="formData.loginId" placeholder="ID 입력" class="form-input" :disabled="isEdit" />
            </div>
          </div>
          <div class="form-group">
            <label class="input-label">비밀번호</label>
            <div class="input-wrapper">
              <input type="password" v-model="formData.password" placeholder="비밀번호 입력" class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label class="input-label">이름</label>
            <div class="input-wrapper">
              <input type="text" v-model="formData.userName" placeholder="이름 입력" class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label class="input-label">생년월일</label>
            <div class="input-wrapper">
              <input type="date" v-model="formData.birthday" class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label class="input-label">입사일</label>
            <div class="input-wrapper">
              <input type="date" v-model="formData.hiringDate" class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label class="input-label">직군</label>
            <div class="input-wrapper select-wrapper">
              <select v-model="formData.jobId" class="form-input">
                <option v-for="job in jobs" :key="job.jobId" :value="job.jobId">
                  {{ job.jobName }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="input-label">직급</label>
            <div class="input-wrapper select-wrapper">
              <select v-model="formData.titleStandardId" class="form-input">
                <option
                    v-for="title in metaData.titles"
                    :key="title.titleStandardId"
                    :value="title.titleStandardId"
                >
                  {{ title.titleName }}
                </option>
              </select>

            </div>
          </div>

          <div class="form-group">
            <label class="input-label">부서</label>
            <div class="input-wrapper select-wrapper">
              <select v-model="formData.deptId" class="form-input">
                <option
                    v-for="dept in metaData.departments"
                    :key="dept.deptId"
                    :value="dept.deptId"
                >
                  {{ dept.deptName }}
                </option>
              </select>

            </div>
          </div>

          <div class="form-group">
            <label class="input-label">근무형태</label>
            <div class="input-wrapper select-wrapper">
              <select v-model="formData.employeeType" class="form-input">
                <option v-for="type in metaData.employeeTypes" :key="type.code" :value="type.code">
                  {{ type.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="input-label">권한</label>
            <div class="input-wrapper select-wrapper">
              <select v-model="formData.auth" class="form-input">
                <option v-for="auth in metaData.auths" :key="auth.code" :value="auth.code">
                  {{ auth.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="input-label">계정 상태</label>
            <div class="input-wrapper select-wrapper">
              <select v-model="formData.status" class="form-input">
                <option v-for="st in metaData.statuses" :key="st.code" :value="st.code">
                  {{ st.label }}
                </option>
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
import { ref, watch, onMounted } from 'vue';
import { getAdminUserMeta } from '@/api/admin';
import { fetchJobs } from '@/api/hr';

const props = defineProps<{ show: boolean; isEdit: boolean; initialData?: any; }>();
const emit = defineEmits(['close', 'confirm']);

const jobs = ref<any[]>([]);
const titles = ref<any[]>([]);
const metaData = ref({
  employeeTypes: [],
  auths: [],
  statuses: [],
  departments: [],
  titles: []
});

const fileInput = ref<HTMLInputElement | null>(null);
const imagePreview = ref<string | null>(null);

const formData = ref({
  loginId: '', password: '', userName: '', email: '', phone: '',
  birthday: '2000-01-01', hiringDate: new Date().toISOString().split('T')[0],
  employeeType: '', jobId: null as number | null, deptId: 1, titleStandardId: null as number | null,
  auth: '', status: 'ACTIVE', profileImg: ''
});

const resetForm = () => {
  formData.value = {
    loginId: '',
    password: '',
    userName: '',
    birthday: '2000-01-01',
    hiringDate: new Date().toISOString().split('T')[0],
    employeeType: metaData.value.employeeTypes[0]?.code,
    jobId: jobs.value[0]?.jobId,
    deptId: metaData.value.departments[0]?.deptId,
    titleStandardId: metaData.value.titles[0]?.titleStandardId,
    auth: metaData.value.auths[0]?.code,
    status: metaData.value.statuses[0]?.code,
    profileImg: ''
  };
};

const loadInitialData = async () => {
  try {
    const [metaRes, jobsRes] = await Promise.all([
      getAdminUserMeta(),
      fetchJobs()
    ]);

    const meta = metaRes?.data?.data;
    if (!meta) {
      console.error('❌ 메타 데이터 없음', metaRes);
      return;
    }

    metaData.value = {
      employeeTypes: meta.employeeTypes ?? [],
      auths: meta.auths ?? [],
      statuses: meta.statuses ?? [],
      titles: (meta.titles ?? []).map((t: any) => ({
        titleStandardId: t.id,
        titleName: t.label
      })),
      departments: (meta.departments ?? []).map((d: any) => ({
        deptId: d.id,
        deptName: d.label
      }))
    };

    if (jobsRes?.data?.data) {
      jobs.value = jobsRes.data.data;
    }

    if (!props.isEdit) {
      resetForm();
    }
  } catch (error) {
    console.error('❌ 데이터 로드 실패:', error);
  }
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.isEdit && props.initialData) {
      formData.value = { ...props.initialData, password: '' };
      imagePreview.value = props.initialData.profileImg || null;
    } else {
      resetForm();
    }
  }
}, { immediate: true });

onMounted(loadInitialData);

// 이미지 핸들링 로직
const triggerFileInput = () => fileInput.value?.click();
const onFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    imagePreview.value = URL.createObjectURL(file);
  }
};

const handleConfirm = () => {
  emit('confirm', { ...formData.value });
};
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