import { useEffect, useRef, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export function useNotification(isAuthenticated) {
  const esRef = useRef(null)

  const connect = useCallback(() => {
    const token = localStorage.getItem('token')
    if (!token || !isAuthenticated) return
    if (esRef.current) return // already connected

    const url = `${API_URL}/api/notifications/stream?token=${encodeURIComponent(token)}`
    const es = new EventSource(url)
    esRef.current = es

    es.addEventListener('connected', () => {
      console.log('[SSE] 알림 연결됨')
    })

    es.addEventListener('notification', (e) => {
      try {
        const { title, body } = JSON.parse(e.data)
        if (Notification.permission === 'granted') {
          new Notification(title, { body, icon: '/moim_main.png', badge: '/moim_main.png' })
        }
      } catch {}
    })

    es.onerror = () => {
      es.close()
      esRef.current = null
      // 30초 후 재연결
      setTimeout(() => connect(), 30_000)
    }
  }, [isAuthenticated])

  const disconnect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      connect()
    }
    return () => disconnect()
  }, [isAuthenticated, connect, disconnect])

  return { connect, disconnect }
}
