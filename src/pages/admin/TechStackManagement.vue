<template>
  <div class="admin-page-container">
    <header class="page-header">
      <h1 class="page-title">기술스택 관리</h1>
    </header>

    <div class="control-panel">
      <div class="tab-group">
        <button class="tab-item active">전체보기</button>
      </div>

      <div class="action-group">
        <div class="search-bar">
          <input
              type="text"
              placeholder="검색하기"
              v-model="searchText"
              @keyup.enter="handleSearch"
          />
          <svg @click="handleSearch" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="cursor:pointer">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <button class="add-btn" @click="openAddModal">
          <span class="plus-icon">+</span> 기술 스택 추가
        </button>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="admin-table">
        <thead>
        <tr>
          <th width="40"><input type="checkbox" /></th>
          <th>기술스택명 <span class="sort-icon">↓</span></th>
          <th>생성 일시</th>
          <th>수정 일시</th>
          <th width="50"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="loading"><td colspan="5" style="text-align:center; padding: 40px;">로딩 중...</td></tr>
        <tr v-else-if="techStacks.length === 0"><td colspan="5" style="text-align:center; padding: 40px;">데이터가 없습니다.</td></tr>

        <tr v-for="(item, index) in techStacks" :key="item.stackId">
          <td><input type="checkbox" /></td>
          <td class="tech-name">{{ item.techName }}</td>
          <td class="date-text">{{ item.createdAt }}</td>
          <td class="date-text">{{ item.updatedAt || '-' }}</td>
          <td class="more-cell">
            <button class="more-btn" @click.stop="openContextMenu($event, item, index)">•••</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination" v-if="totalPages > 0">
      <button
          class="p-nav"
          :disabled="currentPage === 0"
          @click="goToPage(currentPage - 1)"
          :style="{ opacity: currentPage === 0 ? 0.5 : 1 }"
      >
        〈 Previous
      </button>

      <div class="p-numbers">
        <button
            v-for="p in totalPages"
            :key="p"
            class="p-num"
            :class="{ active: currentPage === p - 1 }"
            @click="goToPage(p - 1)"
        >
          {{ p }}
        </button>
      </div>

      <button
          class="p-nav"
          :disabled="currentPage >= totalPages - 1"
          @click="goToPage(currentPage + 1)"
          :style="{ opacity: currentPage >= totalPages - 1 ? 0.5 : 1 }"
      >
        Next 〉
      </button>
    </div>

    <div v-if="activeMenuIndex !== null" class="context-menu" :style="menuPos">
      <ul>
        <li @click="handleEditAction"><span>✏️</span> 수정하기</li>
        <li @click="handleDeleteAction" class="delete"><span>🗑️</span> 삭제하기</li>
      </ul>
    </div>
  </div>

  <TechStackModal
      :show="isModalOpen"
      :isEdit="isEditMode"
      :initialName="selectedItem.techName"
      @close="isModalOpen = false"
      @confirm="onConfirm"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import TechStackModal from '@/components/common/TechStackModal.vue';
import {
  getAdminTechStacks,
  createAdminTechStack,
  updateAdminTechStack,
  deleteAdminTechStack
} from '@/api/admin';

// 상태 관리 변수
const techStacks = ref([]);
const loading = ref(false);
const searchText = ref('');
const currentPage = ref(0);
const totalPages = ref(0);
const pageSize = 10;

const isModalOpen = ref(false);
const isEditMode = ref(false);
const selectedItem = ref({ stackId: -1, techName: '' });

const activeMenuIndex = ref(null);
const menuPos = ref({ top: '0px', left: '0px' });

const loadTechStacks = async () => {
  console.log(`요청 페이지 번호: ${currentPage.value}`);
  loading.value = true;
  try {
    const res = await getAdminTechStacks({
      page: currentPage.value,
      size: pageSize,
      q: searchText.value || undefined
    });

    if (res.data?.data) {
      techStacks.value = res.data.data.content || [];
      totalPages.value = res.data.data.totalPages || 0;
    } else {
      techStacks.value = [];
      totalPages.value = 0;
    }
  } catch (error) {
    console.error('데이터 로드 실패:', error);
    totalPages.value = 0;
  } finally {
    loading.value = false;
  }
};

// 초기 로드
onMounted(loadTechStacks);

// [검색] 엔터키 또는 클릭 시
const handleSearch = () => {
  currentPage.value = 0;
  loadTechStacks();
};

// 페이지 이동
const goToPage = (page) => {
  currentPage.value = page;
  loadTechStacks();
};

// 등록/수정 모달 처리
const onConfirm = async (name) => {
  try {
    if (isEditMode.value) {
      await updateAdminTechStack(selectedItem.value.techId, { techName: name });
    } else {
      await createAdminTechStack({ techName: name });
    }
    isModalOpen.value = false;
    loadTechStacks();
  } catch (error) {
    alert('저장 중 오류가 발생했습니다.');
  }
};

// 삭제 처리
const handleDeleteAction = async () => {
  // 로그에서 확인된 techId 필드를 사용해야 합니다.
  const targetId = selectedItem.value.techId;
  const targetName = selectedItem.value.techName;

  if (!targetId) {
    alert('삭제할 대상을 찾을 수 없습니다.');
    return;
  }

  if (confirm(`'${targetName}'을(를) 삭제하시겠습니까?`)) {
    try {
      // DELETE /api/admin/tech-stacks/{stack_id}
      await deleteAdminTechStack(targetId);
      alert('삭제되었습니다.');

      if (techStacks.value.length === 1 && currentPage.value > 0) {
        currentPage.value -= 1;
      }
      loadTechStacks();
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.');
    }
  }
  activeMenuIndex.value = null;
};

// 컨텍스트 메뉴 관련 함수들
const openContextMenu = (event, item, index) => {
  activeMenuIndex.value = index;

  selectedItem.value = { ...item };

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

const openAddModal = () => {
  isEditMode.value = false;
  selectedItem.value = { stackId: -1, techName: '' };
  isModalOpen.value = true;
};

const handleEditAction = () => {
  isEditMode.value = true;
  isModalOpen.value = true;
  activeMenuIndex.value = null;
};
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

/* 컨트롤 패널 스타일 */
.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0;
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

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-bar input {
  padding: 8px 12px 8px 36px;
  border: 1px solid #e2e8f0;
  font-size: 13px;
  width: 200px;
}

.search-bar svg {
  position: absolute;
  left: 10px;
}

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
}

/* 테이블 스타일 */
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

.tech-name { font-weight: 500; }
.date-text { color: #64748b; font-size: 12px; }

.more-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 16px;
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  width: 130px;
  padding: 4px 0;
  animation: fadeIn 0.1s ease-out;
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

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 페이지네이션 스타일 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}

.p-nav {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.p-numbers {
  display: flex;
  gap: 4px;
  align-items: center;
}

.p-num {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
  border-radius: 4px;
}

.p-num.active {
  background-color: #bfdbfe;
  color: #2563eb;
  font-weight: 700;
}

.p-dots { color: #94a3b8; padding: 0 4px; }
</style>