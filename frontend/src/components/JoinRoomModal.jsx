import { useState } from 'react'
import { Clock } from 'lucide-react'
import api from '../api'

export default function JoinRoomModal({ onClose, onJoined }) {
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null) // 'pending' | 'error'
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) {
      setError('초대 코드를 입력해주세요.')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/invite/join', { code: trimmed })
      setResult('pending')
    } catch (err) {
      const msg = err.response?.data?.message
      setError(msg || '유효하지 않은 코드입니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (result === 'pending') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-handle" />
          <div className="empty-state">
            <div className="empty-state-icon">
              <Clock size={48} strokeWidth={1.5} color="var(--color-primary)" />
            </div>
            <h2 className="empty-state-title">신청 완료!</h2>
            <p className="empty-state-desc">
              방장이 승인하면<br />모임에 참가할 수 있어요.
            </p>
            <button
              className="btn btn-primary btn-full"
              onClick={() => { onJoined(); onClose() }}
              style={{ marginTop: 'var(--space-md)' }}
            >
              확인
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <h2 className="modal-title">초대 코드 입력</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {error && <div className="login-error">{error}</div>}

          <div className="input-group">
            <label className="input-label" htmlFor="invite-code">초대 코드</label>
            <input
              id="invite-code"
              className="input-field"
              type="text"
              placeholder="8자리 코드 입력"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError('') }}
              autoFocus
              maxLength={8}
              style={{ letterSpacing: '4px', textAlign: 'center', fontSize: 'var(--font-size-xl)', fontFamily: 'monospace' }}
            />
          </div>

          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
            가족에게 받은 코드를 입력해주세요
          </p>

          <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
            {submitting ? '확인 중...' : '참가 신청하기'}
          </button>

          <button type="button" className="btn btn-secondary btn-full" onClick={onClose}>
            취소
          </button>
        </form>
      </div>
    </div>
  )
}
