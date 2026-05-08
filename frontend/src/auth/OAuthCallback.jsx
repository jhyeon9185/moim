import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

export default function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { oauthLogin } = useAuth()
  const [error, setError] = useState('')

  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    const code = searchParams.get('code')
    const state = searchParams.get('state') // 'kakao' or 'google'

    if (!code || !state) {
      setError('잘못된 접근입니다.')
      return
    }

    oauthLogin(state, code)
      .then(() => {
        navigate('/', { replace: true })
      })
      .catch(() => {
        setError('소셜 로그인에 실패했습니다. 다시 시도해주세요.')
      })
  }, [searchParams, navigate, oauthLogin])

  if (error) {
    return (
      <div className="loading-page">
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-lg)' }}>
            {error}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            로그인으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="loading-page">
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-md)' }}>
        <LoadingSpinner />
        <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-secondary)' }}>
          로그인 중입니다...
        </p>
      </div>
    </div>
  )
}
