import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'

const NotificationContext = createContext(null)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const esRef = useRef(null)

  const connect = useCallback(() => {
    const token = localStorage.getItem('token')
    if (!token || !isAuthenticated) return
    if (esRef.current) return

    const url = `${API_URL}/api/notifications/stream?token=${encodeURIComponent(token)}`
    const es = new EventSource(url)
    esRef.current = es

    es.addEventListener('connected', () => console.log('[SSE] 알림 연결됨'))

    es.addEventListener('notification', (e) => {
      try {
        const { title, body } = JSON.parse(e.data)
        setNotifications(prev => [{ id: Date.now(), title, body, time: new Date() }, ...prev.slice(0, 49)])
        setUnreadCount(prev => prev + 1)
        if (Notification.permission === 'granted') {
          new Notification(title, { body, icon: '/moim_main.png', badge: '/moim_main.png' })
        }
      } catch {}
    })

    es.onerror = () => {
      es.close()
      esRef.current = null
      setTimeout(() => connect(), 30_000)
    }
  }, [isAuthenticated])

  const disconnect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }
  }, [])

  const markAllRead = useCallback(() => setUnreadCount(0), [])
  const clearAll = useCallback(() => { setNotifications([]); setUnreadCount(0) }, [])

  useEffect(() => {
    if (isAuthenticated) connect()
    return () => disconnect()
  }, [isAuthenticated, connect, disconnect])

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, clearAll, connect }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  return useContext(NotificationContext)
}
