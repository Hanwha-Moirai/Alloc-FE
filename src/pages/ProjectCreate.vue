<template>
  <div class="project-create">

    <div class="page-header">
      <h1 class="page-title">프로젝트 등록</h1>
    </div>

    <!-- 프로젝트명 -->
    <div class="form-group">
      <label class="label">프로젝트명</label>
      <input
          type="text"
          class="input"
          placeholder="프로젝트명 입력"
          v-model="project.name"
      />
    </div>

    <!-- 프로젝트 기간 / 고객사 / 예산 -->
    <div class="row">
      <div class="form-group">
        <label class="label">프로젝트 시작일</label>
        <input
            type="date"
            class="input"
            v-model="project.startDate"
        />
      </div>

      <div class="form-group">
        <label class="label">프로젝트 종료일</label>
        <input
            type="date"
            class="input"
            :min="project.startDate"
            v-model="project.endDate"
        />
      </div>

      <div class="form-group">
        <label class="label">협력/고객사</label>
        <input
            type="text"
            class="input"
            placeholder="협력/고객사 입력"
            v-model="project.client"
        />
      </div>

      <div class="form-group">
        <label class="label">예산</label>
        <input
            type="text"
            class="input"
            placeholder="예산 입력"
            v-model="budgetDisplay"
        />
      </div>
    </div>

    <!-- 프로젝트 유형 -->
    <div class="form-group">
      <label class="label">프로젝트 유형</label>
      <div class="radio-group">
        <label v-for="type in projectTypes" :key="type" class="radio-item">
          <input type="radio" :value="type" v-model="project.type" />
          <span>{{ type }}</span>
        </label>
      </div>
    </div>

    <!-- 프로젝트 설명 -->
    <div class="form-group">
      <label class="label">프로젝트 설명</label>
      <input
          type="text"
          class="input"
          placeholder="프로젝트 설명 입력"
          v-model="project.description"
      />
    </div>

    <!-- 직군 정의 -->
    <div class="section">
      <label class="label">프로젝트 직군 정의</label>

      <div class="line-row" v-for="(role, index) in roles" :key="`role-${index}`">
        <select class="input" v-model="role.name">
          <option disabled value="">직군 선택</option>
          <option>Backend</option>
          <option>Frontend</option>
          <option>DevOps</option>
          <option>PM</option>
          <option>Designer</option>
        </select>

        <input
            type="number"
            class="input"
            placeholder="필요 인원"
            v-model="role.count"
        />

        <button
            class="delete-btn"
            @click="removeRole(index)"
            :disabled="roles.length === 1"
            title="삭제"
        >
          ✕
        </button>
      </div>

      <button class="add-btn" @click="addRole">+ 직군 추가하기</button>
    </div>

    <!-- 기술 정의 -->
    <div class="section">
      <label class="label">필요 기술스택 정의</label>

      <div class="line-row" v-for="(tech, index) in techs" :key="`tech-${index}`">
        <select class="input" v-model="tech.name">
          <option disabled value="">기술 선택</option>
          <option>Spring Boot</option>
          <option>Vue</option>
          <option>React</option>
          <option>Docker</option>
          <option>Kubernetes</option>
        </select>

        <select class="input" v-model="tech.level">
          <option disabled value="">LV 선택</option>
          <option>L1</option>
          <option>L2</option>
          <option>L3</option>
        </select>

        <button
            class="delete-btn"
            @click="removeTech(index)"
            :disabled="techs.length === 1"
            title="삭제"
        >
          ✕
        </button>
      </div>

      <button class="add-btn" @click="addTech">+ 기술 추가하기</button>
    </div>

    <!-- 하단 버튼 -->
    <div class="footer">
      <button class="outline-btn">PDF 등록하기</button>
      <button class="primary-btn" @click="handleSave">
        저장
      </button>
      <button class="gradient-btn" @click="handleRecommend">
        적합한 인재 추천받기
      </button>
    </div>

    <SaveSuccessModal
        v-if="showSuccessModal"
        @close="showSuccessModal = false"
    />

    <RecommendModal
        v-if="showRecommendModal"
        @close="showRecommendModal = false"
    />

  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import SaveSuccessModal from '@/components/common/SaveSuccessModal.vue'
import RecommendModal from '@/components/common/RecommendModal.vue'

