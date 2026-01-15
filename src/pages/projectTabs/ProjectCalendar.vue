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
          <ul v-if="vacationSchedules.length > 0">
            <li
                v-for="vacation in vacationSchedules"
                :key="vacation.id"
                class="vacation-item"
            >
              <span class="dot" :style="{ backgroundColor: vacation.color }"></span>
              <span class="name">{{ vacation.name }}</span>
              <span class="range">{{ vacation.range }}</span>
            </li>
          </ul>

          <div v-else class="vacation-item no-data">
            <span class="name">등록된 휴가가 없습니다.</span>
          </div>
        </section>
      </div>
    </aside>

    <main class="calendar-main">
      <header class="timeline-header">
        <button class="menu-btn" @click="moveWeek(-1)">◀</button>
        <h2 class="current-week">{{ headerText }}</h2>
        <button class="menu-btn" @click="moveWeek(1)">▶</button>

        <div class="view-toggle-container">
          <div class="toggle-background" :class="viewMode">
            <div class="toggle-slider"></div>
            <button
                class="toggle-btn"
                :class="{ active: viewMode === 'week' }"
                @click="setViewMode('week')"
            >주간 보기</button>
            <button
                class="toggle-btn"
                :class="{ active: viewMode === 'month' }"
                @click="setViewMode('month')"
            >월간 보기</button>
          </div>
        </div>

        <div class="header-right">
          <button class="search-btn">
            <img src="/search.png" class="search-icon" alt="검색" />
          </button>
          <button class="add-event-btn" @click="openModal">+ 일정 추가하기</button>
        </div>
      </header>

      <div class="timeline-grid">
        <template v-if="viewMode === 'week'">
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
        </template>

        <template v-else>
          <div class="month-grid-header">
            <div v-for="label in dayLabels" :key="label" class="month-day-label">{{ label }}</div>
          </div>
          <div class="month-grid-body">
            <div
                v-for="day in monthCalendarDays"
                :key="day.fullDate"
                class="month-day-cell"
                :class="{ 'other-month': !day.isCurrentMonth }"
            >
              <span class="day-num" :class="{ 'today-circle': day.isToday }">{{ day.day }}</span>
              <div class="month-event-list">
                <div
                    v-for="event in day.events.slice(0, 3)"
                    :key="event.id"
                    class="month-event-item"
                    :style="{ borderLeft: `3px solid ${event.borderColor}`, backgroundColor: event.color }"
                >
                  <span class="month-event-time">{{ event.startTime }}</span>
                  <span class="month-event-title">{{ event.title }}</span>
                </div>
                <div v-if="day.events.length > 3" class="more-events">
                  +{{ day.events.length - 3 }} 더보기
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </main>

    <CalendarAddModal
        :is-open="isModalOpen"
        @close="isModalOpen = false"
        @add-event="saveNewEvent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import CalendarAddModal from '@/components/common/CalendarAddModal.vue';
import { getCalendarData } from '@/api/calendar'

dayjs.locale('ko')

const route = useRoute()
const projectId = Number(route.params.projectId)

// 상태 및 데이터 정의
const viewMode = ref('week')
const isModalOpen = ref(false);
const selectedDate = ref(dayjs())

const eventItems = ref([])

const dayLabels = ['일', '월', '화', '수', '목', '금', '토']
const hours = Array.from({ length: 11 }, (_, i) => (i + 8).toString().padStart(2, '0'))

const fetchCalendarData = async () => {
  try {
    const from = selectedDate.value.startOf(viewMode.value === 'month' ? 'month' : 'week').format('YYYY-MM-DD');
    const to = selectedDate.value.endOf(viewMode.value === 'month' ? 'month' : 'week').format('YYYY-MM-DD');

    const response = await getCalendarData(projectId, from, to, viewMode.value);

    const items = response.data?.items || [];

    eventItems.value = items.map(item => {
      // 로그에서 확인된 대로 eventType과 eventId를 사용합니다.
      const type = item.eventType;
      const id = item.eventId;

      // 제목에 '연차'가 포함되거나 타입이 'VACATION'인 경우 체크
      const isVacation = type === 'VACATION' || (item.title && item.title.includes('연차'));

      const startDayjs = dayjs(item.start);
      const endDayjs = dayjs(item.end);

      const startTime = isVacation ? '08:00' : startDayjs.format('HH:mm');
      const duration = isVacation ? 10 : endDayjs.diff(startDayjs, 'hour', true);

      console.log(`[매핑 확인] ${item.title} -> 타입: ${type}, ID: ${id}`);

      return {
        id: id,
        title: item.title || '제목 없음',
        date: startDayjs.format('YYYY-MM-DD'),
        startTime: startTime,
        duration: duration || 1,
        category: type,
        color: getCategoryColor(type, item.title),
        borderColor: getCategoryBorderColor(type, item.title)
      };
    });

  } catch (error) {
    console.error("데이터 로딩 실패:", error);
  }
};

