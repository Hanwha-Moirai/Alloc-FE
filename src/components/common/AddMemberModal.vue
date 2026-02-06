<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <div class="header-title">
          <h3>인재 선택</h3>
          <span class="subtitle">프로젝트에 적합한 후보자를 추가하세요.</span>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="state-container">
          <div class="loader"></div>
          <p>적합한 인재를 찾고 있습니다...</p>
        </div>

        <div v-else-if="candidates.length === 0" class="state-container">
          <div class="empty-icon">📂</div>
          <p>추천 가능한 후보자가 없습니다.</p>
        </div>

        <div v-else class="table-scroll">
          <table class="candidate-table">
            <thead>
            <tr>
              <th class="text-center">선택</th>
              <th>이름</th>
              <th>직군</th>
              <th>주력 기술</th>
              <th>적합도</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="m in candidates"
                :key="m.userId"
                :class="{ 'is-selected': isSelected(m) }"
                @click="toggleSelection(m)">

              <td class="text-center">
                <div class="custom-checkbox"
                     :class="{ checked: isSelected(m) }">

                  <div v-if="isSelected(m)" class="check-mark">L</div>

                </div>
              </td>
              <td>
                <div class="user-info">
                  <img src="/user.png" class="user-icon" />
                  <span class="user-name">{{ m.userName }}</span>
                </div>
              </td>
              <td><span class="badge-job">{{ m.jobName }}</span></td>
              <td><span class="skill-text">{{ m.mainSkill || '-' }}</span></td>
              <td class="text-right">
                  <span class="score-tag" :class="getScoreClass(m.skillScore)">
                    {{ m.skillScore ?? 0 }}%
                  </span>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="modal-footer">
        <div class="selection-count">
          선택됨 <strong>{{ totalSelectedCount()}}</strong>명
        </div>
        <div class="footer-btns">
          <button class="btn-secondary" @click="$emit('close')">취소</button>
          <button
              class="btn-primary"
              :disabled="totalSelectedCount() === 0 || submitting"
              @click="handleSave"
          >
            <span v-if="submitting" class="mini-loader"></span>
            {{ submitting ? '처리 중...' : '프로젝트에 추가' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  fetchProjectAssignCandidates,
  submitAssignment,
  addAdditionalCandidates
} from '@/api/projectAssign'

const props = defineProps<{
  projectId: string | number
}>()

const emit = defineEmits(['close', 'success'])

const candidates = ref([])
const selectedByJob = ref({})
const loading = ref(false)
const submitting = ref(false)

const isAdditionalMode = ref(false)   // ⭐ 추가선발 모드

// ==========================
// 후보 조회
// ==========================
const loadCandidates = async () => {
  loading.value = true
  try {
    const res = await fetchProjectAssignCandidates(props.projectId)

    console.log("FULL RESPONSE", res)
    console.log("DATA", res.data)

    candidates.value = res.data?.candidates
        ? [...res.data.candidates]
        : []

    // ⭐ 추가선발 모드 받기 (백엔드에서 내려줘야함)
    isAdditionalMode.value = res.data?.additionalMode === true

    console.log("ADDITIONAL MODE", isAdditionalMode.value)
    console.log("FINAL CANDIDATES", candidates.value)

  } catch (e) {
    console.error(e)
    candidates.value = []
  } finally {
    loading.value = false
  }
}

// ==========================
// 선택 여부
// ==========================
const isSelected = (candidate) => {
  const list = selectedByJob.value[candidate.jobId] || []
  return list.includes(candidate.userId)
}
const getScoreClass = (score: number) => {
  if (score >= 80) return 'high';
  if (score >= 50) return 'mid';
  return 'low';
}
// ==========================
// 선택 토글
// ==========================
const toggleSelection = (candidate) => {

  const jobId = candidate.jobId
  const userId = candidate.userId

  if (!selectedByJob.value[jobId]) {
    selectedByJob.value[jobId] = []
  }

  const list = selectedByJob.value[jobId]
  const idx = list.indexOf(userId)

  if (idx > -1) list.splice(idx, 1)
  else list.push(userId)
}

// ==========================
// 총 선택 수
// ==========================
const totalSelectedCount = () => {
  return Object.values(selectedByJob.value)
      .reduce((sum, arr) => sum + arr.length, 0)
}

// ==========================
// 저장
// ==========================
const handleSave = async () => {

  submitting.value = true

  try {

    const payload = {
      assignments: Object.entries(selectedByJob.value)
          .filter(([_, userIds]) => userIds && userIds.length > 0)
          .map(([jobId, userIds]) => ({
            jobId: Number(jobId),
            candidates: userIds.map(id => ({ userId: id }))
          })
      )
    }

    console.log("SAVE PAYLOAD", payload)

    if (isAdditionalMode.value) {
      console.log(">>> ADDITIONAL SAVE")
      await addAdditionalCandidates(props.projectId, payload)
    } else {
      console.log(">>> INITIAL SAVE")
      await submitAssignment(props.projectId, payload)
    }

    alert("저장 완료")
    emit("success")
    emit("close")

  } catch (e) {
    console.error("SAVE ERROR", e)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    await addAdditionalCandidates(props.projectId)   // 먼저 생성
  } catch(e) {
    console.log("additional already exists or no shortage")
  }

  await loadCandidates()
})

