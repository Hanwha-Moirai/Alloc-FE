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
              <button class="btn-outline">저장</button>
              <button class="btn-filled" @click="showSkillModal = true">등록</button>
            </div>
          </div>

          <div class="skill-layout">
            <div class="skill-chart">
              <canvas ref="skillChartRef"></canvas>
            </div>
            <ul class="skill-level-list">
              <li v-for="skill in skills" :key="skill.name" class="skill-row">
                <div class="skill-name-group">
                  <span class="dot">●</span>
                  <span class="skill-name">{{ skill.name }}</span>
                </div>
                <span class="skill-level" :class="`lv-${skill.level}`">L{{ skill.level }}</span>
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

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip)

const isMyProfile = true

// 기본 정보 편집 상태 관리
const isEditing = ref(false)
const editableLabels: string[] = ['생년월일', '이메일', '연락처']

const infoItems = ref([
  { label: '이름', value: '홍길동' },
  { label: '생년월일', value: '2000-01-01' },
  { label: '이메일', value: 'example@alloc.com' },
  { label: '연락처', value: '010-1234-5678' },
  { label: '직군', value: '백엔드 개발자' },
  { label: '부서', value: 'IT부서' },
  { label: '근무형태', value: '정규직' },
  { label: '직급', value: '대리' },
  { label: '입사일', value: '2025-01-01' },
  { label: '프로젝트 투입현황', value: '투입중' },
])

// reactive하게 관리하기 위해 ref로 감싸는 것을 추천합니다.
const skills = ref([
  { name: 'Spring Boot', level: 3 },
  { name: 'JPA', level: 2 },
  { name: 'MySQL', level: 3 },
  { name: 'Docker', level: 2 },
  { name: 'Redis', level: 1 },
  { name: 'JavaScript', level: 1 },
])

const projects = [
  { name: '프로젝트 A', role: 'Backend / PL', period: '2025.01.01 - 2025.12.31', techs: ['Spring Boot', 'JPA'] },
  { name: '프로젝트 B', role: 'Backend', period: '2025.01.01 - 2025.12.31', techs: ['Kafka', 'Redis'] },
  { name: '프로젝트 A', role: 'Backend / PL', period: '2025.01.01 - 2025.12.31', techs: ['Spring Boot', 'JPA'] },
  { name: '프로젝트 B', role: 'Backend', period: '2025.01.01 - 2025.12.31', techs: ['Kafka', 'Redis'] },
]

const skillChartRef = ref<HTMLCanvasElement | null>(null)
const showSkillModal = ref(false)

let skillChart: InstanceType<typeof Chart> | null = null

onMounted(() => {
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
        r: { min: 0, max: 3, ticks: { display: false }, grid: { color: '#e2e8f0' } }
      },
      plugins: { legend: { display: false } }
    }
  })
})

/* 모달 저장 이벤트 핸들러 */
const handleSkillSave = (updatedSkills: any) => {
  // 1. 데이터 업데이트
  skills.value = updatedSkills

  // 2. 차트 반영
  if (skillChart) {
    skillChart.data.labels = updatedSkills.map((s: any) => s.name)
    skillChart.data.datasets[0].data = updatedSkills.map((s: any) => s.level)
    skillChart.update()
  }

  // 3. 모달 닫기
  showSkillModal.value = false
}
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
  border-radius: 2px;
}

.btn-filled {
  background: #4ab8d8;
  color: white;
  border: none;
  padding: 4px 16px;
  cursor: pointer;
  font-size: 13px;
  border-radius: 2px;
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