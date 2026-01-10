<template>
  <div class="recommend-result-page">
    <div class="page-header">
      <h1 class="page-title">프로젝트 적합한 인재 추천</h1>
      <p class="page-subtitle">프로젝트 내용 기준으로 투입에 적합한 인재 리스트를 제공합니다.</p>
    </div>

    <div class="summary-grid">
      <div class="summary-card">
        <div class="card-label">예상 비용</div>
        <div class="card-content">
          <span class="value">11.8M</span>
          <span class="badge green">적정</span>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-label">백엔드 엔지니어</div>
        <div class="card-content">
          <span class="value">0 / 3</span>
          <span class="badge gray">미선택</span>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-label">프론트엔드 엔지니어</div>
        <div class="card-content">
          <span class="value">1 / 3</span>
          <span class="badge yellow">미충족</span>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-label">UI/UX 디자이너</div>
        <div class="card-content">
          <span class="value">0 / 1</span>
          <span class="badge gray">미선택</span>
        </div>
      </div>
    </div>

    <div class="list-card">
      <table class="talent-table">
        <thead>
        <tr>
          <th class="col-check"><input type="checkbox" /></th>
          <th>이름 <span class="sort-icon">↓</span></th>
          <th>직군</th>
          <th>주력 기술</th>
          <th>단가</th>
          <th>현재 투입 상태</th>
          <th>적합도</th>
          <th>선택여부</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in talentList" :key="idx" :class="{ selected: item.isSelected }">
          <td class="col-check"><input type="checkbox" v-model="item.isSelected" /></td>
          <td class="name-cell">
            <div class="avatar">
              <img src="/user.png" alt="profile" class="avatar-img" />
            </div>
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
          <td class="match-rate">{{ item.matchRate }}%</td>
          <td>
            <button
                v-if="!item.isSelected"
                class="btn-action select"
                @click="item.isSelected = true"
            >
              <span class="plus">+</span> 선택
            </button>

            <button
                v-else
                class="btn-action remove"
                @click="item.isSelected = false"
            >
              <span class="minus">✕</span> 제거
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="recommend-result-page">
      <div class="footer-actions">
        <button class="btn-submit" @click="handleRegister">등록하기</button>
      </div>

      <RegisterSuccessModal
          v-if="showRegisterModal"
          @close="showRegisterModal = false"
          @confirm="goToProjectList"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import RegisterSuccessModal from '@/components/common/RegisterSuccessModal.vue'

const router = useRouter()
const showRegisterModal = ref(false)

const talentList = ref([
  { name: '홍길동', role: '백엔드 엔지니어', mainTech: 'Spring Boot', cost: 5000000, status: '대기중', matchRate: 87, isSelected: false },
  { name: '홍길동', role: '백엔드 엔지니어', mainTech: 'Spring Boot', cost: 5000000, status: '투입중', matchRate: 87, isSelected: true },
  { name: '홍길동', role: '백엔드 엔지니어', mainTech: 'Spring Boot', cost: 5000000, status: '대기중', matchRate: 87, isSelected: false },
  { name: '홍길동', role: '백엔드 엔지니어', mainTech: 'Spring Boot', cost: 5000000, status: '대기중', matchRate: 87, isSelected: false },
  { name: '홍길동', role: '백엔드 엔지니어', mainTech: 'Spring Boot', cost: 5000000, status: '투입중', matchRate: 87, isSelected: true },
  { name: '홍길동', role: '백엔드 엔지니어', mainTech: 'Spring Boot', cost: 5000000, status: '투입중', matchRate: 87, isSelected: true },
  { name: '홍길동', role: '백엔드 엔지니어', mainTech: 'Spring Boot', cost: 5000000, status: '대기중', matchRate: 87, isSelected: false },
])

// 등록하기 버튼 클릭 시 모달 노출
const handleRegister = () => {
  showRegisterModal.value = true
}

// 모달에서 확인 버튼 클릭 시 목록으로 이동
const goToProjectList = () => {
  showRegisterModal.value = false
  router.push('/projects')
}
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
</style>