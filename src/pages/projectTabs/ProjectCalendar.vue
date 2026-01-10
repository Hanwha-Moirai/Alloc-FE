<template>
  <div class="calendar-container">
    <aside class="calendar-sidebar">
      <div class="mini-calendar">
        <div class="calendar-month-header">{{ currentMonthName }}</div>

        <table class="calendar-table">
          <thead>
          <tr>
            <th v-for="(label, index) in dayLabels" :key="label"
                :class="{ 'sun': index === 0, 'sat': index === 6 }">
              {{ label }}
            </th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(week, i) in miniMonthDays" :key="i">
            <td
                v-for="day in week"
                :key="day.fullDate"
                :class="{
                'today': day.isToday,
                'other-month': !day.currentMonth,
                'sun': day.dayOfWeek === 0,
                'sat': day.dayOfWeek === 6
              }"
            >
              {{ day.date }}
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="schedule-summary">
        <section class="summary-section">
          <h3>📅 오늘 일정</h3>
          <ul>
            <li v-for="item in todaySchedules" :key="item.name">
              <span class="dot" :style="{ backgroundColor: item.color }"></span>
              <span class="name">{{ item.name }}</span>
              <span class="time">{{ item.time }}</span>
            </li>
          </ul>
        </section>

        <section class="summary-section">
          <h3>📅 내일 일정</h3>
          <ul>
            <li v-for="item in tomorrowSchedules" :key="item.name">
              <span class="dot" :style="{ backgroundColor: item.color }"></span>
              <span class="name">{{ item.name }}</span>
              <span class="time">{{ item.time }}</span>
            </li>
          </ul>
        </section>

        <section class="summary-section">
          <h3>✈️ 휴가</h3>
          <div class="vacation-item">
            <span class="dot blue"></span>
            <span class="name">김현수</span>
            <span class="range">01.02 ~ 01.05</span>
          </div>
        </section>
      </div>
    </aside>

    <main class="calendar-main">
      <header class="timeline-header">
        <button class="menu-btn" @click="moveWeek(-1)">◀</button>
        <h2 class="current-week">{{ weekRangeText }}</h2>
        <button class="menu-btn" @click="moveWeek(1)">▶</button>

        <div class="view-selector">
          <button class="select-btn">주간 보기 ▼</button>
        </div>

        <div class="header-right">
          <button class="search-btn">
            <img src="/search.png" class="search-icon" alt="검색" />
          </button>
          <button class="add-event-btn">+ 일정 추가하기</button>
        </div>
      </header>

      <div class="timeline-grid">
        <div class="grid-header">
          <div class="time-column"></div>
          <div
              v-for="day in weekDays"
              :key="day.fullDate"
              class="day-column"
              :class="{ 'today-highlight': day.isToday }"
          >
            {{ day.displayLabel }}
          </div>
        </div>

        <div class="grid-body">
          <div v-for="hour in hours" :key="hour" class="hour-row">
            <div class="time-label">{{ hour }}:00</div>
            <div v-for="n in 7" :key="n" class="time-slot"></div>
          </div>

          <div
              v-for="event in eventItems"
              :key="event.id"
              class="event-card"
              :style="getEventStyle(event)"
          >
            <span class="event-title">{{ event.title }}</span>
            <span class="event-time">{{ event.startTime }} - {{ dayjs(event.date + ' ' + event.startTime).add(event.duration, 'hour').format('HH:mm') }}</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'

dayjs.locale('ko')

// 기준 날짜 상태 (현재는 오늘 기준)
const selectedDate = ref(dayjs())

// 한국어 요일 헤더 데이터
const dayLabels = ['일', '월', '화', '수', '목', '금', '토']

