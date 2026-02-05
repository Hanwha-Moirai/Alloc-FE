import { defineStore } from 'pinia'
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications,
  getNotificationSubscribeUrl,
} from '@/api/notification'
import { useAuthStore } from '@/stores/auth'

let eventSource = null
let reconnectTimer = null

const normalizeNotification = (raw) => {
  if (!raw) return null

  const id = raw.notificationId ?? raw.id ?? raw.alarmId ?? null
  const title = raw.title ?? raw.alarmTitle ?? ''
  const content = raw.content ?? raw.message ?? raw.alarmContext ?? ''
  const createdAt = raw.createdAt ?? raw.created_at ?? ''
  const isRead = raw.read ?? raw.isRead ?? false

  return {
    id,
    title,
    content,
    createdAt,
    isRead,
    targetType: raw.targetType ?? null,
    targetId: raw.targetId ?? null,
    linkUrl: raw.linkUrl ?? null,
  }
}

const parseJson = (payload) => {
  if (!payload) return null
  try {
    return JSON.parse(payload)
  } catch (error) {
    return null
  }
}

const scheduleReconnect = (store) => {
  if (reconnectTimer) return

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    const authStore = useAuthStore()
    if (authStore.isAuthenticated) {
      store.connectSse()
    }
  }, 3000)
}

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    connected: false,
    error: null,
  }),
  actions: {
    async loadNotifications(params = { page: 0, size: 20 }) {
      this.loading = true
      this.error = null

      try {
        const res = await fetchNotifications(params)
        const payload = res.data?.data || {}
        const items = payload.notifications || payload.content || []
        this.notifications = items
          .map(normalizeNotification)
          .filter((item) => item && item.id)
      } catch (error) {
        console.error('알림 목록 로드 실패:', error)
        this.error = error
      } finally {
        this.loading = false
      }
    },
    async loadUnreadCount() {
      try {
        const res = await fetchUnreadCount()
        const count = res.data?.data
        this.unreadCount = Number.isFinite(count) ? count : 0
      } catch (error) {
        console.error('미읽음 카운트 로드 실패:', error)
        this.error = error
      }
    },
    async refresh() {
      await Promise.all([this.loadNotifications(), this.loadUnreadCount()])
    },
    connectSse() {
      if (eventSource) return

      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        console.log('[SSE] connectSse skipped: not authenticated')
        return
      }

      const url = getNotificationSubscribeUrl()
      console.log('[SSE] connecting to', url)
      eventSource = new EventSource(url, { withCredentials: true })

      eventSource.onopen = () => {
        console.log('[SSE] connected')
        this.connected = true
        this.error = null
      }

      eventSource.addEventListener('UNREAD_COUNT', (event) => {
        const nextCount = parseInt(event.data, 10)
        if (Number.isFinite(nextCount)) {
          this.unreadCount = nextCount
        }
      })

      eventSource.addEventListener('NOTIFICATION', (event) => {
        const payload = parseJson(event.data) || {}
        const normalized = normalizeNotification(payload)
        if (!normalized || !normalized.id) return

        this.notifications = [normalized, ...this.notifications]
        if (!normalized.isRead) {
          this.unreadCount += 1
        }
      })

      eventSource.addEventListener('PING', () => {})

      eventSource.onerror = () => {
        console.log('[SSE] error/disconnected')
        this.connected = false
        this.error = new Error('SSE disconnected')
        if (eventSource) {
          eventSource.close()
          eventSource = null
        }
        scheduleReconnect(this)
      }
    },
    disconnectSse() {
      if (eventSource) {
        eventSource.close()
        eventSource = null
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
      this.connected = false
    },
    async markAsRead(notificationId) {
      try {
        await markNotificationAsRead(notificationId)
        const target = this.notifications.find((n) => n.id === notificationId)
        if (target && !target.isRead) {
          target.isRead = true
          this.unreadCount = Math.max(0, this.unreadCount - 1)
        }
      } catch (error) {
        console.error('알림 읽음 처리 실패:', error)
        this.error = error
      }
    },
    async markAllAsRead() {
      try {
        await markAllNotificationsAsRead()
        this.notifications.forEach((noti) => {
          noti.isRead = true
        })
        this.unreadCount = 0
      } catch (error) {
        console.error('알림 전체 읽음 실패:', error)
        this.error = error
      }
    },
    async removeNotification(notificationId) {
      try {
        await deleteNotification(notificationId)
        this.notifications = this.notifications.filter((n) => n.id !== notificationId)
      } catch (error) {
        console.error('알림 삭제 실패:', error)
        this.error = error
      }
    },
    async removeAllRead() {
      try {
        await deleteAllReadNotifications()
        this.notifications = this.notifications.filter((n) => !n.isRead)
      } catch (error) {
        console.error('읽은 알림 전체 삭제 실패:', error)
        this.error = error
      }
    },
  },
})
