import { useState } from 'react'
import api from '../api'

export default function CreateRoomModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('모임 이름을 입력해주세요.')
      return
    }

    setSubmitting(true)
    try {
      const res = await api.post('/rooms', { name: trimmed })
      onCreated(res.data)
    } catch {
      setError('모임 만들기에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <h2 className="modal-title">새 모임 만들기</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {error && <div className="login-error">{error}</div>}

          <div className="input-group">
            <label className="input-label" htmlFor="room-name">모임 이름</label>
            <input
              id="room-name"
              className="input-field"
              type="text"
              placeholder="예) 김씨 가족 모임"
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              autoFocus
              maxLength={30}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
            {submitting ? '만드는 중...' : '모임 만들기'}
          </button>

          <button type="button" className="btn btn-secondary btn-full" onClick={onClose}>
            취소
          </button>
        </form>
      </div>
    </div>
  )
}
