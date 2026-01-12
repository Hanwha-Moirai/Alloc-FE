<template>
  <WeeklyReportDetail v-if="type === 'weekly'" :docId="docId" />
  <MeetingReportDetail v-else-if="type === 'meeting'" :docId="docId" />
</template>

<script setup lang="ts">
import WeeklyReportDetail from './WeeklyReportDetail.vue';
import MeetingReportDetail from './MeetingReportDetail.vue';

// 라우터 설정의 props: true를 통해 URL 파라미터를 직접 전달받음
defineProps<{
  type: string;
  docId: string;
}>();
</script>