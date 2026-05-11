import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import api from '../api'

export default function PrivacyAgreementPage() {
  const { user, fetchUser } = useAuth()
  const navigate = useNavigate()
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAgree = async () => {
    if (!agreed) return
    setLoading(true)
    try {
      await api.put('/users/me/privacy')
      await fetchUser()
      navigate('/', { replace: true })
    } catch (err) {
      alert('동의 처리에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="moim paper-grain" style={{
      width: '100%', minHeight: '100dvh',
      display: 'flex', flexDirection: 'column',
      padding: '48px 24px',
      background: 'var(--paper-50)',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--surface)', border: '1px solid var(--paper-200)',
        borderRadius: 'var(--r-xl)', padding: 28,
        boxShadow: 'var(--shadow-2)'
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>약관 동의</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-500)', fontWeight: 500, lineHeight: 1.6, marginBottom: 24 }}>
          MOIM 서비스를 이용하시려면<br/>개인정보처리방침에 동의가 필요합니다.
        </p>

        <div style={{
          height: 200, overflowY: 'auto', padding: 16,
          background: 'var(--surface-sunken)', border: '1px solid var(--paper-200)',
          borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--ink-700)',
          lineHeight: 1.6, marginBottom: 20
        }}>
          <strong>개인정보처리방침</strong><br/><br/>
          1. 수집하는 개인정보 항목: 이메일, 닉네임, 프로필 사진 등<br/>
          2. 수집 및 이용 목적: 회원 식별, 모임 초대 관리, 알림 제공 등<br/>
          3. 보유 및 이용 기간: 회원 탈퇴 시까지<br/><br/>
          본 서비스는 사용자의 편리한 모임 관리를 위해 최소한의 개인정보만을 수집합니다.
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <input 
            type="checkbox" id="privacy-page" checked={agreed} onChange={e => setAgreed(e.target.checked)}
            style={{ width: 20, height: 20, accentColor: 'var(--clay)', cursor: 'pointer' }}
          />
          <label htmlFor="privacy-page" style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-900)', cursor: 'pointer' }}>
            개인정보처리방침에 동의합니다.
          </label>
        </div>

        <button 
          onClick={handleAgree}
          disabled={!agreed || loading}
          style={{
            width: '100%', height: 52, borderRadius: 'var(--r-md)',
            background: 'var(--clay)', color: '#fff', border: 'none',
            fontSize: 16, fontWeight: 700, cursor: agreed ? 'pointer' : 'not-allowed',
            opacity: agreed && !loading ? 1 : 0.6,
            transition: 'opacity 0.2s'
          }}
        >
          {loading ? '처리 중...' : '동의하고 시작하기'}
        </button>
      </div>
    </div>
  )
}
