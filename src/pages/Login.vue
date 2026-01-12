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
            v-model="username"
            placeholder="아이디를 입력해주세요."
        />
      </div>

      <!-- 비밀번호 -->
      <div class="field">
        <label>비밀번호</label>
        <input
            type="password"
            v-model="password"
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
      <button class="login-btn" @click="login">
        로그인
      </button>

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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/lib/axios'

const router = useRouter()

const username = ref('')
const password = ref('')

import { jwtDecode } from 'jwt-decode'

const login = async () => {
  try {
    const res = await axios.post('/auth/login', {
      loginId: username.value,
      password: password.value
    })

    // 💡 중요: 백엔드 응답 구조가 ApiResponse<AuthResponse>이므로 .data를 두 번 거쳐야 합니다.
    // res.data는 ApiResponse 객체, res.data.data는 실제 AuthResponse 객체입니다.
    const responseData = res.data.data;

    if (responseData && responseData.accessToken) {
      const accessToken = responseData.accessToken;
      localStorage.setItem('accessToken', accessToken);

      // JWT에서 role 추출
      const payload: any = jwtDecode(accessToken);
      const role = payload.role; // 백엔드 로그상 "PM" 확인됨

      // 역할별 이동
      if (role === 'PM') {
        router.push('/pmhome');
      } else {
        router.push('/home');
      }
    } else {
      console.error('응답 데이터 구조가 예상과 다릅니다:', res.data);
    }

  } catch (e: any) {
    console.error('Login Error:', e);
    alert('로그인 처리 중 오류가 발생했습니다.');
  }
}
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