//  카테고리별 색상 지정
const getCategoryColor = (type, title = '') => {
  if (type === 'VACATION' || (title && title.includes('연차'))) return '#fef9c3'; // 노란색

  switch (type) {
    case 'EVENT': return '#dcfce7';   // 초록색
    case 'PUBLIC': return '#dbeafe';  // 파란색
    case 'PRIVATE': return '#ffedd5'; // 회색
    default: return '#ffffff';
  }
};

const getCategoryBorderColor = (type, title = '') => {
  if (type === 'VACATION' || (title && title.includes('연차'))) return '#facc15'; // 노란색 테두리

  switch (type) {
    case 'EVENT':
      return '#22c55e';
    case 'PUBLIC':
      return '#3b82f6';
    case 'PRIVATE':
      return '#f97316';
    default:
      return '#d1d5db';
  }
};

// 날짜나 뷰가 바뀔 때마다 실행
watch([selectedDate, viewMode], fetchCalendarData);
onMounted(fetchCalendarData);

// 모달 및 이벤트 관련 함수
const openModal = () => {
  isModalOpen.value = true;
};

const saveNewEvent = (eventData: any) => {
  eventItems.value.push(eventData);
  isModalOpen.value = false;
};

const setViewMode = (mode: string) => {
  viewMode.value = mode
}

const moveWeek = (step: number) => {
  if (viewMode.value === 'week') {
    selectedDate.value = selectedDate.value.add(step, 'week')
  } else {
    selectedDate.value = selectedDate.value.add(step, 'month')
  }
}

// 주간 보기 날짜 계산
const weekDays = computed(() => {
  const startOfWeek = selectedDate.value.startOf('week').add(1, 'day')
  return Array.from({ length: 7 }, (_, i) => {
    const date = startOfWeek.add(i, 'day')
    return {
      fullDate: date.format('YYYY-MM-DD'),
      displayLabel: `${date.format('ddd')} (${date.date()})`,
      isToday: date.isSame(dayjs(), 'day')
    }
  })
})

// 월간 보기 날짜 계산
const monthCalendarDays = computed(() => {
  const startOfMonth = selectedDate.value.startOf('month')
  const startDay = startOfMonth.startOf('week')
  const days = []
  let current = startDay
  for (let i = 0; i < 42; i++) {
    days.push({
      fullDate: current.format('YYYY-MM-DD'),
      day: current.date(),
      isCurrentMonth: current.month() === selectedDate.value.month(),
      isToday: current.isSame(dayjs(), 'day'),
      events: eventItems.value.filter(e => e.date === current.format('YYYY-MM-DD'))
    })
    current = current.add(1, 'day')
  }
  return days
})

// 미니 달력용
const miniMonthDays = computed(() => {
  const startOfMonth = selectedDate.value.startOf('month')
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
        dayOfWeek: currentDay.day(),
        currentMonth: currentDay.isSame(selectedDate.value, 'month'),
        isToday: currentDay.isSame(dayjs(), 'day')
      })
      currentDay = currentDay.add(1, 'day')
    }
    weeks.push(week)
  }
  return weeks
})

const currentMonthName = computed(() => selectedDate.value.format('M월'))

const headerText = computed(() => {
  if (viewMode.value === 'month') {
    return selectedDate.value.format('YYYY년 M월')
  }
  const start = weekDays.value[0].fullDate
  const end = weekDays.value[6].fullDate
  return `${dayjs(start).format('YYYY년 M월 D일')} - ${dayjs(end).format('D일')}`
})

// 사이드바 요약 일정
const todaySchedules = computed(() => {
  const today = dayjs().format('YYYY-MM-DD')
  return eventItems.value
      .filter(event => event.date === today)
      .map(event => ({ name: event.title, time: event.startTime, color: event.borderColor }))
})

