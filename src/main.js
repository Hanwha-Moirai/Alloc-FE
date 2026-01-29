import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from '@/stores/pinia'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)

app.use(pinia)
app.use(router)

const authStore = useAuthStore(pinia)
authStore.initFromStorage()

app.mount('#app')
