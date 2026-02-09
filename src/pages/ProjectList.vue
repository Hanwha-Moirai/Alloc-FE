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
            :key="project.projectId"
            @click="goDetail(project.projectId)"
        >
          <td class="name">
            {{ project.projectName }}
          </td>
          <td>{{ project.startDate }} ~ {{ project.endDate }}</td>

          <td>
            <span
                class="badge status"
                :class="project.status.toLowerCase()"
            >
              {{ project.status }}
            </span>
          </td>

          <td>
            <div class="progress-wrapper">
              <div class="progress-bar-bg">
                <div class="progress-bar-fill"
                     :style="{ width: project.progressRate + '%' }"
                     :class="getRiskByRate(project.progressRate).class">
                </div>
              </div>
              <span>{{ project.progressRate }}%</span>
            </div>
          </td>

          <td>
            <span
                class="badge doc"
                :class="project.documentStatus?.toLowerCase()"
            >
              {{ project.documentStatus ?? '-' }}
            </span>
          </td>

          <td>
            <span class="badge risk" :class="getRiskByRate(project.progressRate).class">
              {{ getRiskByRate(project.progressRate).label }}
            </span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- 페이징 -->
    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="page === 0" @click="setPage(page - 1)">Previous</button>
      <template v-for="item in pageItems" :key="item.key">
        <span v-if="item.type === 'ellipsis'">...</span>
        <button
            v-else
            :class="{ active: item.page === page }"
            @click="setPage(item.page)"
        >
          {{ item.page + 1 }}
        </button>
      </template>
      <button :disabled="page >= totalPages - 1" @click="setPage(page + 1)">Next</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchProjectList, fetchProjectAchievementRate } from '@/api/project'

const router = useRouter()

type ProjectItem = {
  projectId: number
  projectName: string
  startDate: string
  endDate: string
  status: string

  progressRate: number | null
  documentStatus: string | null
  riskLevel: string | null
}

const projects = ref<ProjectItem[]>([])
const loading = ref(false)
const page = ref(0)
const size = ref(10)
const totalPages = ref(1)
const totalElements = ref(0)

const pageItems = computed(() => {
  const total = totalPages.value
  const current = page.value
  const items = []

  if (total <= 7) {
    for (let i = 0; i < total; i += 1) {
      items.push({ type: 'page', page: i, key: `p-${i}` })
    }
    return items
  }

  items.push({ type: 'page', page: 0, key: 'p-0' })

  const start = Math.max(1, current - 1)
  const end = Math.min(total - 2, current + 1)

  if (start > 1) {
    items.push({ type: 'ellipsis', key: `e-start-${start}` })
  }

  for (let i = start; i <= end; i += 1) {
    items.push({ type: 'page', page: i, key: `p-${i}` })
  }

  if (end < total - 2) {
    items.push({ type: 'ellipsis', key: `e-end-${end}` })
  }

  items.push({ type: 'page', page: total - 1, key: `p-${total - 1}` })
  return items
})

const loadProjects = async () => {
  loading.value = true;
  try {
    const res = await fetchProjectList({ page: page.value, size: size.value });
    const payload = res.data.data ?? res.data;
    const projectList = Array.isArray(payload) ? payload : (payload.content ?? []);
    const meta = Array.isArray(payload) ? null : payload;

    if (meta) {
      totalPages.value = meta.totalPages ?? 1;
      totalElements.value = meta.totalElements ?? projectList.length;
    }

    // 각 프로젝트의 상세 진행률을 가져오기
    const projectsWithRate = await Promise.all(
        projectList.map(async (project: any) => {
          try {
            const rateRes = await fetchProjectAchievementRate(project.projectId)
            const rawRate = rateRes.data?.data

            return {
              ...project,
              progressRate: Number.isFinite(rawRate) ? Math.round(rawRate) : 0
            }
          } catch (err) {
            return { ...project, progressRate: 0 }
          }
        })
    )

    projects.value = projectsWithRate;
  } catch (e) {
    console.error('❌ 프로젝트 목록 조회 실패', e);
  } finally {
    loading.value = false;
  }
};

// 진행률(달성률)에 따른 리스크 레벨 자동 계산 함수
const getRiskByRate = (rate: number) => {
  if (rate < 30) return { label: 'HIGH', class: 'high' };
  if (rate < 70) return { label: 'MEDIUM', class: 'medium' };
  return { label: 'NORMAL', class: 'normal' };
};

const goDetail = (projectId: number) => {
  router.push(`/projects/${projectId}`)
}

const setPage = (nextPage: number) => {
  if (nextPage < 0 || nextPage >= totalPages.value) return
  if (nextPage === page.value) return
  page.value = nextPage
}

onMounted(() => {
  loadProjects()
})

watch(page, () => {
  loadProjects()
})
</script>

<style scoped>
.project-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.card {
  background: #fff;
  border-radius: 8px;
  padding: 0;
}

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
