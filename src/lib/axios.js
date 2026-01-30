import axios from 'axios'

// 쿠키에서 값 읽기
function getCookie(name) {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
        return parts.pop().split(';').shift()
    }
}

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    withCredentials: true,
})

// 요청 인터셉터
instance.interceptors.request.use((config) => {
    const csrfToken = getCookie('csrfToken')
    if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken
    }
    return config
})

// 응답 인터셉터
instance.interceptors.response.use(
    (res) => res,
    async (error) => {
        if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default instance