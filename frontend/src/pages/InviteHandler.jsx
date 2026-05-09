import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import api from '../api'
import LoadingSpinner from '../components/LoadingSpinner'

export default function InviteHandler() {
  const { code } = useParams()
  const { isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    // 인증 정보 로딩 중이면 대기
    if (loading) return

    // 로그인하지 않은 경우, 코드를 들고 로그인 페이지로 이동
    if (!isAuthenticated) {
      sessionStorage.setItem('pendingInviteCode', code)
      navigate('/login', { replace: true })
      return
    }

    // 로그인된 경우 초대 코드 처리
    const processInvite = async () => {
      try {
        const res = await api.post('/invite/join', { code })
        const { roomId } = res.data
        // 성공 시 해당 모임으로 이동
        navigate(`/room/${roomId}`, { replace: true })
      } catch (err) {
        const msg = err.response?.data?.message || '초대 처리 중 오류가 발생했습니다.'
        setError(msg)
        // 3초 후 메인으로 이동
        setTimeout(() => navigate('/', { replace: true }), 3000)
      }
    }

    processInvite()
  }, [code, isAuthenticated, loading, navigate])

  if (error) {
    return (
      <div className="loading-page" style={{ textAlign: 'center', padding: 20 }}>
        <p style={{ color: 'var(--color-error)', fontSize: 16, fontWeight: 600 }}>{error}</p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>잠시 후 메인 화면으로 이동합니다...</p>
      </div>
    )
  }

  return (
    <div className="loading-page">
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner />
        <p style={{ marginTop: 16, color: 'var(--color-text-secondary)' }}>모임에 입장하는 중입니다...</p>
      </div>
    </div>
  )
}
