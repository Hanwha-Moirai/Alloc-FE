<template>
  <WeeklyReportDetail
      v-if="type === 'weekly-report'"
      :docId="docId"
  />

  <MeetingReportDetail
      v-else-if="type === 'meeting-record'"
      :docId="docId"
  />
</template>

<script setup lang="ts">
import WeeklyReportDetail from '@/pages/projectTabs/WeeklyReportDetail.vue';
import MeetingReportDetail from '@/pages/projectTabs/MeetingReportDetail.vue';

defineProps<{
  type: string;
  docId: string;
}>();
</script>
