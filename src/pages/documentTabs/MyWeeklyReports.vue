<template>
  <div class="list-wrapper">
    <div class="table-container">
      <table class="doc-table">
        <thead>
        <tr>
          <th class="text-left">프로젝트 이름 <span class="sort-icon">↓</span></th>
          <th>주차</th>
          <th>주간보고 ID</th>
          <th>생성 날짜</th>
          <th>최신 수정 날짜</th>
          <th>상태</th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in weeklyData" :key="item.id" @click="goToDetail(item.id)" class="clickable-row">
          <td class="text-left project-cell">{{ item.projectName }}</td>
          <td>{{ item.week }}</td>
          <td>{{ item.id }}</td>
          <td>{{ item.createdAt }}</td>
          <td>{{ item.updatedAt }}</td>
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
      <button class="page-num">2</button>
      <button class="page-num">3</button>
      <span class="dots">...</span>
      <button class="page-num">11</button>
      <button class="page-arrow">Next 〉</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 샘플 데이터
const weeklyData = ref([
  { id: 506543, projectName: '로그 기반 이상 트래픽 자동 감지', week: '2025 DEC W3', createdAt: '2025. 12. 24', updatedAt: '2025. 12. 31', status: 'DRAFT' },
  { id: 506542, projectName: '로그 기반 이상 트래픽 자동 감지·알림 시스...', week: '2025 DEC W2', createdAt: '2025. 12. 24', updatedAt: '2025. 12. 31', status: 'DRAFT' },
  { id: 506541, projectName: '로그 기반 이상 트래픽 자동 감지·알림 시스...', week: '2025 DEC W1', createdAt: '2025. 12. 24', updatedAt: '2025. 12. 31', status: 'REVIEWED' },
]);

const goToDetail = (id: number) => {
  router.push(`/document/weekly/${id}`);
};
</script>

<style scoped>
.table-container { background: #fff; border: 1px solid #e1e4e8; border-radius: 4px; overflow: hidden; }
.doc-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.doc-table th { background: #f2f4f8; padding: 12px; color: #333; font-weight: 600; border-bottom: 1px solid #e1e4e8; }
.doc-table td { padding: 14px 12px; text-align: center; border-bottom: 1px solid #f1f5f9; color: #334155; }
.text-left { text-align: left !important; padding-left: 20px; }
.project-cell { font-weight: 500; }

.clickable-row:hover { background-color: #f8fafc; cursor: pointer; }

/* 상태 배지 */
.status-badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; }
.status-badge.draft { background-color: #fee2e2; color: #ef4444; }
.status-badge.reviewed { background-color: #e0e7ff; color: #4338ca; }

.more-btn { background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 16px; }

/* 페이지네이션 스타일 */
.pagination { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 30px; }
.page-arrow { background: none; border: none; color: #9ca3af; font-size: 13px; cursor: pointer; }
.page-num { width: 32px; height: 32px; border: none; background: none; color: #64748b; border-radius: 4px; cursor: pointer; }
.page-num.active { background-color: #e2e8f0; font-weight: 700; }
</style>