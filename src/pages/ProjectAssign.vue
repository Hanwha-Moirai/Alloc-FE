<template>
  <div class="recommend-result-page">
    <div class="page-header">
      <h1 class="page-title">프로젝트 적합한 인재 추천</h1>
      <p class="page-subtitle">
        추천 지표를 설정하고 적용 버튼을 눌러 인재를 조회하세요.
      </p>
    </div>

    <!-- 요약 영역 -->
    <div class="summary-grid filter-grid">
      <div class="summary-card">
        <div class="card-label">예상 비용</div>
        <div class="card-content">
          <span class="value">{{ formattedEstimatedCost }}</span>
          <span
              class="badge"
              :class="estimatedCost > 0 ? 'green' : 'gray'"
          >
            {{ estimatedCost > 0 ? '적정' : '미선택' }}
          </span>
        </div>
      </div>

      <div class="summary-card filter-card">
        <div class="card-label">기술 적합도 (%)</div>
        <div class="slider-container">
          <input
              type="range"
              v-model="filters.techMatch"
              min="1"
              max="100"
              class="custom-slider"
          />
          <div class="slider-value-box">{{ filters.techMatch }}%</div>
        </div>
      </div>

      <div class="summary-card filter-card">
        <div class="card-label">경험 적합도 (%)</div>
        <div class="slider-container">
          <input
              type="range"
              v-model="filters.expMatch"
              min="1"
              max="100"
              class="custom-slider"
          />
          <div class="slider-value-box">{{ filters.expMatch }}%</div>
        </div>
      </div>

      <div class="summary-card filter-card">
        <div class="card-label">투입 가능성 (%)</div>
        <div class="slider-container">
          <input
              type="range"
              v-model="filters.availability"
              min="1"
              max="100"
              class="custom-slider"
          />
          <div class="slider-value-box">{{ filters.availability }}%</div>
        </div>
      </div>
    </div>

    <!-- 리스트 -->
    <div class="list-container">
      <div class="list-action-header">
        <button class="btn-apply" @click="fetchAssignCandidates">
          <span class="search-icon">🔍</span> 추천 인재 다시 조회하기
        </button>
      </div>

      <div class="list-card">
        <table class="talent-table">
          <thead>
          <tr>
            <th class="col-check"></th>
            <th>이름</th>
            <th>직군</th>
            <th>주력 기술</th>
            <th>단가</th>
            <th>현재 상태</th>
            <th class="col-score">기술</th>
            <th class="col-score">경험</th>
            <th class="col-score">투입</th>
            <th>선택</th>
          </tr>
          </thead>

          <tbody v-if="!isLoading">
          <tr v-if="filteredAssignments.length === 0">
            <td colspan="10" style="text-align:center; padding:40px;">
              배치 가능한 후보가 없습니다.
            </td>
          </tr>

          <template
              v-for="job in filteredAssignments"
              :key="job.jobId"
          >
            <!-- 직군 헤더 -->
            <tr class="job-header">
              <td colspan="10">
                <strong>{{ job.jobName }}</strong>
                ({{ job.requiredCount }}명 선택)
              </td>
            </tr>

            <!-- 후보 -->
            <tr
                v-for="candidate in job.candidates"
                :key="candidate.userId"
            >
              <td class="col-check">
                <input
                    type="checkbox"
                    v-model="candidate.isSelected"
                />
              </td>

              <td class="name-cell">
                <div class="avatar">
                  <img src="/user.png" class="avatar-img" />
                </div>
                {{ candidate.userName }}
              </td>

              <td>{{ job.jobName }}</td>

              <td>
                  <span class="tech-tag">
                    {{ candidate.mainSkill || '-' }}
                  </span>
              </td>

              <td>
                {{ candidate.monthlyWage?.toLocaleString() || '-' }}
              </td>

              <td>
                <span class="status-dot wait">● 대기중</span>
              </td>

              <td class="score-text">{{ candidate.skillScore }}%</td>
              <td class="score-text">{{ candidate.experienceScore }}%</td>
              <td class="score-text">{{ candidate.availabilityScore }}%</td>

              <td>
                <button
                    v-if="!candidate.isSelected"
                    class="btn-action select"
                    @click="candidate.isSelected = true"
                >
                  + 선택
                </button>

                <button
                    v-else
                    class="btn-action remove"
                    @click="candidate.isSelected = false"
                >
                  ✕ 제거
                </button>
              </td>
            </tr>
          </template>
          </tbody>
        </table>

        <div v-if="isLoading" class="loading-state">
          데이터 불러오는 중입니다...
        </div>
      </div>
    </div>

    <div class="footer-actions">
      <button class="btn-submit" @click="handleRegister">
        등록하기
      </button>
    </div>

    <RegisterSuccessModal
        v-if="showRegisterModal"
        @close="showRegisterModal = false"
        @confirm="goToProjectList"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import RegisterSuccessModal from '@/components/common/RegisterSuccessModal.vue';
