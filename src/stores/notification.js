import { defineStore } from 'pinia'
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications,
  fetchNotificationPoll,
} from '@/api/notification'
import { useAuthStore } from '@/stores/auth'

let pollTimer = null

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

const DEFAULT_POLL_INTERVAL = 10000

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    connected: false,
    error: null,
    latestNotificationId: 0,
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
        if (this.notifications.length > 0) {
           this.latestNotificationId = Math.max(
              ...this.notifications.map((item) => item.id || 0)
           )
          }
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
      async pollNotifications() {
          const authStore = useAuthStore()
          if (!authStore.isAuthenticated) return

          try {
              const res = await fetchNotificationPoll({
                  sinceId: this.latestNotificationId || 0,
              })
              const payload = res.data?.data || {}
              const items = payload.notifications || []
              const normalizedItems = items
                  .map(normalizeNotification)
                  .filter((item) => item && item.id)

              if (normalizedItems.length > 0) {
                  const existingIds = new Set(this.notifications.map((n) => n.id))
                  const newItems = normalizedItems.filter((item) => !existingIds.has(item.id))
                  if (newItems.length > 0) {
                      const ordered = [...newItems].sort((a, b) => a.id - b.id)
                      this.notifications = [...ordered.reverse(), ...this.notifications]
                  }
              }

              if (Number.isFinite(payload.unreadCount)) {
                  this.unreadCount = payload.unreadCount
              }

              if (Number.isFinite(payload.latestNotificationId)) {
                  this.latestNotificationId = Math.max(
                      this.latestNotificationId || 0,
                      payload.latestNotificationId
                  )
              }
              this.connected = true
              this.error = null
          } catch (error) {
              console.error('알림 폴링 실패:', error)
              this.connected = false
              this.error = error
          }
      },
      startPolling(intervalMs = DEFAULT_POLL_INTERVAL) {
          const authStore = useAuthStore()
          if (!authStore.isAuthenticated || pollTimer) return

          this.pollNotifications()
          pollTimer = setInterval(() => {
              this.pollNotifications()
          }, intervalMs)
      },
      stopPolling() {
          if (pollTimer) {
              clearInterval(pollTimer)
              pollTimer = null
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
