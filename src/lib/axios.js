import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { pinia } from '@/stores/pinia'

const authStore = useAuthStore(pinia)
authStore.initFromStorage()

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    withCredentials: true,
});

// 요청 인터셉터
instance.interceptors.request.use(
    (config) => {
        const token = authStore.accessToken;

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 인터셉터
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        // 서버에서 401 Unauthorized 에러를 보낸 경우
        if (error.response?.status === 401) {
            console.warn('인증이 만료되었습니다. 로그인 페이지로 이동합니다.');

            // 유효하지 않은 토큰 제거
            authStore.clearAuth();

            // 로그인 페이지로 강제 리다이렉트
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default instance;
