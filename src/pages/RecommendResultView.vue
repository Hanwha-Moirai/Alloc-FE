<template>
  <div class="recommend-result-page">
    <div class="page-header">
      <h1 class="page-title">프로젝트 적합한 인재 추천</h1>
      <p class="page-subtitle">추천 지표를 설정하고 적용 버튼을 눌러 인재를 조회하세요.</p>
    </div>

    <div class="summary-grid filter-grid">
      <div class="summary-card">
        <div class="card-label">예상 비용</div>
        <div class="card-content">
          <span class="value">11.8M</span>
          <span class="badge green">적정</span>
        </div>
      </div>

      <div class="summary-card filter-card">
        <div class="card-label">기술 적합도 (%)</div>
        <div class="slider-container">
          <input type="range" v-model="filters.techMatch" min="1" max="100" class="custom-slider" />
          <div class="slider-value-box">{{ filters.techMatch }}%</div>
        </div>
      </div>

      <div class="summary-card filter-card">
        <div class="card-label">경험 적합도 (%)</div>
        <div class="slider-container">
          <input type="range" v-model="filters.expMatch" min="1" max="100" class="custom-slider" />
          <div class="slider-value-box">{{ filters.expMatch }}%</div>
        </div>
      </div>

      <div class="summary-card filter-card">
        <div class="card-label">투입 가능성 (%)</div>
        <div class="slider-container">
          <input type="range" v-model="filters.availability" min="1" max="100" class="custom-slider" />
          <div class="slider-value-box">{{ filters.availability }}%</div>
        </div>
      </div>
    </div>

    <div class="list-container">
      <div class="list-action-header">
        <button class="btn-apply" @click="fetchRecommendedTalents">
          <span class="search-icon">🔍</span> 추천 인재 다시 조회하기
        </button>
      </div>

      <div class="list-card">
        <table class="talent-table">
          <thead>
          <tr>
            <th class="col-check"><input type="checkbox" /></th>
            <th>이름</th>
            <th>직군</th>
            <th>주력 기술</th>
            <th>단가</th>
            <th>현재 상태</th>
            <th class="col-score">기술 적합도</th>
            <th class="col-score">경험 적합도</th>
            <th class="col-score">투입 가능성</th>
            <th>선택</th>
          </tr>
          </thead>
          <tbody v-if="!isLoading">
          <tr v-for="(item, idx) in talentList" :key="idx" :class="{ selected: item.isSelected }">
            <td class="col-check"><input type="checkbox" v-model="item.isSelected" /></td>
            <td class="name-cell">
              <div class="avatar"><img src="/user.png" class="avatar-img" /></div>
              {{ item.name }}
            </td>
            <td>{{ item.role }}</td>
            <td><span class="tech-tag">{{ item.mainTech }}</span></td>
            <td>{{ item.cost.toLocaleString() }}</td>
            <td>
                <span class="status-dot" :class="item.status === '투입중' ? 'on' : 'wait'">
                  ● {{ item.status }}
                </span>
            </td>
            <td class="score-text highlight">{{ item.techScore }}%</td>
            <td class="score-text highlight">{{ item.expScore }}%</td>
            <td class="score-text highlight">{{ item.availScore }}%</td>
            <td>
              <button v-if="!item.isSelected" class="btn-action select" @click="item.isSelected = true">
                + 선택
              </button>
              <button v-else class="btn-action remove" @click="item.isSelected = false">
                ✕ 제거
              </button>
            </td>
          </tr>
          </tbody>
        </table>
        <div v-if="isLoading" class="loading-state">데이터를 불러오는 중입니다...</div>
      </div>
    </div>

    <div class="footer-actions">
      <button class="btn-submit" @click="handleRegister">등록하기</button>
    </div>

    <RegisterSuccessModal v-if="showRegisterModal" @close="showRegisterModal = false" @confirm="goToProjectList" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import RegisterSuccessModal from '@/components/common/RegisterSuccessModal.vue';

const router = useRouter();
const showRegisterModal = ref(false);
const isLoading = ref(false);

const filters = ref({
  techMatch: 80,
  expMatch: 70,
  availability: 50
});

