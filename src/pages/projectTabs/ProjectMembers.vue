<template>
  <div class="members-container">
    <div class="summary-cards">
      <div class="card">
        <span class="card-label">프로젝트 인원</span>
        <div class="card-value">
          총 <span class="highlight">{{ memberList.length }} 명</span> 선정
        </div>
      </div>
      <div class="card">
        <span class="card-label">응답 대기</span>
        <div class="card-value">{{ projectStatus === 'DRAFT' ? '-' : 2 }}</div>
      </div>
      <div class="card">
        <span class="card-label">수락</span>
        <div class="card-value">{{ projectStatus === 'DRAFT' ? '-' : 3 }}</div>
      </div>
      <div class="card">
        <span class="card-label">면담요청</span>
        <div class="card-value">{{ projectStatus === 'DRAFT' ? '-' : 1 }}</div>
      </div>
    </div>

    <div class="list-section">
      <div class="list-header">
        <h3 class="section-title">인원 리스트</h3>
        <div class="action-buttons">
          <button
              v-if="memberList.length === 1"
              class="btn-gradient"
              @click="handleRecommend"
          >
            ✨ 인재 추천받기
          </button>
          <button class="btn-outline">인원 추가</button>
          <button class="btn-primary">저장</button>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="member-table">
          <thead>
          <tr>
            <th>이름 ↓</th>
            <th>직군</th>
            <th>주력 기술</th>
            <th>적합도</th>
            <th>단가</th>
            <th>현재 투입 상태</th>
            <th>요청 상태</th>
            <th>의사 결정</th>
            <th>최종 결정</th>
          </tr>
          </thead>

          <!-- DRAFT가 아닐 때 -->
          <tbody v-if="projectStatus !== 'DRAFT'">
          <tr v-for="member in memberList" :key="member.userId">
            <td class="name-cell">
              <img src="/user.png" class="user-icon" />
              {{ member.name }}
            </td>
            <td>{{ member.role }}</td>
            <td>
              <span class="skill-tag">{{ member.skill || '-' }}</span>
            </td>
            <td>{{ member.fit }}%</td>
            <td>{{ member.price?.toLocaleString?.() || '-' }}</td>
            <td>{{ member.workStatus === 'AVAILABLE' ? '대기중' : '투입중' }}</td>
            <td>
              <span class="badge bright-green">투입</span>
            </td>
            <td>-</td>
            <td>-</td>
          </tr>
          </tbody>

          <!-- DRAFT일 때 -->
          <tbody v-else>
          <tr>
            <td colspan="9" class="empty-row">
              인재 추천을 통해 프로젝트 멤버를 구성해보세요.
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <RecommendModal v-if="showRecommendModal" @close="showRecommendModal = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import RecommendModal from '@/components/common/RecommendModal.vue';
import { fetchProjectDetail } from '@/api/project';
import { fetchAssignmentManagementPage } from '@/api/projectAssign';

const router = useRouter();
const route = useRoute();
const projectId = route.params.projectId as string;

// 상태 관리
const projectStatus = ref('');
const showRecommendModal = ref(false);
const memberList = ref<any[]>([]);

// 상태 매핑
const mapStatus = (status: string) => {
  switch (status) {
    case '요청':
      return 'request';
    case '면담 요청':
      return 'interview';
    case '수락':
      return 'accept';
    default:
      return '';
  }
};

const mapDecision = (status: string) => {
  if (status === '요청') {
    return [
      { label: '면담 요청', class: 'red' },
      { label: '수락', class: 'green' }
    ];
  }
  if (status === '면담 요청') {
    return [{ label: '면담 요청', class: 'red' }];
  }
  if (status === '수락') {
    return [{ label: '수락', class: 'green' }];
  }
  return [];
};

const mapFinalDecision = (finalStatus?: string) => {
  if (!finalStatus) return [];
  if (finalStatus === '투입') {
    return [{ label: '투입', class: 'bright-green' }];
  }
  if (finalStatus === '제외') {
    return [{ label: '제외', class: 'dark-red' }];
  }
  return [];
};

// 프로젝트 인원 조회
const fetchMembers = async () => {
  const res = await fetchAssignmentManagementPage(projectId);

  console.log('📡 members raw response', res.data);

  const list = res.data.members;

  memberList.value = res.data.members.map((m: any) => ({
    userId: m.userId,
    name: m.userName,
    role: m.jobName,
    skill: m.mainSkill,
    fit: m.skillScore,
    price: m.monthlyWage,
    workStatus: m.workStatus,
    selected: m.selected
  }));
};


// 인재 추천 처리
const handleRecommend = () => {
  // 인력 배치 시작 화면으로 이동
  router.push(`/projects/${projectId}/assign`);
};

// 초기 로딩
onMounted(async () => {
  const res = await fetchProjectDetail(projectId);

  projectStatus.value = res.data?.status;

  await fetchMembers();
});
</script>

<style scoped>
/* 상단 카드 */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  padding: 15px 20px;
}

.card-label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}

.card-value {
  font-size: 20px;
  font-weight: 700;
  color: #111;
}

.card-value .highlight {
  font-size: 22px;
}

/* 리스트 헤더 */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.btn-outline {
  padding: 8px 16px;
  border: 1px solid #4ab8d8;
  background: #fff;
  color: #4ab8d8;
  cursor: pointer;
}

.btn-primary {
  padding: 8px 24px;
  border: none;
  background: #00bcd4;
  color: #fff;
  cursor: pointer;
}

.empty-row {
  text-align: center;
  color: #94a3b8;
  padding: 60px 0 !important;
  font-size: 14px;
}

.btn-gradient {
  padding: 8px 16px;
  border: none;
  background: linear-gradient(90deg, #4ab8d8, #8b6cff);
  color: #fff;
  cursor: pointer;
}

/* 테이블 */
.table-wrapper {
  background: #fff;
  border: 1px solid #e5e7eb;
}

.member-table {
  width: 100%;
  border-collapse: collapse;
}

.member-table th {
  background: #f8fafc;
  padding: 12px 15px;
  text-align: left;
  font-size: 13px;
  color: #4b5563;
  border-bottom: 1px solid #e5e7eb;
}

.member-table td {
  padding: 14px 15px;
  font-size: 13px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

/* 이름 */
.name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
  vertical-align: middle;
}

/* 스킬 태그 */
.skill-tag {
  background: #f1f3f6;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  color: #666;
}

/* 상태 점 */
.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 4px;
}
.status-dot.ongoing { background: #4caf50; }
.status-dot.request { background: #ff9800; }
.status-dot.interview { background: #f44336; }
.status-dot.accept { background: #4caf50; }

/* 결정 배지 */
.decision-group {
  display: flex;
  gap: 5px;
}

.badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
}

.badge.red { background: #ff4d4f; }
.badge.green { background: #52c41a; }
.badge.dark-red { background: #cf1322; }
.badge.bright-green { background: #23cc66; }
</style>