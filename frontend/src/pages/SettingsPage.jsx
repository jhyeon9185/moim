import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AppHeader, IconButton, TabBar } from '../components/MoimUI'
import { IBack, IBell, ICheck } from '../components/Icons'
import DesktopLayout from '../components/DesktopLayout'
import { useIsDesktop } from '../hooks/useIsDesktop'
import api from '../api'

const OPTIONS = [
  { key: 'alert1h',  label: '1시간 전',         desc: '일정 시작 1시간 전 알림' },
  { key: 'alert3h',  label: '3시간 전',         desc: '일정 시작 3시간 전 알림' },
  { key: 'alertDay', label: '하루 전 오전 8시', desc: '전날 아침에 미리 알림' },
]

function Toggle({ checked, disabled }) {
  return (
    <div style={{
      width: 44, height: 24, borderRadius: 12, flexShrink: 0,
      background: checked ? 'var(--clay)' : 'var(--paper-200)',
      position: 'relative',
      opacity: disabled ? 0.45 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background 0.2s',
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3,
        left: checked ? 23 : 3,
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }}/>
    </div>
  )
}

export default function SettingsPage() {
  const { user, fetchUser } = useAuth()
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()

  const [prefs, setPrefs] = useState({
    alert1h:  user?.alert1h ?? true,
    alert3h:  user?.alert3h ?? false,
    alertDay: user?.alertDay ?? false,
    pushEnabled:   user?.pushEnabled ?? true,
    emailEnabled:  user?.emailNotificationEnabled ?? true,
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const toggle = key => setPrefs(p => ({ ...p, [key]: !p[key] }))

  const handleSave = async () => {
    setLoading(true)
    setMessage('')
    try {
      await api.put('/users/me/notifications', {
        pushEnabled:              prefs.pushEnabled,
        emailNotificationEnabled: prefs.emailEnabled,
        alert1h:  prefs.alert1h,
        alert3h:  prefs.alert3h,
        alertDay: prefs.alertDay,
      })
      await fetchUser()
      setMessage('success')
      setTimeout(() => setMessage(''), 3000)
    } catch {
      setMessage('error')
    } finally {
      setLoading(false)
    }
  }

  const content = (
    <div style={{ maxWidth: 520, margin: isDesktop ? '0 auto' : undefined }}>
      {/* 서비스 알림 */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clay)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>서비스 알림</div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--paper-200)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
          {[
            { key: 'pushEnabled', label: '푸시 알림', desc: '새로운 일정, 초대 승인 등 푸시 알림' },
            { key: 'emailEnabled', label: '이메일 알림', desc: '중요 공지 및 계정 관련 메일 수신' },
          ].map(({ key, label, desc }, i, arr) => (
            <div key={key} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '16px 18px',
              borderBottom: i < arr.length - 1 ? '1px solid var(--paper-200)' : 'none',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--r-sm)',
                background: 'var(--paper-100)', color: 'var(--ink-500)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <IBell size={18}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 600 }}>{label}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 6px',
                    background: 'var(--paper-200)', color: 'var(--ink-500)',
                    borderRadius: 'var(--r-pill)',
                  }}>준비 중</span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-500)', marginTop: 2 }}>{desc}</div>
              </div>
              <Toggle checked={prefs[key]} disabled/>
            </div>
          ))}
        </div>
      </div>

      {/* 일정 미리 알림 */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clay)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>일정 미리 알림</div>
        <div style={{ fontSize: 13, color: 'var(--ink-500)', fontWeight: 500, marginBottom: 12 }}>참여 중인 모든 모임의 일정에 적용됩니다.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {OPTIONS.map(({ key, label, desc }) => (
            <button key={key} onClick={() => toggle(key)} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 18px', borderRadius: 'var(--r-lg)',
              border: `2px solid ${prefs[key] ? 'var(--clay)' : 'var(--paper-200)'}`,
              background: prefs[key] ? 'var(--clay-100)' : 'var(--surface)',
              cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
              transition: 'border-color 0.15s, background 0.15s',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${prefs[key] ? 'var(--clay)' : 'var(--paper-300)'}`,
                background: prefs[key] ? 'var(--clay)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {prefs[key] && <ICheck size={12} color="#fff"/>}
              </div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: prefs[key] ? 'var(--clay)' : 'var(--ink-900)' }}>{label}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-500)', marginTop: 2 }}>{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {message === 'success' && (
        <div style={{
          padding: 12, borderRadius: 'var(--r-sm)', fontSize: 13.5,
          textAlign: 'center', marginBottom: 16,
          background: 'var(--tag-sage-bg)', color: 'var(--success)', fontWeight: 600,
        }}>설정이 저장되었습니다.</div>
      )}
      {message === 'error' && (
        <div style={{
          padding: 12, borderRadius: 'var(--r-sm)', fontSize: 13.5,
          textAlign: 'center', marginBottom: 16,
          background: '#FDECEA', color: 'var(--danger)', fontWeight: 600,
        }}>설정 저장에 실패했습니다.</div>
      )}

      <button onClick={handleSave} disabled={loading} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '100%', height: 52, borderRadius: 'var(--r-lg)',
        background: 'var(--clay)', color: '#fff',
        fontSize: 15, fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', opacity: loading ? 0.7 : 1,
      }}>
        {loading ? '저장 중...' : '설정 저장하기'}
      </button>
    </div>
  )

  // ─── 데스크탑 ─────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <DesktopLayout>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 700 }}>마이페이지</div>
          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.025em', margin: '4px 0 0' }}>알림 설정</h1>
        </div>
        {content}
      </DesktopLayout>
    )
  }

  // ─── 모바일 ───────────────────────────────────────────────────────
  return (
    <div className="moim paper-grain" style={{
      width: '100%', height: '100dvh', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', background: 'var(--paper-50)',
      position: 'relative',
    }}>
      <AppHeader title="알림 설정" left={<IconButton Icon={IBack} onClick={() => navigate(-1)}/>}/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 96px' }}>
        {content}
      </div>
      <TabBar/>
    </div>
  )
}
