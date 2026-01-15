<template>
  <div class="profile-page">
    <h1 class="page-title">프로필 조회</h1>

    <div class="profile-container">
      <aside class="card basic-info">
        <h3 class="card-title">기본 정보</h3>
        <div class="avatar-container">
          <div class="avatar">
            <img src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png" alt="profile" />
          </div>
        </div>

        <div class="info-list">
          <div class="info-item" v-for="item in infoItems" :key="item.label">
            <span class="label">{{ item.label }}</span>
            <span class="value">
      <template v-if="isEditing && editableLabels.includes(item.label)">
        <input
            v-if="item.label === '생년월일'"
            v-model="item.value"
            type="date"
            class="edit-input date-input"
        />

        <select
            v-else-if="item.label === '직군'"
            v-model="item.value"
            class="edit-input select-input"
        >
          <option v-for="job in jobOptions" :key="job" :value="job">
            {{ job }}
          </option>
        </select>

        <input
            v-else
            v-model="item.value"
            type="text"
            class="edit-input"
        />
      </template>

      <template v-else-if="item.label === '프로젝트 투입현황'">
        <span class="status-badge">● 투입중</span>
      </template>
      <template v-else>
        {{ item.value }}
      </template>
    </span>
          </div>
        </div>

        <button v-if="isMyProfile && !isEditing" class="edit-btn" @click="isEditing = true">
          수정
        </button>
        <button v-else-if="isMyProfile && isEditing" class="save-btn" @click="isEditing = false">
          저장
        </button>
      </aside>

      <div class="main-content">
        <section class="card skill-section">
          <div class="card-header">
            <h3 class="card-title">기술 스택</h3>
            <div class="skill-actions">
              <button
                  class="btn-outline"
                  :class="{ 'editing-mode': isSkillEditing }"
                  @click="toggleSkillEdit"
              >
                {{ isSkillEditing ? '저장' : '수정' }}
              </button>
              <button class="btn-filled" @click="showSkillModal = true">추가</button>
            </div>
          </div>

          <div class="skill-layout">
            <div class="skill-chart">
              <canvas ref="skillChartRef"></canvas>
            </div>
            <ul class="skill-level-list">
              <li v-for="(skill, index) in skills" :key="skill.name" class="skill-row">
                <div class="skill-name-group">
                  <span class="dot">●</span>
                  <span class="skill-name">{{ skill.name }}</span>
                </div>

                <div class="level-action-group">
                  <span class="skill-level" :class="`lv-${skill.level}`">L{{ skill.level }}</span>
                  <button
                      v-if="isSkillEditing"
                      class="delete-skill-btn"
                      @click="removeSkill(index)"
                  >
                    ✕
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section class="card project-history">
          <h3 class="card-title">프로젝트 히스토리</h3>
          <div class="project-grid">
            <div v-for="(project, index) in projects" :key="index" class="project-card">
              <div class="project-header">
                <h4>{{ project.name }}</h4>
              </div>
              <p class="role">{{ project.role }}</p>
              <p class="period">{{ project.period }}</p>
              <div class="tags">
                <span v-for="tech in project.techs" :key="tech" class="tag">
                  <span class="tag-dot">●</span> {{ tech }}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <SkillRegisterModal
        v-if="showSkillModal"
        :is-open="showSkillModal"
        @close="showSkillModal = false"
        @save="handleSkillSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js'
import SkillRegisterModal from '@/components/common/SkillRegisterModal.vue'
import {
  fetchMyProfile,
  fetchMyTechStacks,
  fetchMyProjectHistory,
  updateMyTechStacks,
  deleteMyTechStack,
  createMyTechStack
} from '@/api/profile'

//Chart.js 설정
Chart.register(
    RadarController,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip
)

// 상태
const isMyProfile = true

// 기본 정보
const isEditing = ref(false)
const editableLabels = ['생년월일', '이메일', '연락처', '직군']

const infoItems = ref<{ label: string; value: string }[]>([])

// 기술 스택
const isSkillEditing = ref(false)
const skills = ref<{
  employeeTechId: number
  techId: number
  name: string
  level: number
}[]>([])
const showSkillModal = ref(false)

// 프로젝트 히스토리
const projects = ref<any[]>([])

// 차트
const skillChartRef = ref<HTMLCanvasElement | null>(null)
let skillChart: Chart | null = null

const initChart = () => {
  if (!skillChartRef.value) return

  skillChart = new Chart(skillChartRef.value, {
    type: 'radar',
    data: {
      labels: skills.value.map(s => s.name),
      datasets: [{
        data: skills.value.map(s => s.level),
        backgroundColor: 'rgba(200, 205, 212, 0.5)',
        borderColor: '#94a3b8',
        borderWidth: 1,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 0,
          max: 3,
          ticks: { display: false },
          grid: { color: '#e2e8f0' }
        }
      },
      plugins: { legend: { display: false } }
    }
  })
}

const updateChart = () => {
  if (!skillChart) return
  skillChart.data.labels = skills.value.map(s => s.name)
  skillChart.data.datasets[0].data = skills.value.map(s => s.level)
  skillChart.update()
}

// API 로드 함수
const loadBasicProfile = async () => {
  const res = await fetchMyProfile()
  const d = res.data.data

  infoItems.value = [
    { label: '이름', value: d.userName },
    { label: '생년월일', value: d.birthday },
    { label: '이메일', value: d.email },
    { label: '연락처', value: d.phone },
    { label: '직군', value: d.jobName },
    { label: '부서', value: d.deptName },
    { label: '근무형태', value: d.employeeType },
    { label: '입사일', value: d.hiringDate },
    { label: '프로젝트 투입현황', value: d.projectStatus }
  ]
}

