import { defineStore } from 'pinia'
import axios from '@/lib/axios'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null, // UserMeResponse 그대로
    }),

    getters: {
        userId: (state) => state.user?.userId,
        role: (state) => state.user?.role,
        isAuthenticated: (state) => !!state.user,
    },

    actions: {
        async fetchMe() {
            const res = await axios.get('/api/user/me')
            this.user = res.data.data
        },

        async logout() {
            await axios.post('/api/auth/logout')
            this.user = null
        },

        clearAuth() {
            this.user = null
        },
    },
})