// 일요일 시작 기준 미니 달력 계산
const miniMonthDays = computed(() => {
  const startOfMonth = selectedDate.value.startOf('month')

  // startOfMonth.day()가 0(일요일)이면 0일 전부터, 1(월요일)이면 1일 전부터 시작
  const startDayOffset = startOfMonth.day()
  const calendarStart = startOfMonth.subtract(startDayOffset, 'day')

  const weeks = []
  let currentDay = calendarStart

  for (let i = 0; i < 6; i++) {
    const week = []
    for (let j = 0; j < 7; j++) {
      week.push({
        date: currentDay.date(),
        fullDate: currentDay.format('YYYY-MM-DD'),
        dayOfWeek: currentDay.day(), // 0: 일, 6: 토
        currentMonth: currentDay.isSame(selectedDate.value, 'month'),
        isToday: currentDay.isSame(dayjs(), 'day')
      })
      currentDay = currentDay.add(1, 'day')
    }
    weeks.push(week)
  }
  return weeks
})

// 현재 표시 중인 월
const currentMonthName = computed(() => selectedDate.value.format('M월'))

// 해당 주의 날짜들 계산 (7일 치 데이터)
const weekDays = computed(() => {
  // 월요일 시작 기준 (dayjs는 0이 일요일이므로 locale 설정을 따르거나 manual 조정)
  const startOfWeek = selectedDate.value.startOf('week').add(1, 'day')

  return Array.from({ length: 7 }, (_, i) => {
    const date = startOfWeek.add(i, 'day')
    return {
      fullDate: date.format('YYYY-MM-DD'),
      // 요일(날짜) 형식으로 미리 포맷팅
      displayLabel: `${date.format('ddd')} (${date.date()})`,
      isToday: date.isSame(dayjs(), 'day')
    }
  })
})

// 헤더에 표시될 주간 범위 텍스트
const weekRangeText = computed(() => {
  const start = weekDays.value[0].fullDate
  const end = weekDays.value[6].fullDate
  return `${dayjs(start).format('YYYY년 M월 D일')} - ${dayjs(end).format('D일')}`
})

// 시간축 생성
const hours = Array.from({ length: 11 }, (_, i) => (i + 8).toString().padStart(2, '0'))

// 주 이동 함수 (이전 주, 다음 주 버튼 추가 시 사용)
const moveWeek = (step: number) => {
  selectedDate.value = selectedDate.value.add(step, 'week')
}

// 예시 일정 데이터
const eventItems = ref([
  {
    id: 1,
    title: '주간 업무 보고',
    date: dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD'), // 이번주 월요일
    startTime: '09:00',
    duration: 2, // 2시간
    color: '#dcfce7',
    borderColor: '#22c55e'
  },
  {
    id: 2,
    title: '프로젝트 운영 회의',
    date: dayjs().startOf('week').add(3, 'day').format('YYYY-MM-DD'), // 이번주 수요일
    startTime: '13:00',
    duration: 1.5, // 1시간 30분
    color: '#dbeafe',
    borderColor: '#3b82f6'
  },
  {
    id: 3,
    title: 'UI 디자인 검토',
    date: dayjs().format('YYYY-MM-DD'), // 오늘
    startTime: '10:00',
    duration: 3,
    color: '#fee2e2',
    borderColor: '#ef4444'
  }
])

// 이벤트 위치 계산 함수
const getEventStyle = (event: any) => {
  const eventDate = dayjs(event.date);
  const startOfWeek = selectedDate.value.startOf('week').add(1, 'day');
  const dayIndex = eventDate.diff(startOfWeek, 'day');

  // 해당 주가 아니면 표시하지 않음
  if (dayIndex < 0 || dayIndex > 6) return { display: 'none' };

  // 시간 계산
  const startHour = parseInt(event.startTime.split(':')[0]);
  const startMin = parseInt(event.startTime.split(':')[1]);
  const relativeStart = (startHour - 8) + (startMin / 60);

  return {
    left: `calc(60px + (${dayIndex} * (100% - 60px) / 7))`,
    top: `${relativeStart * 100}px`,
    height: `${event.duration * 100}px`,
    width: `calc((100% - 60px) / 7 - 10px)`, // 셀 너비보다 약간 작게 설정
    backgroundColor: event.color,
    borderLeft: `4px solid ${event.borderColor}`,
    marginLeft: '5px' // 셀 안에서의 여백
  };
}

