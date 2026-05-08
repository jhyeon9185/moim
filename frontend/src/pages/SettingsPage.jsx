import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Bell, BellOff, Shield, Smartphone } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import api from '../api'

const OPTIONS = [
  { key: 'alert1h',  label: '1시간 전',         desc: '일정 시작 1시간 전 알림' },
  { key: 'alert3h',  label: '3시간 전',         desc: '일정 시작 3시간 전 알림' },
  { key: 'alertDay', label: '하루 전 오전 8시', desc: '전날 아침에 미리 알림' },
]

export default function SettingsPage() {
  const { user, fetchUser } = useAuth()
  const navigate = useNavigate()
  
  const [prefs, setPrefs] = useState({
    alert1h: user?.alert1h ?? true,
    alert3h: user?.alert3h ?? false,
    alertDay: user?.alertDay ?? false,
    pushEnabled: user?.pushEnabled ?? true,
    emailEnabled: user?.emailNotificationEnabled ?? true
  })
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }))

  const handleSave = async () => {
    setLoading(true)
    setMessage('')
    try {
      await api.put('/users/me/notifications', {
        pushEnabled: prefs.pushEnabled,
        emailNotificationEnabled: prefs.emailEnabled,
        alert1h: prefs.alert1h,
        alert3h: prefs.alert3h,
        alertDay: prefs.alertDay
      })
      
      await fetchUser()
      setMessage('설정이 저장되었습니다.')
      setTimeout(() => setMessage(''), 3000)
    } catch {
      setMessage('설정 저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="room-page">
      <div className="room-header">
        <button className="room-header-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="room-header-title">설정</h1>
      </div>

      <div className="room-content" style={{ padding: 'var(--space-lg)' }}>
        <div className="settings-section">
          <h3 className="settings-section-title">서비스 알림</h3>
          <div className="settings-list">
            <div className="settings-item-row">
              <div className="settings-item-info">
                <div className="settings-item-label">
                  푸시 알림 <span className="coming-soon-tag">준비 중</span>
                </div>
                <div className="settings-item-desc">새로운 일정, 초대 승인 등 푸시 알림</div>
              </div>
              <label className="switch" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                <input 
                  type="checkbox" 
                  checked={prefs.pushEnabled} 
                  disabled
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="settings-item-row">
              <div className="settings-item-info">
                <div className="settings-item-label">
                  이메일 알림 <span className="coming-soon-tag">준비 중</span>
                </div>
                <div className="settings-item-desc">중요 공지 및 계정 관련 메일 수신</div>
              </div>
              <label className="switch" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                <input 
                  type="checkbox" 
                  checked={prefs.emailEnabled} 
                  disabled
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-section" style={{ marginTop: 'var(--space-xl)' }}>
          <h3 className="settings-section-title">일정 미리 알림</h3>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-light)', marginBottom: 'var(--space-md)' }}>
            참여 중인 모든 모임의 일정에 적용됩니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {OPTIONS.map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => toggle(key)}
                className={`settings-pref-card ${prefs[key] ? 'active' : ''}`}
              >
                <div className="settings-pref-check">
                  {prefs[key] && <span>✓</span>}
                </div>
                <div className="settings-pref-info">
                  <div className="settings-pref-label">{label}</div>
                  <div className="settings-pref-desc">{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {message && (
          <div className={`settings-message ${message.includes('실패') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div style={{ marginTop: 'var(--space-2xl)' }}>
          <button 
            className="btn btn-primary btn-full" 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? '저장 중...' : '설정 저장하기'}
          </button>
        </div>
      </div>

      <style>{`
        .coming-soon-tag {
          font-size: 10px;
          background: var(--color-bg);
          color: var(--color-text-light);
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: 6px;
          vertical-align: middle;
          font-weight: normal;
        }
        .settings-section-title {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-bold);
          color: var(--color-primary);
          margin-bottom: var(--space-sm);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .settings-list {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          padding: 0 var(--space-md);
        }
        .settings-item-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-md) 0;
          border-bottom: 1px solid var(--color-border-light);
        }
        .settings-item-row:last-child {
          border-bottom: none;
        }
        .settings-item-info {
          flex: 1;
        }
        .settings-item-label {
          font-weight: var(--font-weight-semibold);
          font-size: var(--font-size-base);
        }
        .settings-item-desc {
          font-size: var(--font-size-xs);
          color: var(--color-text-secondary);
          margin-top: 2px;
        }
        
        /* Switch UI */
        .switch {
          position: relative;
          display: inline-block;
          width: 46px;
          height: 24px;
        }
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
        }
        input:checked + .slider {
          background-color: var(--color-primary);
        }
        input:checked + .slider:before {
          transform: translateX(22px);
        }
        .slider.round {
          border-radius: 34px;
        }
        .slider.round:before {
          border-radius: 50%;
        }

        /* Pref Card */
        .settings-pref-card {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          border-radius: var(--radius-lg);
          border: 2px solid var(--color-border-light);
          background: var(--color-surface);
          cursor: pointer;
          text-align: left;
          transition: all var(--transition-fast);
          width: 100%;
        }
        .settings-pref-card.active {
          border-color: var(--color-primary);
          background: var(--color-primary-light);
        }
        .settings-pref-check {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .settings-pref-card.active .settings-pref-check {
          border-color: var(--color-primary);
          background: var(--color-primary);
          color: white;
          font-size: 10px;
          font-weight: bold;
        }
        .settings-pref-label {
          font-weight: var(--font-weight-semibold);
        }
        .settings-pref-desc {
          font-size: var(--font-size-xs);
          color: var(--color-text-secondary);
        }

        .settings-message {
          margin-top: var(--space-md);
          padding: 12px;
          border-radius: var(--radius-md);
          text-align: center;
          font-size: var(--font-size-sm);
        }
        .settings-message.success {
          background: var(--color-success-light);
          color: var(--color-success);
        }
        .settings-message.error {
          background: var(--color-danger-light);
          color: var(--color-danger);
        }
      `}</style>
    </div>
  )
}
