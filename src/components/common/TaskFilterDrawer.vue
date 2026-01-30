<!-- 필터 버튼 클릭시 조건별 검색 모달 -->
<template>
  <div class="drawer-overlay" :class="{ open: isOpen }" @click.self="$emit('close')">
    <div class="drawer-content" :class="{ open: isOpen }">
      <div class="drawer-header">
        <h2>조건별 검색하기</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="reset-wrapper">
        <button class="reset-btn" @click="resetFilters">Reset all</button>
      </div>

      <div class="filter-sections">
        <div class="filter-group">
          <h3>태스크 유형별 검색</h3>
          <div v-for="cat in categories" :key="cat.value" class="checkbox-item">
            <input type="checkbox" :id="cat.value" v-model="filters.categories" :value="cat.value">
            <label :for="cat.value">{{ cat.label }}</label>
          </div>
        </div>

        <div class="filter-group">
          <h3>담당자별 검색</h3>
          <div v-for="user in users" :key="user.id" class="checkbox-item">
            <input
                type="checkbox"
                :id="`user-${user.id}`"
                v-model="filters.assignees"
                :value="user.id"
            />
            <label :for="`user-${user.id}`">{{ user.name }}</label>
          </div>
        </div>

        <div class="filter-group">
          <h3>기간별 검색</h3>
          <div v-for="period in periods" :key="period" class="checkbox-item">
            <input type="checkbox" :id="period" v-model="filters.periods" :value="period">
            <label :for="period">{{ period }}</label>
          </div>
        </div>
      </div>

      <div class="drawer-footer">
        <button class="search-btn" @click="applyFilters">검색</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const props = defineProps<{
  isOpen: boolean
  categories: { label: string; value: string }[]
  users: { id: number; name: string }[]
}>()

const emit = defineEmits(['close', 'filter'])

const periods = ['지연됨', 'D-7', 'D-14', 'D-21']

const filters = reactive({
  categories: [] as string[],
  assignees: [] as number[],
  periods: [] as string[]
})

const resetFilters = () => {
  filters.categories = []
  filters.assignees = []
  filters.periods = []
}

const applyFilters = () => {
  emit('filter', { ...filters })
  emit('close')
}
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 2000;
}
.drawer-overlay.open {
  background: rgba(0, 0, 0, 0.3);
  visibility: visible;
}

.drawer-content {
  position: absolute;
  right: -300px;
  top: 0;
  width: 280px;
  height: 100%;
  background: #fff;
  box-shadow: -2px 0 8px rgba(0,0,0,0.1);
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;
  padding: 24px 20px;
}
.drawer-content.open { right: 0; }

.drawer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.drawer-header h2 { font-size: 20px; font-weight: 700; margin: 0; }
.close-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #9ca3af; }

.reset-wrapper { text-align: right; margin-bottom: 0; }
.reset-btn { background: none; border: none; font-size: 13px; color: #6b7280; cursor: pointer; text-decoration: underline; }

.filter-group { margin-bottom: 24px; }
.filter-group h3 { font-size: 14px; color: #374151; margin-bottom: 12px; }

.checkbox-item { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.checkbox-item input { width: 16px; height: 16px; accent-color: #4ab8d8; cursor: pointer; }
.checkbox-item label { font-size: 13px; color: #4b5563; cursor: pointer; }

.drawer-footer {
  padding-top: 12px;
  background: #fff;
}

.search-btn {
  width: 100%;
  height: 44px;
  background: #4ab8d8;
  color: #fff;
  border: none;
  cursor: pointer;
}

</style>