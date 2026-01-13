<template>
  <div class="list-wrapper">
    <div class="table-container">
      <table class="doc-table">
        <thead>
        <tr>
          <th class="text-left">회의 주제 <span class="sort-icon">↓</span></th>
          <th>관련 프로젝트</th>
          <th>회의록 ID</th>
          <th>회의 날짜</th>
          <th>작성자</th>
          <th>상태</th>
          <th></th>
        </tr>
        </thead>

        <tbody>
        <tr
            v-for="item in meetingData"
            :key="item.id"
            @click="goToDetail(item.id)"
            class="clickable-row"
        >
          <td class="text-left project-cell">{{ item.title }}</td>
          <td>{{ item.projectName }}</td>
          <td>{{ item.id }}</td>
          <td>{{ item.meetingDate }}</td>
          <td>{{ item.author }}</td>
          <td>
            <span :class="['status-badge', item.status.toLowerCase()]">
              {{ item.status }}
            </span>
          </td>
        </tr>

        <tr v-if="meetingData.length === 0">
          <td colspan="7">회의록이 없습니다.</td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button class="page-arrow" @click="prevPage">〈 Previous</button>
      <button class="page-num active">{{ page + 1 }}</button>
      <button class="page-arrow" @click="nextPage">Next 〉</button>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getMyMeetingRecords } from '@/api/meetingRecord';

const router = useRouter();

const meetingData = ref<any[]>([]);
const page = ref(0);
const totalPages = ref(0);

// 목록 조회
const fetchMeetingRecords = async () => {
  const res = await getMyMeetingRecords(page.value);
  const data = res.data.data;

  meetingData.value = data.content.map((item: any) => ({
    id: item.meetingId,
    title: item.discussionTitle ?? '회의록',
    projectId: item.projectId,
    projectName: item.projectName,
    meetingDate: formatDate(item.meetingDate),
    author: item.createdBy,
    status: item.status ?? 'DRAFT'
  }));

  totalPages.value = data.totalPages;
};

onMounted(fetchMeetingRecords);

// 상세 이동
const goToDetail = (meetingId: number) => {
  const record = meetingData.value.find(m => m.id === meetingId);
  if (!record) return;

  router.push(`/projects/${record.projectId}/docs/meeting-record/${meetingId}`);
};

// 페이지 이동
const prevPage = () => {
  if (page.value > 0) {
    page.value--;
    fetchMeetingRecords();
  }
};

const nextPage = () => {
  if (page.value < totalPages.value - 1) {
    page.value++;
    fetchMeetingRecords();
  }
};

// 날짜 포맷
const formatDate = (value: string) => {
  if (!value) return '-';
  const d = new Date(value);
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}`;
};
</script>

<style scoped>
/* MyWeeklyReports.vue와 동일한 테이블 및 페이지네이션 스타일 적용 */
.table-container { background: #fff; border: 1px solid #e1e4e8; border-radius: 4px; overflow: hidden; }
.doc-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.doc-table th { background: #f2f4f8; padding: 12px; color: #333; font-weight: 600; border-bottom: 1px solid #e1e4e8; }
.doc-table td { padding: 14px 12px; text-align: center; border-bottom: 1px solid #f1f5f9; color: #334155; }
.text-left { text-align: left !important; padding-left: 20px; }
.project-cell { font-weight: 500; }
.clickable-row:hover { background-color: #f8fafc; cursor: pointer; }
.status-badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; }
.status-badge.draft { background-color: #fee2e2; color: #ef4444; }
.status-badge.reviewed { background-color: #e0e7ff; color: #4338ca; }
.more-btn { background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 16px; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 30px; }
.page-arrow { background: none; border: none; color: #9ca3af; font-size: 13px; cursor: pointer; }
.page-num { width: 32px; height: 32px; border: none; background: none; color: #64748b; border-radius: 4px; cursor: pointer; }
.page-num.active { background-color: #e2e8f0; font-weight: 700; }
</style>