</script>


<style scoped>
/* 폰트 및 변수 */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(15, 23, 42, 0.6); /* 더 깊이감 있는 배경 */
  backdrop-filter: blur(4px); /* 배경 블러 효과 */
  display: flex; justify-content: center; align-items: center;
  z-index: 2000;
}

.modal-container {
  background: #ffffff;
  width: 720px; max-height: 85vh;
  border-radius:5px; display: flex; flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

/* 헤더 스타일 */
.modal-header {
  padding: 24px 28px; border-bottom: 1px solid #f1f5f9;
  display: flex; justify-content: space-between; align-items: flex-start;
}
.header-title h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #1e293b; }
.subtitle { font-size: 0.875rem; color: #64748b; margin-top: 4px; display: block; }
.close-btn {
  background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px;
  transition: color 0.2s;
}
.close-btn:hover { color: #1e293b; }

/* 바디 및 테이블 */
.modal-body { padding: 0; overflow: hidden; display: flex; flex-direction: column; }
.table-scroll { overflow-y: auto; padding: 0 28px 20px; }

.candidate-table { width: 100%; border-collapse: separate; border-spacing: 0; }
.candidate-table th {
  position: sticky; top: 0; background: #fff; z-index: 10;
  padding: 12px 12px; font-size: 0.75rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8;
  border-bottom: 1px solid #f1f5f9;
}

.candidate-table td { padding: 10px; vertical-align: middle; text-align: center; transition: all 0.2s; font-size: 13px; }
.candidate-table tr { cursor: pointer; }
.candidate-table tr:hover td { background: #f8fafc; }
.candidate-table tr.is-selected td { background: #f0f7ff; }

/* 사용자 아바타 커스텀 */
.user-info { display: flex; align-items: center; gap: 12px; }
.user-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
  vertical-align: middle;
}
.user-name {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

/* 배지 및 태그 */
.badge-job {
  background: #f1f5f9; color: #475569; padding: 3px 8px; border-radius: 6px;
  font-size: 13px; font-weight: 500;
}
.score-tag {
  font-weight: 700; font-size: 0.875rem;
}
.score-tag.high { color: #10b981; }
.score-tag.mid { color: #f59e0b; }
.score-tag.low { color: #ef4444; }

/* 커스텀 체크박스 */
.custom-checkbox {
  width: 20px; height: 20px; border: 2px solid #cbd5e1; border-radius: 6px;
  display: inline-flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.custom-checkbox.checked { background: #00bcd4; border-color: #00bcd4; }
.check-mark {
  color: white; font-size: 12px; transform: scaleX(-1) rotate(-35deg);
  margin-bottom: 2px; font-weight: bold;
}

/* 푸터 */
.modal-footer {
  padding: 20px 28px; background: #f8fafc;
  display: flex; justify-content: space-between; align-items: center;
}
.selection-count { font-size: 0.875rem; color: #64748b; }
.selection-count strong { color: #00bcd4; }

.footer-btns { display: flex; gap: 12px; }
.btn-primary {
  background: #00bcd4; color: white; border: none; padding: 10px 24px;
  border-radius: 4px; font-weight: 600; font-size: 0.875rem; cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3); transition: all 0.2s;
}
.btn-primary:hover:not(:disabled) {
  background: #00acc1;
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(0, 188, 212, 0.4);
}
.btn-primary:active:not(:disabled) {
  background: #0097a7;
  transform: translateY(0);
}

.btn-secondary {
  background: white; color: #475569; border: 1px solid #e2e8f0;
  padding: 10px 24px; border-radius: 4px; font-weight: 600; font-size: 0.875rem;
  transition: all 0.2s; cursor: pointer;
}
.btn-secondary:hover { background: #f1f5f9; }

/* 유틸리티 */
.text-center { text-align: center; }
.text-right { text-align: right; }
.state-container { padding: 60px 0; text-align: center; color: #94a3b8; }
</style>
