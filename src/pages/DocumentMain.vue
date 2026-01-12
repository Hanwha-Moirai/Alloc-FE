<template>
  <div class="doc-page">
    <h1 class="page-title">내 문서</h1>

    <div class="tab-header">
      <div class="tabs">
        <button
            :class="['tab-btn', { active: currentTab === 'weekly' }]"
            @click="currentTab = 'weekly'"
        >
          내 주간보고 목록
        </button>
        <button
            :class="['tab-btn', { active: currentTab === 'meeting' }]"
            @click="currentTab = 'meeting'"
        >
          내 회의록 목록
        </button>
      </div>

      <div class="header-actions">
        <div class="filter-group">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
                type="text"
                v-model="searchQuery"
                placeholder="검색하기"
                class="search-input"
            />
          </div>
          <div class="date-range">
            <input type="date" v-model="startDate" class="date-picker" />
            <span class="range-arrow">→</span>
            <input type="date" v-model="endDate" class="date-picker" />
          </div>
        </div>

        <button class="create-btn" @click="handleCreate">
          + {{ currentTab === 'weekly' ? '주간보고' : '회의록' }} 생성
        </button>
      </div>
    </div>

    <div class="content-area">
      <MyWeeklyReports
          v-if="currentTab === 'weekly'"
          :search-query="searchQuery"
          :start-date="startDate"
          :end-date="endDate"
      />
      <MyMeetingReports
          v-else
          :search-query="searchQuery"
          :start-date="startDate"
          :end-date="endDate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MyWeeklyReports from '@/pages/documentTabs/MyWeeklyReports.vue';
import MyMeetingReports from '@/pages/documentTabs/MyMeetingReports.vue';

const currentTab = ref('weekly');

// 검색 및 날짜 상태 관리
const searchQuery = ref('');
const startDate = ref('');
const endDate = ref('');

const handleCreate = () => {
  console.log(`${currentTab.value} 생성 페이지로 이동`);
};
</script>

<style scoped>
.doc-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #333;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0;
}

.tabs {
  display: flex;
}

.tab-btn {
  padding: 10px 4px;
  margin-right: 20px;
  font-size: 14px;
  font-weight: 600;
  color: #9ca3af;
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
}

.tab-btn.active {
  color: #001D6C;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #001D6C;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 검색창 스타일 */
.search-box {
  position: relative;
}

.search-input {
  width: 200px;
  padding: 6px 10px 6px 30px;
  border: 1px solid #e1e4e8;
  font-size: 13px;
  outline: none;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #9ca3af;
}

/* 날짜 선택 스타일 */
.date-range {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  border: 1px solid #e1e4e8;
  padding: 4px 8px;
}

.date-picker {
  border: none;
  font-size: 12px;
  color: #666;
  outline: none;
  cursor: pointer;
}

.range-arrow {
  color: #ccc;
  font-size: 12px;
}

.create-btn {
  background: linear-gradient(to right, #4ab8d8, #d84ab8);
  color: white;
  border: none;
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

.create-btn:hover {
  opacity: 0.9;
}

.content-area {
  margin-top: 4px;
}
</style>