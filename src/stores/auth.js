import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'

const STORAGE_KEY = 'accessToken'

const parseRole = (token) => {
  try {
    const payload = jwtDecode(token)
    return payload?.role || null
  } catch (error) {
    console.error('JWT decode 실패', error)
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,
    role: null,
    initialized: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.accessToken),
  },
  actions: {
    initFromStorage() {
      if (this.initialized) return

      const token = localStorage.getItem(STORAGE_KEY)
      if (token) {
        this.accessToken = token
        this.role = parseRole(token)
      } else {
        this.accessToken = null
        this.role = null
      }

      this.initialized = true
    },
    setAccessToken(token) {
      this.accessToken = token
      this.role = parseRole(token)
      localStorage.setItem(STORAGE_KEY, token)
    },
    clearAuth() {
      this.accessToken = null
      this.role = null
      localStorage.removeItem(STORAGE_KEY)
    },
  },
})
