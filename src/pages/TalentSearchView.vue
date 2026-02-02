<template>
  <div class="search-container" :class="{ 'is-searched': isSearched }">
    <div class="search-wrapper">

      <h1 v-if="!isSearched" class="search-title">어떤 인재를 추천해드릴까요?</h1>

      <div class="search-box-container">
        <input
            type="text"
            class="search-input"
            placeholder="검색하시고 싶은 인재에 대해서 자유롭게 적어주세요."
            v-model="searchQuery"
            @keyup.enter="handleSearch"
        />
        <button class="send-btn" @click="handleSearch">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <div v-if="!isSearched" class="suggest-tags">
        <button v-for="tag in suggestTags" :key="tag" class="tag-btn">
          {{ tag }}
        </button>
        <button class="tag-btn suggest-more">Suggest something</button>
      </div>

      <div v-if="isSearched" class="result-area">
        <div class="result-header">
          <div class="ai-summary">
            총 {{ people.length }}명이 검색되었습니다.
          </div>

        </div>

        <div class="result-table-wrapper">
          <table class="result-table">
            <thead>
            <tr>
              <th width="40"><input type="checkbox" /></th>
              <th>이름 <span style="font-size: 10px">↓</span></th>
              <th>직군</th>
              <th>주력 기술</th>
              <th>현재 투입 상태</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="person in people" :key="person.personId">
              <td><input type="checkbox" /></td>

              <td class="user-info">
                👤 {{ person.name }}
              </td>

              <td>{{ person.jobRole }}</td>

              <td>
      <span
          v-for="tech in person.techNames"
          :key="tech"
          class="tech-badge"
          style="margin-right:4px"
      >
        {{ tech }}
      </span>
              </td>

              <td>
                <span class="status-dot">●</span>
                대기중
              </td>
            </tr>

            <tr v-if="!loading && people.length === 0">
              <td colspan="5" style="text-align:center; padding:40px; color:#94a3b8">
                검색 결과가 없습니다.
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { searchPeopleByNL } from '@/api/peopleSearch'

const searchQuery = ref('')
const isSearched = ref(false)
const people = ref<any[]>([])
const loading = ref(false)

const suggestTags = [
  '직무', '기술', '숙련도', '투입 중 프로젝트 수', '부서', '재직 유형'
]

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return

  loading.value = true
  isSearched.value = true

  try {
    const res = await searchPeopleByNL({
      conversationId: 'people-search',
      nl: searchQuery.value
    })

    people.value = res.people ?? []
  } catch (e) {
    console.error(e)
    people.value = []
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.search-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-container.is-searched {
  align-items: flex-start;
  padding-top: 40px;
}

.search-wrapper {
  width: 100%;
  max-width: 900px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48px;
  padding: 0 40px;
  transition: all 0.5s ease;
}

.is-searched .search-wrapper {
  align-items: flex-start;
}

.search-title {
  font-size: 40px;
  font-weight: 700;
  color: #333333;
  margin: 0;
}

.search-box-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  height: 60px;
  padding: 0 70px 0 28px;
  font-size: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  outline: none;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #4ab8d8;
  box-shadow: 0 4px 15px rgba(74, 184, 216, 0.1);
}

.send-btn {
  position: absolute;
  right: 10px;
  width: 40px;
  height: 40px;
  background-color: #4ab8d8;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  padding: 0;
}

.send-btn:hover {
  background-color: #38a3c4;
}

/* 추천 태그 스타일 보정 */
.suggest-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.tag-btn {
  padding: 6px 16px;
  font-size: 13px;
  color: #64748b;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-btn:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}

.suggest-more {
  border-style: dashed;
  color: #94a3b8;
}

.result-area {
  width: 100%;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeIn 0.6s ease;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ai-summary {
  background: white;
  padding: 10px 20px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  font-size: 14px;
}

.ai-filter-tags {
  background: #3e3852;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
}

.result-table-wrapper {
  background: white;
  border-radius: 12px;
  border: 1px solid #eee;
  overflow: hidden;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
}

.result-table th, .result-table td {
  padding: 14px;
  border-bottom: 1px solid #f5f5f5;
  font-size: 14px;
}

.result-table th { background: #f8fafc; color: #64748b; text-align: left; }
.tech-badge { background: #f1f5f9; padding: 4px 8px; border-radius: 6px; font-size: 12px; }
.status-dot { color: #22c55e; margin-right: 4px; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>