const tomorrowSchedules = computed(() => {
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')
  return eventItems.value
      .filter(event => event.date === tomorrow)
      .map(event => ({ name: event.title, time: event.startTime, color: event.borderColor }))
})

// 사이드바에 표시할 휴가 일정 추출
const vacationSchedules = computed(() => {
  return eventItems.value
      .filter(event => event.category === 'VACATION' || event.title.includes('연차'))
      .map(event => ({
        id: event.id,
        name: event.title,
        range: dayjs(event.date).format('MM.DD'),
        color: event.borderColor
      }));
});

// 이벤트 스타일 계산
const getEventStyle = (event: any) => {
  const eventDate = dayjs(event.date);
  const startOfWeek = selectedDate.value.startOf('week').add(1, 'day');
  const dayIndex = eventDate.diff(startOfWeek, 'day');
  if (dayIndex < 0 || dayIndex > 6) return { display: 'none' };

  const startHour = parseInt(event.startTime.split(':')[0]);
  const startMin = parseInt(event.startTime.split(':')[1]);
  const relativeStart = (startHour - 8) + (startMin / 60);

  return {
    left: `calc(60px + (${dayIndex} * (100% - 60px) / 7))`,
    top: `${relativeStart * 100}px`,
    height: `${event.duration * 100}px`,
    width: `calc((100% - 60px) / 7 - 10px)`,
    backgroundColor: event.color,
    borderLeft: `4px solid ${event.borderColor}`,
    marginLeft: '5px'
  };
}
</script>

<style scoped>
.calendar-container {
  display: flex;
  height: calc(100vh - 210px);
  background: #f9fafb;
  overflow: hidden;
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

/* 주간보기/월간보기 토글 */
.view-toggle-container {
  background: #f1f3f5;
  border-radius: 20px;
  display: flex;
  position: relative;
  width: 180px;
}

.toggle-background {
  display: flex;
  position: relative;
  width: 180px;
  background: #f1f3f5;
  border-radius: 5px;
  cursor: pointer;
}

.toggle-slider {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: #4ab8d8;
  border-radius: 5px;
  transition: transform 0.3s ease;
  z-index: 1;
}

.toggle-background.week .toggle-slider {
  transform: translateX(0);
}

.toggle-background.month .toggle-slider {
  transform: translateX(100%);
}

.toggle-btn {
  flex: 1;
  border: none;
  background: none;
  padding: 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #868e96;
  z-index: 2;
  cursor: pointer;
  transition: color 0.3s;
  position: relative;
}

.toggle-btn.active {
  color: #ffffff;
}

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


.grid-body {
  flex: 1;
  overflow-y: auto;
  position: relative;
}

/* 스크롤바 숨기기 */
.grid-body::-webkit-scrollbar,
.month-grid-body::-webkit-scrollbar,
.calendar-sidebar::-webkit-scrollbar {
  display: none;
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

/* 월간 그리드 스타일 */
.month-grid-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}
.month-day-label {
  padding: 10px;
  text-align: center;
  font-weight: 600;
  font-size: 13px;
}

.month-grid-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 1fr); /* 6주 고정 */
  flex: 1;
  overflow-y: auto;
}

.month-day-cell {
  border-right: 1px solid #f3f4f6;
  border-bottom: 1px solid #f3f4f6;
  min-height: 120px;
  padding: 5px;
  background: #fff;
}

.month-day-cell.other-month {
  background: #fafafa;
  color: #d1d5db;
}

.day-num {
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 5px;
  display: inline-block;
  width: 20px;
  height: 20px;
  text-align: center;
  line-height: 20px;
}

.today-circle {
  background: #4ab8d8;
  color: #fff;
  border-radius: 50%;
}

.month-event-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.month-event-item {
  font-size: 11px;
  padding: 2px 4px;
  display: flex; /* 가로로 배치 */
  gap: 4px;      /* 시간과 제목 사이 간격 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-radius: 2px;
  margin-bottom: 2px;
}

.month-event-time {
  font-weight: 700;
  flex-shrink: 0;
  color: #4b5563;
}

.month-event-title {
  overflow: hidden;
  text-overflow: ellipsis;
}

.more-events {
  font-size: 10px;
  color: #3b82f6;
  padding-left: 4px;
  font-weight: 600;
}
</style>