const todaySchedules = computed(() => {
  const today = dayjs().format('YYYY-MM-DD')
  return eventItems.value
      .filter(event => event.date === today)
      .map(event => ({
        name: event.title,
        time: event.startTime,
        color: event.borderColor // 또는 event.color
      }))
})

const tomorrowSchedules = computed(() => {
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')
  return eventItems.value
      .filter(event => event.date === tomorrow)
      .map(event => ({
        name: event.title,
        time: event.startTime,
        color: event.borderColor
      }))
})
</script>

<style scoped>
.calendar-container {
  display: flex;
  height: calc(100vh - 180px);
  background: #f9fafb;
}

/* 사이드바 스타일 */
.calendar-sidebar {
  width: 260px;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  padding: 20px;
  overflow-y: auto;
}

.calendar-month-header { font-weight: 700; margin-bottom: 10px; }
.calendar-table { width: 100%; text-align: center; font-size: 12px; margin-bottom: 30px; }
.calendar-table th { color: #9ca3af; padding-bottom: 8px; font-weight: 400; }
.calendar-table td { padding: 8px 0; cursor: pointer; }
.calendar-table td.today { background: #4ab8d8; color: #fff; border-radius: 50%; }
.calendar-table td.other-month { color: #d1d5db; }

/* 일요일 빨간색 */
.sun { color: #ef4444 !important; }

/* 토요일 파란색 */
.sat { color: #3b82f6 !important; }

/* 오늘 날짜 하이라이트 (글자색 흰색 유지) */
.calendar-table td.today {
  background: #4ab8d8;
  color: #fff !important;
  border-radius: 50%;
}

.summary-section h3 { font-size: 14px; font-weight: 700; margin: 20px 0 10px; }
.summary-section li, .vacation-item {
  display: flex; align-items: center; gap: 8px; font-size: 12px; margin-bottom: 12px;
}
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.blue { background: #3b82f6; }
.time, .range { margin-left: auto; color: #666; }

/* 메인 타임라인 스타일 */
.calendar-main { flex: 1; display: flex; flex-direction: column; background: #fff; }
.timeline-header {
  display: flex; align-items: center; padding: 10px 20px; border-bottom: 1px solid #e5e7eb; gap: 15px;
}
.current-week { font-size: 18px; font-weight: 700; margin: 0; }
.select-btn { padding: 4px 10px; border: 1px solid #4ab8d8; background: #fff; color: #4ab8d8; cursor: pointer; }
.header-right { margin-left: auto; display: flex; gap: 10px; }
.search-btn {
  background: none;
  border: 1px solid #e5e7eb;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: background 0.2s;
}

.search-btn:hover {
  background: #f3f4f6;
}

.search-icon {
  width: 18px;
  height: 18px;
  opacity: 0.6;
}

.add-event-btn {
  background: #4ab8d8;
  color: #fff;
  border: none;
  padding: 0 14px;
  height: 36px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.timeline-grid { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.grid-header {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #fefefe;
  padding-right: 16px;
}
.time-column { width: 60px; }
.day-column {
  flex: 1;
  min-width: 0;
  text-align: center;
  padding: 12px 0;
  font-size: 14px;
  color: #4b5563; /* 짙은 회색 */
  border-left: 1px solid #e5e7eb;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 500;
}

/* 기존 스타일 하단에 추가 또는 수정 */
.grid-body {
  flex: 1;
  overflow-y: auto;
  position: relative;
  /* 가로 세로 스크롤 시에도 배경이 유지되도록 설정 */
}

.event-card {
  position: absolute;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
  transition: transform 0.1s;
  z-index: 10;
  box-sizing: border-box;
}

.event-title {
  font-weight: 700;
  color: #1f2937;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.event-time {
  font-size: 11px;
  color: #4b5563;
}
.hour-row { display: flex; height: 100px; border-bottom: 1px solid #f3f4f6; }
.time-label {
  width: 60px;
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
  padding-top: 5px;
  position: relative;
  z-index: 5;
  background: #fff;
}
.time-slot { flex: 1; border-left: 1px solid #f3f4f6; }


</style>