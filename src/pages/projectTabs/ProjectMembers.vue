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
        <div class="card-value">
          {{ memberList.length === 1 ? '-' : waitingCount }}
        </div>
      </div>
      <div class="card">
        <span class="card-label">수락</span>
        <div class="card-value">
          {{ memberList.length === 1 ? '-' : acceptedCount }}
        </div>
      </div>
      <div class="card">
        <span class="card-label">면담요청</span>
        <div class="card-value">
          {{ memberList.length === 1 ? '-' : interviewCount }}
        </div>
      </div>
    </div>

    <div class="list-section">
      <div class="list-header">
        <h3 class="section-title">인원 리스트</h3>
        <div class="action-buttons">
          <button
              v-if="myRole === 'PM' && memberList.length === 1"
              class="btn-gradient"
              @click="handleRecommend"
          >
            ✨ 인재 추천받기
          </button>
          <button v-if="myRole === 'PM'" class="btn-outline" @click="onAddMember">인원 추가</button>
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

          <tbody v-if="memberList.length !== 1">
          <tr v-for="member in memberList" :key="member.userId">
            <td class="name-cell">
              <img src="/user.png" class="user-icon" />
              {{ member.name }}
            </td>

            <td>{{ member.role }}</td>

            <td>
              <span class="skill-tag">{{ member.skill || '-' }}</span>
            </td>

            <td>{{ member.fit ?? '-' }}%</td>

            <td>{{ member.price?.toLocaleString?.() || '-' }}</td>

            <td>
              <span v-if="member.workStatus === 'AVAILABLE'" class="badge red">대기중</span>
              <span v-else-if="member.workStatus === 'ASSIGNED'" class="badge green">투입중</span>
              <span v-else>-</span>
            </td>

            <!-- 요청 상태 -->
            <td>
                <span
                    class="badge red"
                    v-if="member.requestStatus === 'REQUESTED'"
                >
                  투입 요청됨
                </span>

              <span
                  class="badge blue"
                  v-else-if="member.requestStatus === 'INTERVIEW_REQUESTED'"
              >
                  면담 요청됨
                </span>

              <span
                  class="badge green"
                  v-else-if="member.requestStatus === 'ACCEPTED'"
              >
                  수락
                </span>

              <span v-else>-</span>
            </td>

            <!-- 의사 결정 -->
            <td>
              <template
                  v-if="
                         myRole === 'USER' &&
                         member.requestStatus === 'REQUESTED' &&
                         member.userId === myUserId
                        "
              >
                <div class="button-group">
                  <button
                      class="btn btn-blue"
                      @click="onRequestInterview(member)"
                  >
                    면담 요청
                  </button>
                  <button
                      class="btn btn-green"
                      @click="onAcceptAssignment(member)"
                  >
                    수락
                  </button>
                </div>
              </template>

              <template v-else>
                -
              </template>
            </td>

            <!-- 최종 결정 -->
            <td>
              <!-- 1) 이미 결정된 경우: 버튼 절대 안 보임 -->
              <span v-if="member.finalDecision === 'ASSIGNED'" class="badge green">투입</span>
              <span v-else-if="member.finalDecision === 'EXCLUDED'" class="badge red">제외</span>

              <!-- 2) 결정 가능 상태: 버튼 -->
              <template
                  v-else-if="myRole === 'PM' && member.requestStatus === 'INTERVIEW_REQUESTED'"
              >
                <div class="button-group">
                  <button
                      class="btn btn-green"
                      :disabled="finalDecisionLoadingId === member.assignmentId"
                      @click="onFinalDecision(member, 'ASSIGNED')"
                  >
                    투입
                  </button>
                  <button
                      class="btn btn-red"
                      :disabled="finalDecisionLoadingId === member.assignmentId"
                      @click="onFinalDecision(member, 'EXCLUDED')"
                  >
                    제외
                  </button>
                </div>
              </template>

              <template v-else>-</template>
            </td>
          </tr>
          </tbody>

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

    <!-- 인재 추천 로딩 모달 -->
    <LoadingModal
        v-if="showRecommendModal"
        title="인재 추천 중"
        message="프로젝트에 적합한 인재를 분석하고 있습니다."
        icon-src="/loading.gif"
        :closable="false"
    />

    <AddMemberModal
        v-if="showAddMemberModal"
        :project-id="projectId"
        @close="showAddMemberModal = false"
        @success="handleAddMemberSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import LoadingModal from '@/components/common/LoadingModal.vue';
