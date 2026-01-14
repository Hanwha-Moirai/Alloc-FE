<template>
  <div class="admin-page-container">
    <header class="page-header">
      <h1 class="page-title">사용자 관리</h1>
    </header>

    <div class="control-panel">
      <div class="tab-group">
        <button class="tab-item active">전체보기</button>
        <button class="tab-item">권한별 보기</button>
        <button class="tab-item">계정 상태별 보기</button>
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
          <span class="plus-icon">+</span> 사용자 추가
        </button>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="admin-table">
        <thead>
        <tr>
          <th width="40"><input type="checkbox" /></th>
          <th>이름 <span class="sort-icon">↓</span></th>
          <th>이메일</th>
          <th>소속 / 팀</th>
          <th>직급</th>
          <th>직군</th>
          <th>권한</th>
          <th>계정 상태</th>
          <th width="50"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(user, index) in users" :key="index">
          <td><input type="checkbox" /></td>
          <td class="user-info-cell">
            <div class="user-avatar"></div>
            <span class="user-name">{{ user.name }}</span>
          </td>
          <td class="email-text">{{ user.email }}</td>
          <td class="dept-text">{{ user.team }}</td>
          <td>
            <span class="position-badge">{{ user.position }}</span>
          </td>
          <td class="job-text">{{ user.jobGroup }}</td>
          <td>
            <span :class="['role-badge', user.role.toLowerCase()]">{{ user.role }}</span>
          </td>

          <td>
          <span :class="['status-tag', user.status.toLowerCase()]">
            <i class="dot"></i> {{ user.status }}
          </span>
          </td>
          <td class="more-cell">
            <button class="more-btn" @click.stop="openContextMenu($event, user, index)">•••</button>
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
        <li @click="handleDelete(activeMenuIndex)" class="delete"><span>🗑️</span> 계정 삭제</li>
      </ul>
    </div>
  </div>

  <UserModal
      :show="isModalOpen"
      :isEdit="isEditMode"
      :initialData="selectedUser"
      @close="isModalOpen = false"
      @confirm="onConfirm"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import UserModal from '@/components/common/UserModal.vue';

const searchText = ref('');
const isModalOpen = ref(false);
const isEditMode = ref(false);
const selectedUser = ref(null);
const activeMenuIndex = ref<number | null>(null);
const menuPos = ref({ top: '0px', left: '0px' });

// 이미지 데이터 기반 가상 데이터
const users = ref([
  { id: 1, name: '홍길동', jobGroup: '백엔드 개발자', position: '대리', email: 'test@alloc.com', role: 'PM', team: '플랫폼팀', status: 'ACTIVE' },
  { id: 2, name: '김철수', jobGroup: '프론트엔드 개발자', position: '사원', email: 'chul@alloc.com', role: 'USER', team: '디자인팀', status: 'SUSPENDED' },
  { id: 3, name: '이영희', jobGroup: 'UI/UX 디자이너', position: '과장', email: 'young@alloc.com', role: 'ADMIN', team: '기획팀', status: 'ACTIVE' },
]);

// 등록 모달 열기
const openAddModal = () => {
  isEditMode.value = false;
  selectedUser.value = null;
  isModalOpen.value = true;
};

// 수정 모달 열기
const handleEdit = (index: number) => {
  const target = users.value[index];
  isEditMode.value = true;
  selectedUser.value = { ...target };
  isModalOpen.value = true;
  activeMenuIndex.value = null;
};

// 삭제 처리
const handleDelete = (index: number) => {
  if (confirm('정말 계정을 삭제하시겠습니까?')) {
    users.value.splice(index, 1);
  }
  activeMenuIndex.value = null;
};

// 모달에서 등록/수정 완료 버튼 눌렀을 때
const onConfirm = (userData: any) => {
  if (isEditMode.value) {
    const idx = users.value.findIndex(u => u.id === selectedUser.value.id);
    if (idx !== -1) {
      users.value[idx] = { ...users.value[idx], ...userData };
    }
  } else {
    users.value.unshift({
      id: Date.now(),
      ...userData,
      team: userData.department,
      status: 'ACTIVE'
    });
  }
  isModalOpen.value = false;
};

const openContextMenu = (event: MouseEvent, user: any, index: number) => {
  activeMenuIndex.value = index;
  menuPos.value = { top: `${event.clientY + 10}px`, left: `${event.clientX - 120}px` };
  setTimeout(() => window.addEventListener('click', closeHandler), 0);
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

.user-info-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background-color: #f1f5f9;
  border-radius: 50%;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cbd5e1"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>');
}

.user-detail {
  display: flex;
  flex-direction: column;
}

.user-name { font-weight: 600; color: #1e293b; font-size: 13px; }

/* 권한 배지 스타일 */
.role-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 800;
  color: white;
}
.role-badge.pm { background-color: #00d4fe; }
.role-badge.user { background-color: #ffcc00; }
.role-badge.admin { background-color: #ff3b30; }

/* 직군 텍스트 */
.job-text {
  color: #1e293b;
  font-weight: 500;
  font-size: 12px;
}

/* 상태 태그 스타일 */
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  background-color: #f8fafc;
}
.status-tag.active { color: #22c55e; }
.status-tag.active .dot { background-color: #22c55e; }
.status-tag.suspended { color: #94a3b8; text-decoration: line-through; }
.status-tag.suspended .dot { background-color: #ff3b30; }
.status-tag.deleted { color: #94a3b8; opacity: 0.6; }
.status-tag.deleted .dot { background-color: #94a3b8; }

.dot { width: 6px; height: 6px; border-radius: 50%; }

.email-text, .dept-text { color: #64748b; font-size: 12px; }
</style>