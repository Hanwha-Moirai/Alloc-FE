<template>
  <div class="admin-page-container">
    <header class="page-header">
      <h1 class="page-title">내 문서</h1>
    </header>

    <div class="control-panel">
      <div class="tab-group">
        <button
            :class="['tab-item', { active: currentTab === 'weekly' }]"
            @click="currentTab = 'weekly'"
        >
          내 주간보고 목록
        </button>
        <button
            :class="['tab-item', { active: currentTab === 'meeting' }]"
            @click="currentTab = 'meeting'"
        >
          내 회의록 목록
        </button>
      </div>

      <div class="action-group">
        <div class="search-bar">
          <input
              type="text"
              v-model="searchQuery"
              placeholder="검색하기"
          />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        <div class="date-input-container">
          <span class="date-display-text">{{ startDate || '시작 날짜' }}</span>
          <svg class="calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <input type="date" v-model="startDate" class="hidden-date-input" />
        </div>

        <div class="date-input-container">
          <span class="date-display-text">{{ endDate || '종료 날짜' }}</span>
          <svg class="calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <input type="date" v-model="endDate" class="hidden-date-input" />
        </div>

        <button class="add-btn" @click="showDocModal = true">
          <span class="plus-icon">+</span> {{ currentTab === 'weekly' ? '주간보고' : '회의록' }} 생성
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

    <DocCreateModal
        :is-open="showDocModal"
        :project-list="myProjectList"
        @close="showDocModal = false"
        @create="handleCreateDoc"
    />
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue';
import MyWeeklyReports from '@/pages/documentTabs/MyWeeklyReports.vue';
import MyMeetingReports from '@/pages/documentTabs/MyMeetingReports.vue';
import DocCreateModal from '@/components/common/DocCreateModal.vue';
import { fetchMyProjectHistory } from '@/api/profile'

const currentTab = ref('weekly');
const searchQuery = ref('');
const startDate = ref('');
const endDate = ref('');

const showDocModal = ref(false);
const myProjectList = ref<{ id: number; name: string }[]>([])

const handleCreateDoc = (data: any) => {
  console.log('생성 데이터:', data);
  showDocModal.value = false;
};

const fetchMyProjects = async () => {
  try {
    const res = await fetchMyProjectHistory()

    myProjectList.value = res.data.data.map((p: any) => ({
      id: p.projectId,
      name: p.projectName
    }))
  } catch (e) {
    console.error('내 프로젝트 목록 조회 실패', e)
  }
}

watch([startDate, endDate], () => {
  console.log('[DocumentMain DATE]', startDate.value, endDate.value);
});

onMounted(() => {
  fetchMyProjects()
})
</script>

<style scoped>
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
  gap: 8px;
  margin-bottom: 8px;
}

/* 통일된 검색바 스타일 */
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
  width: 220px;
  height: 36px;
  box-sizing: border-box;
}

.search-bar svg {
  position: absolute;
  left: 10px;
}

/* 통일된 날짜 입력 컨테이너 */
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

.hidden-date-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 10;
}

.hidden-date-input::-webkit-calendar-picker-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

/* 생성 버튼 스타일 */
.add-btn {
  background-color: #4ab8d8;
  color: white;
  border: none;
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
}

.add-btn:hover {
  opacity: 0.9;
}

.content-area {
  margin-top: 10px;
}
</style>