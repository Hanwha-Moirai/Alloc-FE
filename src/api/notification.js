import axios from '@/lib/axios'

// 알림 목록 조회 (페이징 지원)
export const fetchNotifications = (params = { page: 0, size: 10 }) => {
    return axios.get('/api/notifications', { params })
}

// 미읽음 알림 개수 조회 (배지용)
export const fetchUnreadCount = () => {
    return axios.get('/api/notifications/unread-count')
}

// 알림 단건 읽음 처리
export const markNotificationAsRead = (notificationId) => {
    return axios.patch(`/api/notifications/${notificationId}/read`)
}

// 알림 전체 읽음 처리
export const markAllNotificationsAsRead = () => {
    return axios.patch('/api/notifications/read-all')
}

// 알림 단건 삭제 (Soft Delete)
export const deleteNotification = (notificationId) => {
    return axios.delete(`/api/notifications/${notificationId}`)
}

// 읽은 알림 전체 삭제
export const deleteAllReadNotifications = () => {
    return axios.delete('/api/notifications/read')
}

/**
 * 실시간 알림 구독(SSE) URL 반환
 * SSE는 axios를 통하지 않고 EventSource 객체를 사용해야 하므로 URL만 정의
 */
export const getNotificationSubscribeUrl = () => {
    return '/api/notifications/stream'
}