const loadTechStacks = async () => {
  const res = await fetchMyTechStacks()

  skills.value = res.data.data.map((t: any) => ({
    employeeTechId: t.employeeTechId,
    techId: t.techId,
    name: t.techName,
    level: Number(t.proficiency.replace('LV', ''))
  }))

  updateChart()
}

const deletedTechIds = ref<number[]>([])

const loadProjectHistory = async () => {
  const res = await fetchMyProjectHistory()

  projects.value = res.data.data.map((p: any) => ({
    name: p.projectName,
    role: p.myJobName,
    period: `${p.startDate} ~ ${p.endDate}`,
    techs: (p.contributedTechs ?? []).map((c: any) => c.techName)
  }))
}

// 액션
const toggleSkillEdit = async () => {
  if (isSkillEditing.value) {
    // 1️⃣ 삭제 처리
    for (const employeeTechId of deletedTechIds.value) {
      await deleteMyTechStack(employeeTechId)
    }

    // 2️⃣ 신규 추가 처리
    const newSkills = skills.value.filter(
        s => !s.employeeTechId
    )

    for (const s of newSkills) {
      await createMyTechStack({
        techId: s.techId,
        proficiency: `LV${s.level}`
      })
    }

    // 초기화
    deletedTechIds.value = []

    // 재조회
    await loadTechStacks()
  }

  isSkillEditing.value = !isSkillEditing.value
}

const removeSkill = (index: number) => {
  const removed = skills.value[index]

  if (removed.employeeTechId) {
    deletedTechIds.value.push(removed.employeeTechId)
  }

  skills.value.splice(index, 1)
  updateChart()
}

const handleSkillSave = (updatedSkills: any[]) => {
  skills.value.push(
      ...updatedSkills.map(s => ({
        employeeTechId: null,
        techId: s.techId,
        name: s.name,
        level: s.level
      }))
  )

  updateChart()
  showSkillModal.value = false
}

onMounted(async () => {
  await loadBasicProfile()
  await loadTechStacks()
  await loadProjectHistory()
  initChart()
})
</script>

<style scoped>
.page-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 20px 0;
}

/* 레이아웃 */
.profile-container {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  align-items: start;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 공통 카드 스타일 */
.card {
  background: white;
  padding: 24px;
  border: 1px solid #f0f0f0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 20px;
  padding-bottom: 10px;
}

.card-title {
  font-size: 15px;
  color: #333;
  margin: 0;
  padding: 0;
}

/* 기본 정보 섹션 */
.basic-info .card-title {
  text-align: center;
  width: 100%;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.avatar-container {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.avatar {
  width: 100px;
  height: 100px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar img {
  width: 40px;
  opacity: 0.3;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.info-item .label {
  color: #666;
}

.info-item .value {
  font-weight: 500;
  text-align: right;
}

.status-badge {
  background: #f0fdf4;
  color: #22c55e;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.edit-btn, .save-btn {
  width: 100%;
  color: white;
  border: none;
  padding: 10px;
  margin-top: 20px;
  cursor: pointer;
}

.edit-btn { background: #4ab8d8; }
.save-btn { background: #22c55e; }

.edit-input {
  width: 100%;
  max-width: 160px;
  padding: 4px 8px;
  border: none;
  border-bottom: 2px solid #e2e8f0;
  background-color: #f8fafc;
  font-size: 14px;
  font-weight: 500;
  text-align: right;
  color: #334155;
  transition: all 0.2s ease;
  outline: none;
}

.date-input {
  cursor: pointer;
  text-align: center;
}

.date-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: invert(0.5);
}

/* 기술 스택 레이아웃 */
.skill-layout {
  display: flex;
  align-items: center;
  gap: 50px;
}

.skill-chart {
  width: 220px;
  height: 220px;
}

.skill-level-list {
  flex: 1;
  list-style: none;
  padding: 0;
  margin: 0;
}

.skill-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.skill-name-group {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.skill-name-group .dot {
  color: #94a3b8;
  font-size: 10px;
}

/* 기술 레벨 배지 */
.skill-level {
  text-align: center;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.lv-1 {
  background-color: #f1f5f9;
  color: #94a3b8;
}

.lv-2 {
  background-color: #cbd5e1;
  color: #475569;
}

.lv-3 {
  background-color: #475569;
  color: #ffffff;
}

/* 상단 액션 버튼 */
.skill-actions {
  display: flex;
  gap: 8px;
}

.btn-outline {
  border: 1px solid #4ab8d8;
  color: #4ab8d8;
  background: white;
  padding: 4px 16px;
  cursor: pointer;
  font-size: 13px;
}

.btn-filled {
  background: #4ab8d8;
  color: white;
  border: none;
  padding: 4px 16px;
  cursor: pointer;
  font-size: 13px;
}

.level-action-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  min-width: fit-content;
}

/* 기술 레벨 배지 */
.skill-level {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 20px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
}

/* X 삭제 버튼 */
.delete-skill-btn {
  flex-shrink: 0;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  width: 16px;
  height: 16px;
}

/* 프로젝트 히스토리 */
.project-history .card-title {
  margin-bottom: 20px;
}

.project-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.project-card {
  border: 1px solid #4ab8d8;
  padding: 16px;
}

.project-card h4 {
  margin: 0 0 8px 0;
  font-size: 15px;
}

.role {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
}

.period {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 12px;
}

.tags {
  display: flex;
  gap: 10px;
}

.tag {
  font-size: 13px;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 4px;
}

.tag-dot {
  color: #94a3b8;
  font-size: 8px;
}
</style>