import {
  fetchProjectAssignCandidates,
  submitAssignment
} from '@/api/projectAssign';

const router = useRouter();
const route = useRoute();
const projectId = route.params.projectId as string;

const showRegisterModal = ref(false);
const isLoading = ref(false);
const assignments = ref<any[]>([]);

const filters = ref({
  techMatch: 0,
  expMatch: 0,
  availability: 0
});

// 필터 적용된 결과
const filteredAssignments = computed(() => {
  return assignments.value
      .map(job => {
        const filteredCandidates = job.candidates.filter(c =>
            c.skillScore >= filters.value.techMatch &&
            c.experienceScore >= filters.value.expMatch &&
            c.availabilityScore >= filters.value.availability
        );

        return {
          jobId: job.jobId,
          jobName: job.jobName,
          requiredCount: job.requiredCount,
          candidates: filteredCandidates   // ⭐ 원본 candidate 참조 유지
        };
      })
      .filter(job => job.candidates.length > 0);
});

// 예상 비용 계산
const estimatedCost = computed(() => {
  return assignments.value
      .flatMap(job => job.candidates ?? [])
      .filter(c => c.isSelected)
      .reduce((sum, c) => sum + (c.monthlyWage ?? 0), 0);
});

const formattedEstimatedCost = computed(() => {
  if (estimatedCost.value === 0) return '0';
  return (estimatedCost.value / 1_000_000).toFixed(1) + 'M';
});

// 후보 조회
const fetchAssignCandidates = async () => {
  isLoading.value = true;
  try {
    const res = await fetchProjectAssignCandidates(projectId);

    const flatCandidates = res.data.candidates ?? [];
    const jobSummaries = res.data.jobSummaries ?? [];

    assignments.value = jobSummaries.map((job: any) => ({
      jobId: job.jobId,
      jobName: job.jobName,
      requiredCount: job.requiredCount,
      candidates: flatCandidates
          .filter((c: any) => c.jobName === job.jobName)
          .map((c: any) => ({
            ...c,
            isSelected: false
          }))
    }));

  } catch (e) {
    console.error('배치 후보 조회 실패', e);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchAssignCandidates);

// 등록 처리
const handleRegister = async () => {
  try {
    for (const job of assignments.value) {
      const selected = job.candidates.filter((c: any) => c.isSelected);
      if (selected.length !== job.requiredCount) {
        alert(`${job.jobName}은 ${job.requiredCount}명을 선택해야 합니다.`);
        return;
      }
    }

    const payload = {
      projectId,
      assignments: assignments.value.map(job => ({
        jobId: job.jobId,
        candidates: job.candidates
            .filter((c: any) => c.isSelected)
            .map((c: any) => ({
              userId: c.userId,
              fitnessScore: c.fitnessScore
            }))
      }))
    };

    await submitAssignment(projectId, payload);
    showRegisterModal.value = true;
  } catch (e) {
    console.error('인력 배치 확정 실패', e);
  }
};

const goToProjectMembers = () => {
  showRegisterModal.value = false;
  router.push(`/projects/${projectId}/members`);
};
</script>

<style scoped>
/* 헤더 */
.page-header { margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 700; margin: 0; }
.page-subtitle { color: #64748b; font-size: 14px; }
.job-header td {
  background: #f8fafc;
  font-weight: 700;
  color: #334155;
}

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