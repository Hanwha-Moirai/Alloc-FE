<template>
  <div class="project-page">
    <!-- 대제목 -->
    <h1 class="page-title">프로젝트 관리</h1>

    <div class="tab-header">
      <div class="tabs">
        <button class="tab active">
          프로젝트 목록
        </button>
      </div>

      <button class="create-btn" @click="$router.push('/projects/new')">
        + 프로젝트 등록
      </button>
    </div>

    <!-- 테이블 카드 -->
    <div class="card">
      <table class="project-table">
        <thead>
        <tr>
          <th>프로젝트 이름</th>
          <th>프로젝트 기간</th>
          <th>상태</th>
          <th>진행률</th>
          <th>문서 상태</th>
          <th>리스크</th>
        </tr>
        </thead>

        <tbody>
        <tr
            v-for="project in projects"
            :key="project.id"
            @click="goDetail(project.id)"
        >
        <td class="name">
            {{ project.name }}
          </td>
          <td>{{ project.period }}</td>

          <td>
              <span
                  class="badge status"
                  :class="project.status.toLowerCase()"
              >
                {{ project.status }}
              </span>
          </td>

          <td>{{ project.progress }}%</td>

          <td>
              <span
                  class="badge doc"
                  :class="project.docStatus.toLowerCase()"
              >
                {{ project.docStatus }}
              </span>
          </td>

          <td>
              <span
                  class="badge risk"
                  :class="project.risk.toLowerCase()"
              >
                {{ project.risk }}
              </span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- 페이징 -->
    <div class="pagination">
      <button disabled>Previous</button>
      <button class="active">1</button>
      <button>2</button>
      <button>3</button>
      <span>...</span>
      <button>11</button>
      <button>Next</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

/* ================= 더미 데이터 ================= */

const projects = [
  {
    id: 1,
    name: '로그 기반 이상 트래픽 자동 감지 시스템',
    period: '2025.01 - 2026.12',
    status: 'DRAFT',
    progress: 0,
    docStatus: 'DRAFT',
    risk: 'HIGH',
  },
  {
    id: 2,
    name: '로그 기반 이상 트래픽 자동 감지 시스템',
    period: '2025.01 - 2026.12',
    status: 'ACTIVE',
    progress: 45,
    docStatus: 'SENT',
    risk: 'MEDIUM',
  },
  {
    id: 3,
    name: '로그 기반 이상 트래픽 자동 감지 시스템',
    period: '2025.01 - 2026.12',
    status: 'CLOSED',
    progress: 100,
    docStatus: 'DRAFT',
    risk: 'MEDIUM',
  },
  {
    id: 4,
    name: '로그 기반 이상 트래픽 자동 감지 시스템',
    period: '2025.01 - 2026.12',
    status: 'HOLD',
    progress: 0,
    docStatus: 'DRAFT',
    risk: 'NORMAL',
  },
]

const goDetail = (id: number) => {
  router.push(`/projects/${id}`)
}

</script>

<style scoped>
.project-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ================= 헤더 ================= */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.create-btn {
  height: 36px;
  padding: 0 14px;
  background: #4ab8d8;
  color: #fff;
  border: none;
  font-size: 13px;
  cursor: pointer;
}

/* ================= 탭 ================= */
.tabs {
  display: flex;
}

.tab {
  padding: 10px 4px;
  font-size: 14px;
  font-weight: 600;
  color: #001D6C;
  background: none;
  border: none;
  border-bottom: 2px solid #001D6C;
  cursor: pointer;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 12px;
}

/* ================= 카드 ================= */
.card {
  background: #fff;
  border-radius: 8px;
  padding: 0;
}

/* ================= 테이블 ================= */
.project-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.project-table thead {
  background: #f2f4f8;
}

.project-table th,
.project-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #eee;
  text-align: center;
  vertical-align: middle;
}

.project-table th {
  padding: 12px;
  font-weight: 600;
  color: #333;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
}

.project-table td.name {
  font-weight: 600;
}

.project-table tbody tr {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.project-table tbody tr:hover {
  background-color: #f8fafc;
}

/* ================= 배지 ================= */
.badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
}

/* 상태 */
.status.draft {
  background: #f3f4f6;
  color: #6b7280;
}

.status.active {
  background: #eafaf1;
  color: #22c55e;
}

.status.closed {
  background: #eef4ff;
  color: #2563eb;
}

.status.hold {
  background: #fff7ed;
  color: #f97316;
}

/* 문서 */
.doc.draft {
  background: #f0f0f0;
  color: #888;
}

.doc.sent {
  background: #e7f0ff;
  color: #3498db;
}

/* 리스크 */
.risk.high {
  background: #ffecec;
  color: #e74c3c;
}

.risk.medium {
  background: #fff3d6;
  color: #f39c12;
}

.risk.normal {
  background: #eafaf1;
  color: #2ecc71;
}

/* ================= 페이징 ================= */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}

.pagination button {
  padding: 4px 8px;
  font-size: 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #555;
}

.pagination button.active {
  background: #e7f0ff;
  color: #3498db;
  border-radius: 4px;
}
</style>
