<template>
  <div class="document-container">
    <div class="toggle-wrapper">
      <button
          class="toggle-btn"
          :class="{ active: currentTab === 'weekly' }"
          @click="currentTab = 'weekly'"
      >
        주간보고 목록
      </button>
      <button
          class="toggle-btn"
          :class="{ active: currentTab === 'meeting' }"
          @click="currentTab = 'meeting'"
      >
        회의록 목록
      </button>
    </div>

    <div class="table-card">
      <table class="doc-table">
        <thead>
        <tr v-if="currentTab === 'weekly'">
          <th style="width: 15%">주차</th>
          <th style="width: 15%">주간보고 ID</th>
          <th style="width: 25%">생성 날짜</th>
          <th style="width: 25%">최신 수정 날짜</th>
          <th style="width: 20%">상태</th>
        </tr>

        <tr v-else>
          <th style="width: 15%">회의록 ID</th>
          <th style="width: 25%">회의 날짜</th>
          <th style="width: 30%">생성 날짜</th>
          <th style="width: 30%">최신 수정 날짜</th>
        </tr>
        </thead>

        <tbody>
        <template v-if="currentTab === 'weekly'">
          <tr
              v-for="report in weeklyReports"
              :key="report.reportId"
              class="clickable-row"
              @click="goWeeklyDetail(report.reportId)"
          >
            <td>{{ report.week }}</td>
            <td>{{ report.reportId }}</td>
            <td>{{ formatDate(report.createdAt) }}</td>
            <td>{{ formatDate(report.updatedAt) }}</td>
            <td>
              <div class="center-box">
                <span :class="['status-tag', report.status ? report.status.toLowerCase() : 'draft']">
                  {{ report.status || 'DRAFT' }}
                </span>
              </div>
            </td>
          </tr>
          <tr v-if="weeklyReports.length === 0">
            <td colspan="5">주간보고가 없습니다.</td>
          </tr>
        </template>

        <template v-else>
          <tr
              v-for="record in meetingRecords"
              :key="record.meetingId"
              class="clickable-row"
              @click="goMeetingDetail(record.meetingId)"
          >
            <td>{{ record.meetingId }}</td>
            <td>{{ formatDate(record.meetingDate) }}</td>
            <td>{{ formatDate(record.createdAt) }}</td>
            <td>{{ formatDate(record.updatedAt) }}</td>
          </tr>
          <tr v-if="meetingRecords.length === 0">
            <td colspan="4">회의록이 없습니다.</td>
          </tr>
        </template>
        </tbody>
      </table>

      <div class="pagination" v-if="totalPages > 1">
        <span class="p-nav" @click="handlePrevPage">〈 Previous</span>
        <button
            v-for="p in totalPages"
            :key="p"
            class="p-num"
            :class="{ active: page === p - 1 }"
            @click="goToPage(p - 1)"
        >
          {{ p }}
        </button>
        <span class="p-nav" @click="handleNextPage">Next 〉</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getMeetingRecords } from '@/api/meetingRecord';
import { getWeeklyReports } from '@/api/weeklyReport'; // 주간보고 API 임포트

const router = useRouter();
const route = useRoute();
const projectId = Number(route.params.projectId);

const currentTab = ref<'weekly' | 'meeting'>('weekly');

// 공통 상태
const page = ref(0);
const totalPages = ref(0);

// 데이터 상태
const meetingRecords = ref<any[]>([]);
const weeklyReports = ref<any[]>([]); // 주간보고 상태 추가

const formatDate = (value: string) => {
  if (!value) return '-';
  const d = new Date(value);
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}`;
};

// 주간보고 조회 함수
const fetchWeeklyReports = async () => {
  try {
    const res = await getWeeklyReports(projectId, page.value);
    const data = res.data.data;

    weeklyReports.value = data.content.map((report: any) => ({
      ...report,
      // 만약 status가 undefined거나 null이면 'DRAFT'를 기본값으로 사용
      week: report.weekLabel || (report.weekNo ? `${report.year} W${report.weekNo}` : '주차 정보 없음'),
      status: report.status || 'DRAFT'
    }));

    totalPages.value = data.totalPages;
  } catch (err) {
    console.error('주간보고 로드 실패', err);
  }
};

// 회의록 조회 함수
const fetchMeetingRecords = async () => {
  try {
    const res = await getMeetingRecords(projectId, page.value);
    meetingRecords.value = res.data.data.content;
    totalPages.value = res.data.data.totalPages;
  } catch (err) {
    console.error('회의록 로드 실패', err);
  }
};

// 현재 탭에 따른 데이터 로드
const loadData = () => {
  if (currentTab.value === 'weekly') {
    fetchWeeklyReports();
  } else {
    fetchMeetingRecords();
  }
};

// 탭 전환 시 페이지 초기화 및 데이터 로드
watch(currentTab, () => {
  page.value = 0;
  loadData();
});

onMounted(loadData);

// 페이지네이션 제어
const goToPage = (p: number) => {
  page.value = p;
  loadData();
};
const handlePrevPage = () => { if (page.value > 0) goToPage(page.value - 1); };
const handleNextPage = () => { if (page.value < totalPages.value - 1) goToPage(page.value + 1); };

// 상세 페이지 이동
const goWeeklyDetail = (reportId: number) => {
  router.push(`/projects/${projectId}/docs/weekly-report/${reportId}`);
};
const goMeetingDetail = (meetingId: number) => {
  router.push(`/projects/${projectId}/docs/meeting-record/${meetingId}`);
};
</script>

<style scoped>
.toggle-wrapper {
  display: flex;
  margin-bottom: 20px;
  border: 1px solid #4ab8d8;
  overflow: hidden;
  width: fit-content;
}

.toggle-btn {
  padding: 10px 28px;
  border: none;
  background: white;
  color: #4ab8d8;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn.active {
  background-color: #4ab8d8; /* 활성화 색상 */
  color: white;
}

/* 테이블 카드 스타일 */
.table-card {
  background: white;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.doc-table {
  width: 100%;
  border-collapse: collapse;
}

.doc-table th {
  background-color: #f1f3f6;
  padding: 14px;
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
  border-bottom: 1px solid #e5e7eb;
  text-align: center;
}

.doc-table td {
  padding: 14px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f3f4f6;
  text-align: center; /* 전체 텍스트 가운데 정렬 */
  vertical-align: middle;
}

/* 상태 태그 및 정렬 컨테이너 */
.center-box {
  display: flex;
  justify-content: center;
}

.status-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  min-width: 55px;
}

/* DRAFT 상태 (이미지 참조) */
.status-tag.draft {
  background-color: #fde8e8;
  color: #c81e1e;
}

/* 완료 상태 (회의록용 예시) */
.status-tag.completed {
  background-color: #e1f5fe;
  color: #0288d1;
}

/* 더보기 버튼 */
.actions {
  color: #9ca3af;
  cursor: pointer;
  font-weight: bold;
}

/* 페이지네이션 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  gap: 4px;
}

.p-nav {
  font-size: 14px;
  color: #6b7280;
  margin: 0 10px;
  cursor: pointer;
}

.p-num {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  font-size: 14px;
  color: #4b5563;
  cursor: pointer;
}

.p-num.active {
  background-color: #e5e7eb;
  border-radius: 2px;
  font-weight: 700;
}

.p-dots { color: #9ca3af; margin: 0 4px; }

/* 회의록 행 클릭 가능 표시 */
.clickable-row {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.clickable-row:hover {
  background-color: #f9fafb;
}

</style>