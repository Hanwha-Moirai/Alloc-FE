<template>
  <div class="members-container">
    <div class="summary-cards">
      <div class="card">
        <span class="card-label">프로젝트 인원</span>
        <div class="card-value">총 <span class="highlight">5 명</span> 선정</div>
      </div>
      <div class="card">
        <span class="card-label">응답 대기</span>
        <div class="card-value">2</div>
      </div>
      <div class="card">
        <span class="card-label">수락</span>
        <div class="card-value">3</div>
      </div>
      <div class="card">
        <span class="card-label">면담요청</span>
        <div class="card-value">1</div>
      </div>
    </div>

    <div class="list-section">
      <div class="list-header">
        <h3 class="section-title">인원 리스트</h3>
        <div class="action-buttons">
          <button class="btn-outline">인원 추가</button>
          <button class="btn-primary">저장</button>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="member-table">
          <thead>
          <tr>
            <th>이름 ↓</th>
            <th>직군</th>
            <th>주력 기술</th>
            <th>적합도</th>
            <th>단가</th>
            <th>현재 투입 상태</th>
            <th>요청 상태</th>
            <th>의사 결정</th>
            <th>최종 결정</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(member, index) in memberList" :key="index">
            <td class="name-cell">
              <img src="/user.png" alt="user icon" class="user-icon" />
              {{ member.name }}
            </td>
            <td>{{ member.role }}</td>
            <td>
              <span class="skill-tag">{{ member.skill }}</span>
            </td>
            <td>{{ member.fit }}%</td>
            <td>{{ member.price.toLocaleString() }}</td>
            <td>
              <span class="status-dot ongoing"></span> 투입중
            </td>
            <td>
              <span class="status-dot" :class="member.requestStatusClass"></span>
              {{ member.requestStatus }}
            </td>
            <td>
              <div class="decision-group">
                  <span v-for="tag in member.decisions" :key="tag"
                        class="badge" :class="tag.class">
                    {{ tag.label }}
                  </span>
              </div>
            </td>
            <td>
              <div class="decision-group">
                  <span v-for="tag in member.finalDecisions" :key="tag"
                        class="badge" :class="tag.class">
                    {{ tag.label }}
                  </span>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const memberList = ref([
  {
    name: '홍길동',
    role: '백엔드 엔지니어',
    skill: 'Spring Boot',
    fit: 87,
    price: 5000000,
    requestStatus: '요청',
    requestStatusClass: 'request',
    decisions: [{ label: '면담 요청', class: 'red' }, { label: '수락', class: 'green' }],
    finalDecisions: []
  },
  {
    name: '홍길동',
    role: '백엔드 엔지니어',
    skill: 'Spring Boot',
    fit: 87,
    price: 5000000,
    requestStatus: '면담 요청',
    requestStatusClass: 'interview',
    decisions: [{ label: '면담 요청', class: 'red' }],
    finalDecisions: [{ label: '제외', class: 'dark-red' }, { label: '투입', class: 'bright-green' }]
  },
  {
    name: '홍길동',
    role: '백엔드 엔지니어',
    skill: 'Spring Boot',
    fit: 87,
    price: 5000000,
    requestStatus: '수락',
    requestStatusClass: 'accept',
    decisions: [{ label: '수락', class: 'green' }],
    finalDecisions: []
  }
]);
</script>

<style scoped>
/* 상단 카드 */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  padding: 15px 20px;
}

.card-label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}

.card-value {
  font-size: 20px;
  font-weight: 700;
  color: #111;
}

.card-value .highlight {
  font-size: 22px;
}

/* 리스트 헤더 */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.btn-outline {
  padding: 8px 16px;
  border: 1px solid #4ab8d8;
  background: #fff;
  color: #4ab8d8;
  cursor: pointer;
  border-radius: 2px;
}

.btn-primary {
  padding: 8px 24px;
  border: none;
  background: #00bcd4;
  color: #fff;
  cursor: pointer;
  border-radius: 2px;
}

/* 테이블 */
.table-wrapper {
  background: #fff;
  border: 1px solid #e5e7eb;
}

.member-table {
  width: 100%;
  border-collapse: collapse;
}

.member-table th {
  background: #f8fafc;
  padding: 12px 15px;
  text-align: left;
  font-size: 13px;
  color: #4b5563;
  border-bottom: 1px solid #e5e7eb;
}

.member-table td {
  padding: 14px 15px;
  font-size: 13px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

/* 이름 */
.name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
  vertical-align: middle;
}

/* 스킬 태그 */
.skill-tag {
  background: #f1f3f6;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  color: #666;
}

/* 상태 점 */
.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 4px;
}
.status-dot.ongoing { background: #4caf50; }
.status-dot.request { background: #ff9800; }
.status-dot.interview { background: #f44336; }
.status-dot.accept { background: #4caf50; }

/* 결정 배지 */
.decision-group {
  display: flex;
  gap: 5px;
}

.badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
}

.badge.red { background: #ff4d4f; }
.badge.green { background: #52c41a; }
.badge.dark-red { background: #cf1322; }
.badge.bright-green { background: #23cc66; }
</style>