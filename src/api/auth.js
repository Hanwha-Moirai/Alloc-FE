import axios from '@/lib/axios';

// 1) 인증코드 발송
export const sendResetCode = (email) => {
    return axios.post('/api/auth/password/reset/send', { email });
};

// 2) 인증코드 검증 (성공 시 resetToken 반환)
export const verifyResetCode = (email, code) => {
    return axios.post('/api/auth/password/reset/verify', { email, code });
};

// 3) 새 비밀번호 확정
export const confirmResetPassword = (resetToken, newPassword, newPasswordConfirm) => {
    return axios.post('/api/auth/password/reset/confirm', {
        resetToken,
        newPassword,
        newPasswordConfirm
    });
};