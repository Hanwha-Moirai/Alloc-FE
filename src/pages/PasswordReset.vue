<template>
  <div class="login-page">
    <div class="login-card">
      <!-- 타이틀 -->
      <h2 class="title">비밀번호 재설정</h2>

      <!-- 설명 문구 -->
      <p class="desc">
        Alloc에 등록된 이메일을 입력해주세요.<br />
        비밀번호 재설정 메일을 보내드리겠습니다.
      </p>

      <!-- 이메일 -->
      <div class="field">
        <label>이메일 주소</label>
        <input
            type="email"
            placeholder="이메일 주소를 입력해주세요."
        />
      </div>

      <!-- 재설정 버튼 -->
      <button class="login-btn">
        비밀번호 재설정하기
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
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

/* 타이틀 */
.title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
}

/* 설명 */
.desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 28px;
  line-height: 1.6;
}

/* 입력 필드 */
.field {
  text-align: left;
  margin-bottom: 24px;
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
  box-sizing: border-box;
}

.field input:focus {
  outline: none;
  border-color: #4ab8d8;
  background-color: #fff;
}

/* 버튼 */
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
</style>
