<template>
  <div class="admin-page-container">
    <header class="page-header">
      <h1 class="page-title">문서 관리</h1>
    </header>

    <div class="control-panel">
      <div class="tab-group">
        <button class="tab-item active">전체보기</button>
      </div>

      <div class="action-group">
        <div class="search-bar">
          <input
              type="text"
              placeholder="문서명 검색"
              v-model="searchText"
              @keyup.enter="handleSearch"
          />
          <svg @click="handleSearch" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="cursor:pointer">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <button class="add-btn" @click="triggerUpload">
          <span class="plus-icon">+</span> PDF 업로드
        </button>
        <input
            ref="fileInput"
            type="file"
            accept="application/pdf"
            class="file-input"
            @change="handleUpload"
        />
      </div>
    </div>

    <div class="table-wrapper">
      <table class="admin-table">
        <thead>
        <tr>
          <th width="40"><input type="checkbox" /></th>
          <th>문서명 <span class="sort-icon">↓</span></th>
          <th>업로드 날짜</th>
          <th>요약</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="filteredDocs.length === 0"><td colspan="4" style="text-align:center; padding: 40px;">데이터가 없습니다.</td></tr>

        <tr v-for="doc in pagedDocs" :key="doc.id">
          <td><input type="checkbox" /></td>
          <td class="doc-name">{{ doc.name }}</td>
          <td class="date-text">{{ doc.uploadedAt }}</td>
          <td class="summary-text">{{ doc.summary }}</td>
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
  </div>

  <LoadingModal
      v-if="loading"
      title="PDF 업로드 중"
      message="문서를 처리하고 있습니다. 잠시만 기다려 주세요."
      icon-src="/loading.gif"
  />
</template>

<script setup>
import { computed, ref } from 'vue';
import { uploadAdminDocument } from '@/api/document';
import LoadingModal from '@/components/common/LoadingModal.vue';

const searchText = ref('');
const loading = ref(false);
const currentPage = ref(0);
const pageSize = 10;
const fileInput = ref(null);

const documents = ref([
  {
    id: 1,
    name: 'software_development_process_guide.pdf',
    uploadedAt: '2026-02-07',
    summary: '프로젝트 관리 및 개발 프로세스 개요 문서.'
  },
  {
    id: 2,
    name: 'ISO31000_sample.pdf',
    uploadedAt: '2026-02-08',
    summary: '리스크 관리 기본 정의 및 프로세스 요약.'
  }
]);

const filteredDocs = computed(() => {
  const keyword = searchText.value.trim().toLowerCase();
  if (!keyword) return documents.value;
  return documents.value.filter((item) => item.name.toLowerCase().includes(keyword));
});

const totalPages = computed(() => Math.ceil(filteredDocs.value.length / pageSize));
const pagedDocs = computed(() => {
  const start = currentPage.value * pageSize;
  return filteredDocs.value.slice(start, start + pageSize);
});

const handleSearch = () => {
  currentPage.value = 0;
};

const goToPage = (page) => {
  currentPage.value = page;
};

const triggerUpload = () => {
  if (fileInput.value) {
    fileInput.value.value = '';
    fileInput.value.click();
  }
};

const handleUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    alert('PDF 파일만 업로드할 수 있습니다.');
    return;
  }
  loading.value = true;
  try {
    await uploadAdminDocument(file);
    alert('업로드가 완료되었습니다. 처리에는 시간이 걸릴 수 있습니다.');
  } catch (err) {
    console.error('PDF 업로드 실패', err);
    alert('업로드에 실패했습니다. 잠시 후 다시 시도해주세요.');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.admin-page-container {
  padding: 24px 30px;
  background-color: #f9fafb;
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  color: #111827;
}

.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  gap: 10px;
}

.tab-group {
  display: flex;
  gap: 8px;
}

.tab-item {
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background-color: #fff;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
}

.tab-item.active {
  background-color: #eef2ff;
  color: #1d4ed8;
  border-color: #c7d2fe;
  font-weight: 600;
}

.action-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  gap: 6px;
}

.search-bar input {
  border: none;
  outline: none;
  font-size: 13px;
  color: #374151;
  width: 200px;
}

.add-btn {
  background-color: #111827;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.plus-icon {
  font-size: 16px;
  font-weight: bold;
}

.file-input {
  display: none;
}

.table-wrapper {
  background-color: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.admin-table th,
.admin-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}

.admin-table th {
  color: #6b7280;
  font-weight: 600;
}

.doc-name {
  font-weight: 600;
  color: #111827;
}

.date-text {
  color: #6b7280;
}

.summary-text {
  color: #374151;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.p-nav {
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #fff;
  font-size: 12px;
  cursor: pointer;
}

.p-numbers {
  display: flex;
  gap: 6px;
}

.p-num {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background-color: #fff;
  font-size: 12px;
  cursor: pointer;
}

.p-num.active {
  background-color: #111827;
  color: #fff;
  border-color: #111827;
}
</style>
