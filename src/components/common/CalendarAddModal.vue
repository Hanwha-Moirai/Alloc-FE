<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <header class="modal-header">
          <h2>일정 추가하기</h2>
          <button class="close-x-btn" @click="$emit('close')">✕</button>
        </header>

        <div class="modal-body">
          <div class="form-row">
            <label class="form-label">일정명</label>
            <div class="form-input-group">
              <input v-model="form.title" type="text" placeholder="일정 제목을 입력하세요" class="full-input" />
            </div>
          </div>

          <div class="form-row align-start">
            <label class="form-label pt-10">일정 기간</label>
            <div class="datetime-vertical-group">
              <div class="datetime-item">
                <span class="period-tag start">시작</span>
                <input v-model="form.startDate" type="date" class="date-input" />
                <input v-model="form.startTime" type="time" class="time-input" />
              </div>

              <div class="vertical-arrow">↓</div>

              <div class="datetime-item">
                <span class="period-tag end">종료</span>
                <input v-model="form.endDate" type="date" class="date-input" />
                <input v-model="form.endTime" type="time" class="time-input" />
              </div>
            </div>
          </div>

          <div class="form-row">
            <label class="form-label">유형</label>
            <div class="form-input-group radio-group">
              <label class="radio-item"><input type="radio" v-model="form.type" value="PUBLIC" /> 공개 일정</label>
              <label class="radio-item"><input type="radio" v-model="form.type" value="PRIVATE" /> 개인 일정</label>
              <label class="radio-item"><input type="radio" v-model="form.type" value="VACATION" /> 휴가</label>
            </div>
          </div>

          <div class="form-row">
            <label class="form-label">담당자</label>
            <div class="form-input-group">
              <select v-model="form.assigneeId" class="full-input select-input">
                <option :value="null" disabled selected>담당자를 선택하세요</option>
                <option
                    v-for="member in memberList"
                    :key="member.userId"
                    :value="member.userId"
                >
                  {{ member.employeeName }} ({{ member.jobName }})
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <label class="form-label">장소</label>
            <div class="form-input-group">
              <input v-model="form.location" type="text" placeholder="장소 또는 회의실" class="full-input" />
            </div>
          </div>
        </div>

        <footer class="modal-footer">
          <button class="btn-cancel" @click="$emit('close')">취소</button>
          <button class="btn-save" @click="handleSave">등록</button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import dayjs from 'dayjs';

const props = defineProps<{
  isOpen: boolean,
  memberList: any[]
}>();
const emit = defineEmits(['close', 'add-event']);

const form = ref({
  title: '',
  startDate: dayjs().format('YYYY-MM-DD'),
  startTime: '09:00',
  endDate: dayjs().format('YYYY-MM-DD'),
  endTime: '10:00',
  type: 'PUBLIC',
  assigneeId: null as number | null,
  location: '',
  description: ''
});

const handleSave = () => {
  if (!form.value.title) return alert('일정명을 입력해주세요.');

  // 공유 일정일 때만 담당자(참여자) 체크
  if (form.value.type === 'PUBLIC' && !form.value.assigneeId) {
    return alert('담당자를 선택해주세요.');
  }

  const start = dayjs(`${form.value.startDate} ${form.value.startTime}`);
  const end = dayjs(`${form.value.endDate} ${form.value.endTime}`);

  if (end.isBefore(start) || end.isSame(start)) {
    return alert('종료 일시가 시작 일시보다 빠를 수 없습니다.');
  }

  emit('add-event', {
    title: form.value.title,
    startDate: form.value.startDate,
    startTime: form.value.startTime,
    endDate: form.value.endDate,
    endTime: form.value.endTime,
    type: form.value.type,
    location: form.value.location,
    description: form.value.description,
    memberUserIds: form.value.assigneeId ? [form.value.assigneeId] : []
  });

  // 폼 초기화
  resetForm();
};

const resetForm = () => {
  form.value.title = '';
  form.value.assigneeId = null;
  form.value.location = '';
  form.value.description = '';
};
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 3000;
}
.modal-content {
  background: white; width: 520px; border-radius: 2px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  overflow: hidden; font-family: 'Pretendard', sans-serif;
}
.modal-header {
  padding: 20px 24px; border-bottom: 1px solid #f0f0f0;
  display: flex; justify-content: space-between; align-items: center;
}
.modal-header h2 { margin: 0; font-size: 18px; font-weight: 700; color: #111; }
.close-x-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #999; }
.modal-body { padding: 24px; }

.form-row { display: flex; margin-bottom: 20px; align-items: center; }
.align-start { align-items: flex-start; }
.pt-10 { padding-top: 10px; }
.form-label { width: 90px; font-size: 14px; font-weight: 600; color: #666; flex-shrink: 0; }

/* 수직 정렬된 날짜/시간 그룹 */
.datetime-vertical-group { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.datetime-item { display: flex; align-items: center; gap: 8px; }

/* 시작/종료 태그 스타일 */
.period-tag {
  width: 40px; font-size: 11px; font-weight: 700; padding: 4px 0;
  text-align: center; border-radius: 4px; flex-shrink: 0;
}
.period-tag.start { background-color: #f1f3f5; color: #495057; }
.period-tag.end { background-color: #fff0f0; color: #fa5252; }

.vertical-arrow { padding-left: 55px; color: #dee2e6; font-size: 12px; height: 12px; line-height: 12px; }

.date-input { flex: 1.5; padding: 10px; border: 1px solid #ddd; border-radius: 2px; font-size: 14px; }
.time-input { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 2px; font-size: 14px; }

.form-input-group { flex: 1; display: flex; align-items: center; gap: 8px; }
.full-input {
  width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 2px; font-size: 14px;
}
.select-input { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; background-color: #fff;}

.radio-group { gap: 15px; }
.radio-item { font-size: 14px; display: flex; align-items: center; gap: 5px; cursor: pointer; }

.modal-footer {
  padding: 0 24px 24px 24px;
  background: #fcfcfc;
  display: flex;
  justify-content:
      flex-end; gap: 10px;
}
.btn-cancel { padding: 10px 20px; border: 1px solid #ddd; background: white; cursor: pointer; color: #666; }
.btn-save { padding: 10px 24px; border: none; background: #4ab8d8; color: white; cursor: pointer; }
</style>