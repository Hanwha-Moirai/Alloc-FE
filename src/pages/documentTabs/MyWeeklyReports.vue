<template>
  <div class="list-wrapper">
    <div class="table-container">
      <table class="doc-table">
        <thead>
        <tr>
          <th>프로젝트 이름</th>
          <th>주차</th>
          <th>주간보고 ID</th>
          <th>생성 날짜</th>
          <th>최신 수정 날짜</th>
          <th>상태</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="item in weeklyData"
            :key="item.id"
            @click="goToDetail(item.id, item.projectId)"
            class="clickable-row"
        >
          <td>{{ item.projectName }}</td>
          <td>{{ item.week }}</td>
          <td>{{ item.id }}</td>
          <td>{{ item.createdAt }}</td>
          <td>{{ item.updatedAt }}</td>
          <td>
            <span :class="['status-badge', item.status.toLowerCase()]">{{ item.status }}</span>
          </td>
        </tr>

        <tr v-if="weeklyData.length === 0">
          <td colspan="6">주간보고가 없습니다.</td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button class="page-arrow" @click="prevPage" :disabled="page === 0">〈 Previous</button>
      <button class="page-num active">{{ page + 1 }}</button>
      <button class="page-arrow" @click="nextPage" :disabled="page >= totalPages - 1">Next 〉</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
// API 임포트
import { getMyWeeklyReports, searchMyWeeklyReports } from '@/api/weeklyReport';

const props = defineProps<{
  searchQuery: string;
  startDate: string;
  endDate: string;
}>();

const router = useRouter();
const weeklyData = ref<any[]>([]);
const page = ref(0);
const totalPages = ref(0);

// 데이터 조회 함수
const fetchWeeklyReports = async () => {
  try {
    let res;
    const hasCondition = props.searchQuery || props.startDate || props.endDate;

    if (hasCondition) {
      // 검색 API 호출 (/api/mydocs/report/search)
      res = await searchMyWeeklyReports({
        page: page.value,
        keyword: props.searchQuery,
        from: props.startDate,
        to: props.endDate
      });
    } else {
      // 일반 목록 조회 호출 (/api/mydocs/report)
      res = await getMyWeeklyReports(page.value);
    }

    const data = res.data.data;

    console.log("--- Request 상세 정보 ---");
    console.log("요청 URL:", res.config.url);
    console.log("요청 메서드:", res.config.method);
    console.log("보낸 파라미터(params):", res.config.params);

    // 기존 응답 로그
    console.log("백엔드 응답 데이터:", res.data);

    // 백엔드 WeeklyReportSummaryResponse 필드 매핑
    weeklyData.value = data.content.map((item: any) => ({
      id: item.reportId,
      projectId: item.projectId,
      projectName: item.projectName,
      week: `${item.year ?? ''} W${item.weekNo ?? item.week ?? ''}`,
      createdAt: formatDate(item.createdAt),
      updatedAt: formatDate(item.updatedAt),
      status: item.status || 'DRAFT'
    }));

    totalPages.value = data.totalPages;
  } catch (error) {
    console.error("주간보고 조회 실패:", error);
  }
};

// 검색 조건 변경 시 즉시 재조회
watch(
    () => [props.searchQuery, props.startDate, props.endDate],
    () => {
      page.value = 0;
      fetchWeeklyReports();
    }
);

onMounted(fetchWeeklyReports);

const goToDetail = (id: number, projectId: number) => {
  router.push(`/projects/${projectId}/docs/weekly-report/${id}`);
};

const prevPage = () => { if (page.value > 0) { page.value--; fetchWeeklyReports(); } };
const nextPage = () => { if (page.value < totalPages.value - 1) { page.value++; fetchWeeklyReports(); } };

const formatDate = (value: string) => {
  if (!value) return '-';
  const d = new Date(value);
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}`;
};
</script>

<style scoped>
.table-container { background: #fff; border: 1px solid #e1e4e8; overflow: hidden; }
.doc-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.doc-table th { background: #f2f4f8; padding: 12px; color: #333; font-weight: 600; border-bottom: 1px solid #e1e4e8; }
.doc-table td { padding: 14px 12px; text-align: center; border-bottom: 1px solid #f1f5f9; color: #334155; }
.text-left { text-align: left !important; padding-left: 20px; }
.project-cell { font-weight: 500; }
.clickable-row:hover { background-color: #f8fafc; cursor: pointer; }
.status-badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; }
.status-badge.draft { background-color: #fee2e2; color: #ef4444; }
.status-badge.reviewed { background-color: #e0e7ff; color: #4338ca; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 30px; }
.page-arrow { background: none; border: none; color: #9ca3af; font-size: 13px; cursor: pointer; }
.page-arrow:disabled { opacity: 0.5; cursor: not-allowed; }
.page-num { width: 32px; height: 32px; border: none; background: none; color: #64748b; border-radius: 4px; cursor: pointer; }
.page-num.active { background-color: #e2e8f0; font-weight: 700; }
</style>