const talentList = ref([]);

const fetchRecommendedTalents = async () => {
  isLoading.value = true;
  // 임시 API 지연 재현
  setTimeout(() => {
    talentList.value = [
      { name: '홍길동', role: '백엔드 엔지니어', mainTech: 'Spring Boot', cost: 5000000, status: '대기중', techScore: 95, expScore: 88, availScore: 100, isSelected: false },
      { name: '김철수', role: '프론트엔드 엔지니어', mainTech: 'Vue.js', cost: 4500000, status: '투입중', techScore: 82, expScore: 75, availScore: 40, isSelected: true },
      { name: '이영희', role: 'UI/UX 디자이너', mainTech: 'Figma', cost: 4800000, status: '대기중', techScore: 90, expScore: 92, availScore: 95, isSelected: false }
    ];
    isLoading.value = false;
  }, 300);
};

onMounted(() => {
  fetchRecommendedTalents();
});

const handleRegister = () => showRegisterModal.value = true;
const goToProjectList = () => {
  showRegisterModal.value = false;
  router.push('/projects');
};
</script>

<style scoped>
/* 헤더 */
.page-header { margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 700; margin: 0; }
.page-subtitle { color: #64748b; font-size: 14px; }

/* 요약 카드 */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.summary-card {
  background: white;
  padding: 16px 20px;
  border: 1px solid #e2e8f0;
}
.card-label { font-size: 13px; color: #64748b; margin-bottom: 10px; }
.card-content { display: flex; justify-content: space-between; align-items: center; }
.card-content .value { font-size: 20px; font-weight: 700; }

/* 배지 스타일 */
.badge { padding: 4px 12px; font-size: 11px; font-weight: 700; }
.badge.green { background: #eafaf1; color: #2ecc71; }
.badge.gray { background: #f1f5f9; color: #64748b; }
.badge.yellow { background: #fffbeb; color: #f59e0b; }

/* 테이블 영역 */
.list-card { background: white; border: 1px solid #e2e8f0; overflow: hidden; }
.talent-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.talent-table th { background: #f8fafc; padding: 12px 16px; text-align: left; color: #475569; border-bottom: 1px solid #e2e8f0; }
.talent-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.talent-table tr.selected { background-color: #f0f9ff; }

.name-cell { display: flex; align-items: center; gap: 8px; font-weight: 500; }
.avatar { width: 28px; height: 28px; background: #e2e8f0; border-radius: 50%; }
.tech-tag { background: #f1f5f9; padding: 2px 8px; color: #64748b; font-size: 11px; }

.name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
  color: #334155;
}

.avatar {
  width: 32px;
  height: 32px;
  background-color: #f1f5f9;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.col-score {
  text-align: center !important;
  width: 100px;
}

.score-text {
  text-align: center;
  color: #64748b;
  font-weight: 500;
}

/* 상태 도트 */
.status-dot.on { color: #2ecc71; }
.status-dot.wait { color: #94a3b8; }

/* 버튼 스타일 */
.btn-action {
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  width: 70px;
  justify-content: center;
}
.btn-action.select { border: 1px solid #4ab8d8; background: white; color: #4ab8d8; }
.btn-action.remove { border: 1px solid #94a3b8; background: #94a3b8; color: white; }

/* 푸터 */
.footer-actions { display: flex; justify-content: center; margin-top: 40px; }
.btn-submit {
  background-color: #4ab8d8;
  color: white;
  border: none;
  padding: 12px 48px;
  font-size: 16px;
  cursor: pointer;
}

/* 슬라이더 */
.slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.custom-slider {
  flex: 1;
  -webkit-appearance: none;
  height: 6px;
  background: #e2e8f0;
  border-radius: 5px;
  outline: none;
}

.custom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: #4ab8d8;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.slider-value-box {
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #4ab8d8;
  min-width: 40px;
  text-align: center;
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-action-header {
  display: flex;
  justify-content: flex-end; /* 노란색 위치로 우측 정렬 */
}

.btn-apply {
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-apply:hover {
  background: #f8fafc;
  border-color: #4ab8d8;
  color: #4ab8d8;
}
</style>