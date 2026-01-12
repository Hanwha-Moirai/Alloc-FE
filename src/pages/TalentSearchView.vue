<template>
  <div class="search-container">
    <div class="search-wrapper">
      <h1 class="search-title">어떤 인재를 추천해드릴까요?</h1>

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

      <div class="suggest-tags">
        <button v-for="tag in suggestTags" :key="tag" class="tag-btn">
          {{ tag }}
        </button>
        <button class="tag-btn suggest-more">Suggest something</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
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
</style>