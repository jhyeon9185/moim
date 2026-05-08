import { useState } from 'react'
import { Bell, BellOff } from 'lucide-react'
import Modal from './Modal'

const OPTIONS = [
  { key: 'alert1h',  label: '1시간 전',         desc: '일정 시작 1시간 전 알림' },
  { key: 'alert3h',  label: '3시간 전',         desc: '일정 시작 3시간 전 알림' },
  { key: 'alertDay', label: '하루 전 오전 8시', desc: '전날 아침에 미리 알림' },
]

export default function NotificationPermissionModal({ onAllow, onDeny }) {
  const [prefs, setPrefs] = useState({ alert1h: true, alert3h: false, alertDay: false })

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }))

  const noneSelected = !prefs.alert1h && !prefs.alert3h && !prefs.alertDay

  return (
    <Modal isOpen={true} onClose={onDeny}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
        <div style={{
          width: '64px', height: '64px',
          background: 'var(--color-primary-light)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto var(--space-md)',
        }}>
          <Bell size={28} color="var(--color-primary)" />
        </div>
        <h2 className="modal-title" style={{ marginBottom: 'var(--space-xs)' }}>일정 알림 설정</h2>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          원하는 알림 시간을 선택하세요
        </p>
      </div>

      {/* 알림 옵션 선택 */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)',
        marginBottom: 'var(--space-lg)',
      }}>
        {OPTIONS.map(({ key, label, desc }) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-lg)',
              border: `2px solid ${prefs[key] ? 'var(--color-primary)' : 'var(--color-border-light)'}`,
              background: prefs[key] ? 'var(--color-primary-light)' : 'var(--color-surface)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all var(--transition-fast)',
              width: '100%',
            }}
          >
            <div style={{
              width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
              border: `2px solid ${prefs[key] ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: prefs[key] ? 'var(--color-primary)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {prefs[key] && <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>✓</span>}
            </div>
            <div>
              <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)', color: 'var(--color-text)' }}>
                {label}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                {desc}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        <button
          className="btn btn-primary btn-full"
          onClick={() => onAllow(prefs)}
          disabled={noneSelected}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <Bell size={16} />
          {noneSelected ? '항목을 선택해주세요' : '알림 허용하기'}
        </button>
        <button
          className="btn btn-secondary btn-full"
          onClick={onDeny}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <BellOff size={16} /> 나중에 할게요
        </button>
      </div>
    </Modal>
  )
}
