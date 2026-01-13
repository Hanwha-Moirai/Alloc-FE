<template>
  <div class="list-wrapper">
    <div class="table-container">
      <table class="doc-table">
        <thead>
        <tr>
          <th class="text-left">프로젝트 이름</th>
          <th>회의록 ID</th>
          <th>회의 날짜</th>
          <th>생성 날짜</th>
          <th>최신 수정 날짜</th>
        </tr>
        </thead>

        <tbody>
        <tr
            v-for="item in meetingData"
            :key="item.id"
            @click="goToDetail(item.id)"
            class="clickable-row"
        >
          <td class="text-left project-cell">{{ item.projectName }}</td>
          <td>{{ item.id }}</td>
          <td>{{ item.meetingDate }}</td>
          <td>{{ item.createdAt }}</td>
          <td>{{ item.updatedAt }}</td>
        </tr>

        <tr v-if="meetingData.length === 0">
          <td colspan="5">회의록이 없습니다.</td>
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
  try {
    const res = await getMyMeetingRecords({ page: page.value, size: 10 });
    const data = res.data.data;

    meetingData.value = data.content.map((item: any) => ({
      id: item.meetingId,
      projectName: item.projectName,
      meetingDate: formatDate(item.meetingDate),
      createdAt: formatDate(item.createdAt), // 생성 날짜 추가
      updatedAt: formatDate(item.updatedAt), // 수정 날짜 추가
      projectId: item.projectId
    }));

    totalPages.value = data.totalPages;
  } catch (error) {
    console.error("데이터 로드 실패:", error);
  }
};

onMounted(fetchMeetingRecords);

// 상세 이동
const goToDetail = (meetingId: number) => {
  const record = meetingData.value.find(m => m.id === meetingId);
  if (!record) return;

  router.push(`/projects/${record.projectId}/docs/meeting-record/${meetingId}`);
};

// 페이지 이동 및 날짜 포맷 로직 (기존 유지)
const prevPage = () => { if (page.value > 0) { page.value--; fetchMeetingRecords(); } };
const nextPage = () => { if (page.value < totalPages.value - 1) { page.value++; fetchMeetingRecords(); } };

const formatDate = (value: string) => {
  if (!value) return '-';
  const d = new Date(value);
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}`;
};
</script>

<style scoped>
/* 기존 스타일 유지 */
.table-container { background: #fff; border: 1px solid #e1e4e8; border-radius: 4px; overflow: hidden; }
.doc-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.doc-table th { background: #f2f4f8; padding: 12px; color: #333; font-weight: 600; border-bottom: 1px solid #e1e4e8; }
.doc-table td { padding: 14px 12px; text-align: center; border-bottom: 1px solid #f1f5f9; color: #334155; }
.text-left { text-align: left !important; padding-left: 20px; }
.project-cell { font-weight: 500; }
.clickable-row:hover { background-color: #f8fafc; cursor: pointer; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 30px; }
.page-arrow { background: none; border: none; color: #9ca3af; font-size: 13px; cursor: pointer; }
.page-num { width: 32px; height: 32px; border: none; background: none; color: #64748b; border-radius: 4px; cursor: pointer; }
.page-num.active { background-color: #e2e8f0; font-weight: 700; }
</style>