import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import LoginPage from './auth/LoginPage'
import ResetPasswordPage from './auth/ResetPasswordPage'
import OAuthCallback from './auth/OAuthCallback'
import RoomListPage from './pages/RoomListPage'
import RoomPage from './pages/RoomPage'
import AdminPage from './pages/AdminPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import NotificationPermissionModal from './components/NotificationPermissionModal'
import { NotificationProvider, useNotificationContext } from './notification/NotificationContext'
import LoadingSpinner from './components/LoadingSpinner'
import api from './api'

function ProtectedRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-page">
        <LoadingSpinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const isAtMain = window.location.pathname === '/'
  if (!user.nicknameSet && !isAtMain && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace state={{ showNicknameModal: true }} />
  }

  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-page">
        <LoadingSpinner />
      </div>
    )
  }

  return isAuthenticated ? <Navigate to="/" replace /> : children
}

function NotificationManager() {
  const { isAuthenticated } = useAuth()
  const { connect } = useNotificationContext()
  const [showPermissionModal, setShowPermissionModal] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    if (!('Notification' in window)) return
    if (Notification.permission === 'default') {
      const t = setTimeout(() => setShowPermissionModal(true), 3000)
      return () => clearTimeout(t)
    }
  }, [isAuthenticated])

  const handleAllow = async (prefs) => {
    setShowPermissionModal(false)
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      try {
        const res = await api.get('/rooms')
        const rooms = res.data.filter(r => r.status === 'APPROVED')
        await Promise.all(rooms.map(r =>
          api.put(`/notifications/settings/${r.roomId}`, prefs)
        ))
      } catch {}
      connect()
    }
  }

  const handleDeny = () => setShowPermissionModal(false)

  if (!showPermissionModal) return null
  return <NotificationPermissionModal onAllow={handleAllow} onDeny={handleDeny} />
}

function AppRoutes() {
  return (
    <>
      <NotificationManager />
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/" element={<ProtectedRoute><RoomListPage /></ProtectedRoute>} />
        <Route path="/room/:id" element={<ProtectedRoute><RoomPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  useEffect(() => {
    const handleFocus = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        // Give time for mobile keyboard to slide up
        setTimeout(() => {
          e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    }
    window.addEventListener('focusin', handleFocus);
    return () => window.removeEventListener('focusin', handleFocus);
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <AppRoutes />
      </NotificationProvider>
    </AuthProvider>
  )
}
