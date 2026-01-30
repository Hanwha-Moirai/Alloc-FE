import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { pinia } from '@/stores/pinia'

const authStore = useAuthStore(pinia)

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    withCredentials: true,
})

// 요청 인터셉터
instance.interceptors.request.use((config) => {
    const csrfToken = authStore.csrfToken
    if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken
    }
    return config
})

// 응답 인터셉터 수정
instance.interceptors.response.use(
    (res) => res,
    async (error) => {
        // 현재 페이지가 로그인 페이지가 아닐 때만 자동 리다이렉트 수행
        if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
            authStore.clearAuth()
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default instance