import AddMemberModal from '@/components/common/AddMemberModal.vue'
import { fetchProjectDetail } from '@/api/project';
import {
  fetchProjectMembers,
  respondAssignment,
  decideFinalAssignment,
  addAdditionalCandidates
} from '@/api/projectAssign';
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const myRole = computed(() => authStore.role)
const myUserId = computed(() => authStore.userId)

const router = useRouter();
const route = useRoute();
const projectId = route.params.projectId as string;

// 상태 관리
const projectStatus = ref('');
const showRecommendModal = ref(false);
const memberList = ref<any[]>([]);
const showAddMemberModal = ref(false)

const waitingCount = computed(() =>
    memberList.value.filter(m => m.requestStatus === 'REQUESTED').length
)

const acceptedCount = computed(() =>
    memberList.value.filter(m => m.requestStatus === 'ACCEPTED').length
)

const interviewCount = computed(() =>
    memberList.value.filter(m => m.requestStatus === 'INTERVIEW_REQUESTED').length
)

const finalDecisionLoadingId = ref<number | null>(null)

const onRequestInterview = async (member: any) => {
  await respondAssignment(
      projectId,
      member.assignmentId,
      'INTERVIEW_REQUESTED'
  )
  await fetchMembers()
}

const onAcceptAssignment = async (member: any) => {
  await respondAssignment(
      projectId,
      member.assignmentId,
      'ACCEPTED'
  )
  await fetchMembers()
}

const onFinalDecision = async (member: any, decision: 'ASSIGNED' | 'EXCLUDED') => {
  member.finalDecision = decision

  finalDecisionLoadingId.value = member.assignmentId

  try {
    await decideFinalAssignment(projectId, member.assignmentId, decision)

    await fetchMembers()
  } catch (e) {
    // 실패하면 원복
    member.finalDecision = null
    console.error(e)
  } finally {
    finalDecisionLoadingId.value = null
  }
}

// 프로젝트 인원 조회
const fetchMembers = async () => {
  const res = await fetchProjectMembers(projectId);

  memberList.value = res.data.members.map((m: any) => {

    return {
      assignmentId: m.assignmentId,
      userId: m.userId,
      name: m.userName,
      role: m.jobName,
      skill: m.mainSkill,
      fit: m.skillScore,
      price: m.monthlyWage,
      workStatus: m.finalDecision === 'ASSIGNED'
          ? 'ASSIGNED'
          : 'AVAILABLE',
      selected: m.selected,
      requestStatus: m.assignmentStatus ?? m.requestStatus,
      finalDecision: m.finalDecision ?? null,
    };
  });
};

// 인재 추천 처리
const handleRecommend = () => {
  showRecommendModal.value = true

  setTimeout(() => {
    showRecommendModal.value = false
    router.push(`/projects/${projectId}/assign`)
  }, 1500)
}

// 인원 추가 모달
const onAddMember = () => {
  showAddMemberModal.value = true;
};

// 목록 새로고침 핸들러
const handleAddMemberSuccess = async () => {
  await fetchMembers();            // 데이터 다시 불러오기
  showAddMemberModal.value = false; // 모달 닫기
}

// 초기 로딩
onMounted(async () => {
  const res = await fetchProjectDetail(projectId)
  projectStatus.value = res.data?.status

  await fetchMembers()
})
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

.badge.green {
  background: #eaf7dd;
  color: #52c41a;
}
.badge.red   {
  background: #ffe9ea;
  color: #ff4d4f;
}
.badge.blue  {
  background: #e8efff;
  color: #0041ce;
}

/* 공통 버튼 그룹 (간격 담당) */
.button-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 공통 버튼 베이스 */
.btn {
  padding: 4px 12px;
  border-radius: 14px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;

  background: transparent;
  border: none;
  outline: none;
  box-shadow: none;

  transition: background 0.15s ease, color 0.15s ease;
}

.btn-green {
  background: #eaf7dd;
  color: #52c41a;
}

.btn-red {
  background: #ffe9ea;
  color: #ff4d4f;
}

.btn-blue {
  background: #e8efff;
  color: #0041ce;
}

.btn-green:hover {
  background: #dff3c7;
}

.btn-red:hover {
  background: #ffd6d8;
}

.btn-blue:hover {
  background: #d7e3ff;
}

/* 접근성용 포커스 */
.btn:focus-visible {
  outline: 2px solid rgba(0, 188, 212, 0.4);
  outline-offset: 2px;
}

</style>