// 라우터 인스턴스 생성
const router = useRouter()

const project = ref({
  name: '',
  period: '',
  client: '',
  budget: 0,
  type: '신규 개발',
  description: '',
})

const projectTypes = ['신규 개발', '운영', '유지보수']

const roles = ref([{ name: '', count: '' }])
const techs = ref([{ name: '', level: '' }])

const addRole = () => roles.value.push({ name: '', count: '' })
const removeRole = (index) => {
  if (roles.value.length === 1) return
  roles.value.splice(index, 1)
}

const addTech = () => techs.value.push({ name: '', level: '' })
const removeTech = (index) => {
  if (techs.value.length === 1) return
  techs.value.splice(index, 1)
}

/* 예산 표시용 */
const budgetDisplay = ref('')

watch(budgetDisplay, (value) => {
  const numeric = value.replace(/[^0-9]/g, '')
  project.value.budget = Number(numeric)
  budgetDisplay.value = numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
})

// 모달 표시 상태 변수
const showSuccessModal = ref(false)
const showRecommendModal = ref(false)

// 저장 버튼 클릭 핸들러
const handleSave = () => {
  // 실제로는 여기서 API 통신 등을 처리합니다.
  showSuccessModal.value = true
}

// 인재 추천 버튼 클릭 핸들러 수정
const handleRecommend = async () => {
  // 1. 유효성 검사 (필요 시)
  if (!project.value.name) {
    alert('프로젝트명을 입력해주세요.');
    return;
  }

  // 2. 로딩 모달(GIF) 표시
  showRecommendModal.value = true;

  try {
    // 3. 실제 DB에 저장하고 ID를 받아오는 로직 (예시 API 호출)
    // const response = await api.post('/projects', project.value);
    // const newProjectId = response.data.id;

    // 테스트용 임시 ID (실제 연동 시 위 API 결과값 사용)
    const tempId = 1;

    // 4. GIF가 충분히 보일 시간(3초) 대기
    setTimeout(() => {
      showRecommendModal.value = false;

      router.push(`/projects/${tempId}/recommend`);
    }, 3000);

  } catch (error) {
    console.error('저장 실패:', error);
    showRecommendModal.value = false;
    alert('프로젝트 저장 중 오류가 발생했습니다.');
  }
}
</script>

<style scoped>
.page-header {
  margin-bottom: 28px;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #111;
  margin: 0;
}
.page-subtitle {
  margin-top: 6px;
  font-size: 14px;
  color: #666;
}

/* 공통 */
.label {
  font-size: 14px;
  margin-bottom: 10px;
  color: #333;
  display: block;
}

.form-group {
  flex: 1;
  margin-bottom: 20px;
}

.input {
  width: 100%;
  background: #fff;
  border: none;
  border-bottom: 1px solid #d9d9d9;
  padding: 10px 4px;
  font-size: 14px;
  outline: none;
}
.input:focus {
  border-bottom-color: #4ab5d8;
}

/* 행 정렬 */
.row {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

/* 직군/기술 행 (삭제 버튼 포함) */
.line-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

/* 라디오 */
.radio-group {
  display: flex;
  gap: 24px;
  align-items: center;
}
.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 섹션 */
.section {
  margin-top: 32px;
}

/* 추가 버튼 */
.add-btn {
  margin-top: 8px;
  background: #fff;
  border: 1px solid #4ab5d8;
  color: #4ab5d8;
  padding: 8px 12px;
  cursor: pointer;
}

/* 삭제 버튼 */
.delete-btn {
  width: 34px;
  height: 34px;
  border: none;
  background: transparent;
  color: #999;
  font-size: 18px;
  cursor: pointer;
}
.delete-btn:disabled {
  color: #ddd;
  cursor: not-allowed;
}

/* 하단 버튼 */
.footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 40px;
}

.outline-btn {
  background: #fff;
  border: 1px solid #4ab5d8;
  color: #4ab5d8;
  padding: 10px 16px;
  cursor: pointer;
}

.primary-btn {
  background: #4ab5d8;
  color: #fff;
  border: none;
  padding: 10px 16px;
  cursor: pointer;
}

.gradient-btn {
  background: linear-gradient(90deg, #4ab5d8, #8b6cff);
  color: #fff;
  border: none;
  padding: 10px 18px;
  cursor: pointer;
}
</style>
