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
        <tr v-for="item in meetingData" :key="item.id" @click="goToDetail(item.id)" class="clickable-row">
          <td class="text-left project-cell">{{ item.title }}</td>
          <td>{{ item.projectName }}</td>
          <td>{{ item.id }}</td>
          <td>{{ item.meetingDate }}</td>
          <td>{{ item.author }}</td>
          <td>
            <span :class="['status-badge', item.status.toLowerCase()]">{{ item.status }}</span>
          </td>
          <td><button class="more-btn" @click.stop>•••</button></td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button class="page-arrow">〈 Previous</button>
      <button class="page-num active">1</button>
      <button class="page-arrow">Next 〉</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const meetingData = ref([
  { id: 753239, title: 'UI/UX 고도화 디자인 싱크', projectName: '실시간 채팅 + 감정 분석...', meetingDate: '2025. 12. 17', author: '홍길동', status: 'REVIEWED' },
  { id: 753238, title: '백엔드 아키텍처 설계 검토', projectName: 'API 과금/제한 지원...', meetingDate: '2025. 12. 10', author: '이몽룡', status: 'DRAFT' },
]);

const goToDetail = (id: number) => {
  router.push(`/document/meeting/${id}`);
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