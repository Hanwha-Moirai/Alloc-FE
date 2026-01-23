<template>
  <div class="admin-page-container">
    <header class="page-header">
      <h1 class="page-title">직급 관리</h1>
    </header>

    <div class="control-panel">
      <div class="tab-group">
        <button class="tab-item active">전체보기</button>
      </div>

      <div class="action-group">
        <div class="search-bar">
          <input type="text" placeholder="검색하기" v-model="searchText" />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <button class="add-btn" @click="openAddModal">
          <span class="plus-icon">+</span> 직급 추가
        </button>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="admin-table">
        <thead>
        <tr>
          <th width="40"><input type="checkbox" /></th>
          <th>직급명 <span class="sort-icon">↓</span></th>
          <th>단가(원)</th>
          <th>수정 일시</th>
          <th width="50"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in positions" :key="item.titleStandardId">
          <td><input type="checkbox" /></td>
          <td class="pos-name">{{ item.titleName }}</td>
          <td class="price-text">{{ item.monthlyCost?.toLocaleString() }}원</td>
          <td class="date-text">{{ item.updatedAt || '-' }}</td>
          <td class="more-cell">
            <button class="more-btn" @click.stop="openContextMenu($event, item, index)">•••</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination" v-if="totalPages > 0">
      <button :disabled="currentPage === 0" @click="goToPage(currentPage - 1)">〈 Previous</button>
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
      <button :disabled="currentPage >= totalPages - 1" @click="goToPage(currentPage + 1)">Next 〉</button>
    </div>

    <div v-if="activeMenuIndex !== null" class="context-menu" :style="menuPos">
      <ul>
        <li @click="handleEdit(activeMenuIndex)"><span>✏️</span> 수정하기</li>
        <li @click="handleDelete(activeMenuIndex)" class="delete"><span>🗑️</span> 삭제하기</li>
      </ul>
    </div>
  </div>

  <PositionModal
      :show="isModalOpen"
      :isEdit="isEditMode"
      :initialData="selectedItem"
      @close="isModalOpen = false"
      @confirm="onConfirm"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PositionModal from '@/components/common/RankModal.vue';
import {
  getAdminTitles,
  createAdminTitle,
  updateAdminTitle
} from '@/api/admin';

// 상태 관리
const positions = ref([]);
const loading = ref(false);
const searchText = ref('');
const currentPage = ref(0);
const totalPages = ref(0);
const pageSize = 10;

const isModalOpen = ref(false);
const isEditMode = ref(false);
const selectedItem = ref({ titleStandardId: -1, titleName: '', monthlyCost: 0 });

const activeMenuIndex = ref<number | null>(null);
const menuPos = ref({ top: '0px', left: '0px' });

// [목록 로드] 백엔드 연결 (AdminTitleStandardQueryController 호출)
const loadPositions = async () => {
  loading.value = true;
  try {
    const res = await getAdminTitles({
      page: currentPage.value,
      size: pageSize,
      q: searchText.value || undefined
    });

    if (res.data?.data) {
      // 백엔드 PageResponse 구조에 맞춰 매핑
      positions.value = res.data.data.content || [];
      totalPages.value = res.data.data.totalPages || 0;
    }
  } catch (error) {
    console.error('직급 목록 로드 실패:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(loadPositions);

// 페이징 이동
const goToPage = (page: number) => {
  currentPage.value = page;
  loadPositions();
};

// 검색
const handleSearch = () => {
  currentPage.value = 0;
  loadPositions();
};

// 저장/수정
const onConfirm = async (data: { name: string, price: number }) => {
  try {
    const payload = {
      titleName: data.name,
      monthlyCost: data.price
    };

    if (isEditMode.value) {
      await updateAdminTitle(selectedItem.value.titleStandardId, payload);
      alert('성공적으로 수정되었습니다.');
    } else {
      await createAdminTitle(payload);
      alert('성공적으로 등록되었습니다.');
    }

    isModalOpen.value = false;
    loadPositions(); // 목록 새로고침
  } catch (error) {
    console.error('저장 실패:', error);
    alert('데이터 저장 중 오류가 발생했습니다.');
  }
};

// 컨텍스트 메뉴 및 모달 열기 로직
const openContextMenu = (event: MouseEvent, item: any, index: number) => {
  activeMenuIndex.value = index;
  selectedItem.value = { ...item }; // titleStandardId 포함 객체 복사
  menuPos.value = { top: `${event.clientY + 10}px`, left: `${event.clientX - 120}px` };
  setTimeout(() => window.addEventListener('click', closeHandler), 0);
};

const openAddModal = () => {
  isEditMode.value = false;
  selectedItem.value = { titleStandardId: -1, titleName: '', monthlyCost: 0 };
  isModalOpen.value = true;
};

const handleEdit = () => {
  isEditMode.value = true;

  const item = selectedItem.value;
  selectedItem.value = {
    ...item,
    name: item.titleName,
    price: item.monthlyCost
  };

  isModalOpen.value = true;
  activeMenuIndex.value = null;
};

// 삭제 로직
const handleDelete = async () => {
  if (confirm('정말 삭제하시겠습니까?')) {
    // 백엔드에 Delete 엔드포인트가 정의되면 호출 코드 추가
    console.log('삭제 요청 ID:', selectedItem.value.titleStandardId);
  }
  activeMenuIndex.value = null;
};

const closeHandler = () => {
  activeMenuIndex.value = null;
  window.removeEventListener('click', closeHandler);
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