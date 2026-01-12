<template>
  <div class="admin-page-container">
    <header class="page-header">
      <h1 class="page-title">감사/보고</h1>
    </header>

    <div class="control-panel">
      <div class="tab-group">
        <button class="tab-item active">최근 활동 로그</button>
      </div>

      <div class="action-group">
        <div class="search-bar">
          <input type="text" placeholder="액션/사용자/관리자 검색" v-model="searchText" />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        <div class="date-input-container">
          <span class="date-display-text">{{ selectedDate || '날짜 검색' }}</span>
          <svg class="calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <input
              type="date"
              v-model="selectedDate"
              class="hidden-date-input"
          />
        </div>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="admin-table">
        <thead>
        <tr>
          <th width="40"><input type="checkbox" /></th>
          <th width="180">시간 <span class="sort-icon">↓</span></th>
          <th>활동</th>
          <th>대상</th>
          <th>관리자</th>
          <th width="50"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(log, index) in auditLogs" :key="index">
          <td><input type="checkbox" /></td>
          <td class="date-text">{{ log.timestamp }}</td>
          <td>{{ log.activity }}</td>
          <td>{{ log.target }}</td>
          <td>{{ log.admin }}</td>
          <td class="more-cell">
            <button class="more-btn" @click.stop="openContextMenu($event, index)">•••</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button class="p-nav">〈 Previous</button>
      <div class="p-numbers">
        <button v-for="n in [1, 2, 3, 4, 5]" :key="n" :class="['p-num', { active: n === 2 }]">{{ n }}</button>
        <span class="p-dots">...</span>
        <button class="p-num">11</button>
      </div>
      <button class="p-nav">Next 〉</button>
    </div>

    <div v-if="activeMenuIndex !== null" class="context-menu" :style="menuPos">
      <ul>
        <li @click="handleEdit(activeMenuIndex)"><span>✏️</span> 정보 수정</li>
        <li @click="handleDelete(activeMenuIndex)" class="delete"><span>🗑️</span> 로그 삭제</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 검색 및 날짜 상태
const searchText = ref('');
const selectedDate = ref('');

// 컨텍스트 메뉴 상태
const activeMenuIndex = ref<number | null>(null);
const menuPos = ref({ top: '0px', left: '0px' });

// 가상 데이터
const auditLogs = ref(Array(10).fill(null).map((_, i) => ({
  id: i,
  timestamp: '2024.05.22 14:30:45',
  activity: '이메일 수정',
  target: 'USER01',
  admin: 'ADMIN01'
})));

// 컨텍스트 메뉴 제어 함수
const openContextMenu = (event: MouseEvent, index: number) => {
  activeMenuIndex.value = index;
  menuPos.value = {
    top: `${event.clientY + 10}px`,
    left: `${event.clientX - 120}px`
  };
  setTimeout(() => window.addEventListener('click', closeHandler), 0);
};

const closeHandler = () => {
  activeMenuIndex.value = null;
  window.removeEventListener('click', closeHandler);
};

// 수정 및 삭제 핸들러
const handleEdit = (index: number) => {
  console.log(`${index}번 로그 수정 요청`);
  activeMenuIndex.value = null;
};

const handleDelete = (index: number) => {
  if (confirm('이 로그 기록을 삭제하시겠습니까?')) {
    auditLogs.value.splice(index, 1);
  }
  activeMenuIndex.value = null;
};
</script>

<style scoped>
/* 공통 레이아웃 */
.admin-page-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

/* 컨트롤 패널 */
.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid #e2e8f0;
}

.tab-item {
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
}

.tab-item.active {
  color: #001D6C;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #001D6C;
}

.action-group {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

/* 검색바 */
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-bar input {
  padding: 8px 12px 8px 36px;
  border: 1px solid #e2e8f0;
  background-color: white;
  font-size: 13px;
  width: 240px;
}

.search-bar svg {
  position: absolute;
  left: 10px;
}

/* 날짜 입력 커스텀 버튼 */
.date-input-container {
  position: relative;
  background-color: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
  padding: 0 12px;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 140px;
  height: 36px;
  cursor: pointer;
  box-sizing: border-box;
}

.date-input-container:hover {
  background-color: #f8fafc;
}

.hidden-date-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.hidden-date-input::-webkit-calendar-picker-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

/* 테이블 공통 스타일 */
.table-wrapper {
  background: white;
  border: 1px solid #e2e8f0;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.admin-table th {
  background-color: #f8fafc;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
}

.admin-table td {
  padding: 14px 16px;
  font-size: 13px;
  color: #1e293b;
  border-bottom: 1px solid #f1f5f9;
}

.date-text { color: #64748b; font-size: 13px; }

.more-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 16px;
}

/* 컨텍스트 메뉴 */
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  width: 130px;
  padding: 4px 0;
}

.context-menu ul { list-style: none; margin: 0; padding: 0; }
.context-menu li {
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
.context-menu li:hover { background-color: #f3f4f6; }
.context-menu li.delete { color: #ef4444; }

/* 페이지네이션 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}

.p-nav {
  background: none; border: none;
  color: #2563eb; font-size: 13px; font-weight: 600; cursor: pointer;
}

.p-numbers { display: flex; gap: 4px; }

.p-num {
  width: 32px; height: 32px; border: none; background: none;
  font-size: 13px; color: #64748b; cursor: pointer; border-radius: 4px;
}

.p-num.active {
  background-color: #bfdbfe; color: #2563eb; font-weight: 700;
}
</style>