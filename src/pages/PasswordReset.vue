<template>
  <div class="login-page">
    <div class="login-card">
      <h2 class="title">비밀번호 재설정</h2>

      <p class="desc" v-if="step === 1">Alloc에 등록된 이메일을 입력해주세요.</p>
      <p class="desc" v-if="step === 2">이메일로 전송된 6자리 인증코드를 입력해주세요.</p>
      <p class="desc" v-if="step === 3">새로 사용할 비밀번호를 입력해주세요.</p>

      <div v-if="step === 1" class="field-group">
        <div class="field">
          <label>이메일 주소</label>
          <input type="email" v-model="resetForm.email" placeholder="이메일 주소를 입력해주세요." />
        </div>
        <button class="login-btn" @click="handleSendCode" :disabled="loading">
          {{ loading ? '발송 중...' : '인증코드 보내기' }}
        </button>
      </div>

      <div v-if="step === 2" class="field-group">
        <p class="desc">이메일로 전송된 6자리 코드를 입력하세요.</p>
        <div class="field">
          <div class="input-with-timer">
            <input type="text" v-model="resetForm.code" placeholder="6자리 코드" maxlength="6" />
            <span class="expiry-timer">{{ formatTime(codeExpiry) }}</span>
          </div>
        </div>
        <button class="login-btn" @click="handleVerifyCode">인증확인</button>

        <button class="resend-btn" @click="handleSendCode" :disabled="cooldown > 0 || loading">
          {{ cooldown > 0 ? `${cooldown}초 후 재발송 가능` : '코드 재발송' }}
        </button>
      </div>

      <div v-if="step === 3" class="field-group">
        <div class="field">
          <label>새 비밀번호</label>
          <input type="password" v-model="resetForm.newPassword" placeholder="새 비밀번호 입력" />
        </div>
        <div class="field">
          <label>비밀번호 확인</label>
          <input type="password" v-model="resetForm.confirmPassword" placeholder="비밀번호 재입력" />
        </div>
        <button class="login-btn" @click="resetPassword" :disabled="loading">
          {{ loading ? '변경 중...' : '비밀번호 변경하기' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { sendResetCode, verifyResetCode, confirmResetPassword } from '@/api/auth';

const router = useRouter();
const step = ref(1);
const loading = ref(false);
const resetToken = ref('');

// --- 타이머 관련 상태 ---
const cooldown = ref(0);      // 재발송까지 남은 시간
const codeExpiry = ref(0);    // 코드 만료까지 남은 시간
let cooldownTimer: any = null;
let expiryTimer: any = null;

const resetForm = reactive({
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
});

// 타이머 초기화
const clearAllTimers = () => {
  if (cooldownTimer) clearInterval(cooldownTimer);
  if (expiryTimer) clearInterval(expiryTimer);
};

onUnmounted(() => clearAllTimers());

// [STEP 1] 인증코드 발송
const handleSendCode = async () => {
  if (!resetForm.email) return alert('이메일을 입력해주세요.');

  loading.value = true;
  try {
    const res = await sendResetCode(resetForm.email);
    const { cooldownSeconds, expiresInSeconds } = res.data.data;

    // 타이머 시작
    startCooldown(cooldownSeconds);
    startCodeExpiry(expiresInSeconds);

    alert('인증코드가 이메일로 발송되었습니다.');
    step.value = 2;
  } catch (e: any) {
    alert(e.response?.data?.message || '메일 발송에 실패했습니다.');
  } finally {
    loading.value = false;
  }
};

// 재발송 쿨타임 타이머
const startCooldown = (seconds: number) => {
  cooldown.value = seconds;
  if (cooldownTimer) clearInterval(cooldownTimer);
  cooldownTimer = setInterval(() => {
    if (cooldown.value > 0) cooldown.value--;
    else clearInterval(cooldownTimer);
  }, 1000);
};

// 코드 만료 타이머
const startCodeExpiry = (seconds: number) => {
  codeExpiry.value = seconds;
  if (expiryTimer) clearInterval(expiryTimer);
  expiryTimer = setInterval(() => {
    if (codeExpiry.value > 0) codeExpiry.value--;
    else clearInterval(expiryTimer);
  }, 1000);
};

// 시간 포맷 변환 (초 -> 분:초)
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

// [STEP 2] 인증코드 확인
const handleVerifyCode = async () => {
  if (codeExpiry.value <= 0) return alert('인증 시간이 만료되었습니다. 다시 시도해주세요.');

  loading.value = true;
  try {
    const res = await verifyResetCode(resetForm.email, resetForm.code);
    resetToken.value = res.data.data.resetToken;
    clearAllTimers(); // 인증 성공 시 타이머 중지
    step.value = 3;
  } catch (e: any) {
    alert(e.response?.data?.message || '인증번호가 올바르지 않습니다.');
  } finally {
    loading.value = false;
  }
};

// [STEP 3] 최종 비밀번호 변경
const resetPassword = async () => {
  if (!resetForm.newPassword) return alert('새 비밀번호를 입력해주세요.');
  if (resetForm.newPassword !== resetForm.confirmPassword) {
    return alert('비밀번호가 일치하지 않습니다.');
  }

  loading.value = true;
  try {
    await confirmResetPassword(
        resetToken.value,
        resetForm.newPassword,
        resetForm.confirmPassword
    );
    alert('비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.');
    router.push('/login');
  } catch (e: any) {
    alert(e.response?.data?.message || '변경 실패');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page { min-height: 100vh; background-color: #f5f7f9; display: flex; align-items: center; justify-content: center; }
.login-card { width: 420px; background-color: #ffffff; border-radius: 8px; padding: 40px 36px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04); text-align: center; }
.title { font-size: 24px; font-weight: 700; margin-bottom: 12px; }
.desc { font-size: 13px; color: #666; margin-bottom: 28px; line-height: 1.6; }
.field { text-align: left; margin-bottom: 16px; }
.field label { font-size: 13px; color: #555; margin-bottom: 6px; display: block; }
.field input { width: 100%; height: 44px; border-radius: 4px; border: 1px solid #e1e4e8; padding: 0 12px; font-size: 14px; background-color: #f7f9fb; box-sizing: border-box; }
.field input:focus { outline: none; border-color: #4ab8d8; background-color: #fff; }
.login-btn { width: 100%; height: 46px; background-color: #4ab8d8; color: white; border: none; border-radius: 4px; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 10px; }
.login-btn:disabled { background-color: #ccc; cursor: not-allowed; }
.text-btn { background: none; border: none; color: #888; font-size: 12px; margin-top: 15px; cursor: pointer; text-decoration: underline; }
.input-with-timer {
  position: relative;
  display: flex;
  align-items: center;
}
.expiry-timer {
  position: absolute;
  right: 12px;
  color: #ff4d4f;
  font-size: 13px;
  font-weight: 600;
}
.resend-btn {
  background: none;
  border: none;
  color: #4ab8d8;
  font-size: 13px;
  margin-top: 15px;
  cursor: pointer;
}
.resend-btn:disabled {
  color: #999;
  cursor: default;
}
</style>