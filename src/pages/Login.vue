<template>
  <div class="login-page">
    <div class="login-card">
      <!-- 로고 -->
      <img src="/alloc-logo.png" alt="ALLOC" class="logo" />

      <!-- 타이틀 -->
      <h2 class="title">로그인</h2>

      <!-- 아이디 -->
      <div class="field">
        <label>아이디</label>
        <input
            type="text"
            placeholder="아이디를 입력해주세요."
        />
      </div>

      <!-- 비밀번호 -->
      <div class="field">
        <label>비밀번호</label>
        <input
            type="password"
            placeholder="비밀번호를 입력해주세요."
        />
      </div>

      <!-- 비밀번호 재설정 -->
      <div class="extra">
        <RouterLink to="/password-reset">
          비밀번호 재설정
        </RouterLink>
      </div>

      <!-- 로그인 버튼 -->
      <button class="login-btn">로그인</button>

      <!-- 관리자 로그인 -->
      <div class="admin">
        <RouterLink to="/admin/login">
          관리자 로그인
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 👉 나중에 v-model, submit 로직 추가
</script>

<style scoped>
/* 전체 배경 */
.login-page {
  min-height: 100vh;
  background-color: #f5f7f9;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 카드 */
.login-card {
  width: 420px;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 40px 36px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  text-align: center;
}

/* 로고 */
.logo {
  height: 40px;
}

/* 타이틀 */
.title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 28px;
}

/* 입력 필드 */
.field {
  text-align: left;
  margin-bottom: 18px;
}

.field label {
  font-size: 13px;
  color: #555;
  margin-bottom: 6px;
  display: block;
}

.field input {
  width: 100%;
  height: 44px;
  border-radius: 4px;
  border: 1px solid #e1e4e8;
  padding: 0 12px;
  font-size: 14px;
  background-color: #f7f9fb;
}

.field input:focus {
  outline: none;
  border-color: #4ab8d8;
  background-color: #fff;
}

.field input {
  box-sizing: border-box;
}

/* 비밀번호 재설정 */
.extra {
  text-align: right;
  margin-bottom: 20px;
}

.extra a {
  font-size: 12px;
  color: #4ab8d8;
  text-decoration: none;
}

/* 로그인 버튼 */
.login-btn {
  width: 100%;
  height: 46px;
  background-color: #4ab8d8;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.login-btn:hover {
  background-color: #3aa7c8;
}

/* 관리자 로그인 */
.admin {
  margin-top: 18px;
}

.admin a {
  font-size: 13px;
  color: #666;
  text-decoration: none;
}
</style>
