import { useState } from 'react'
import api from '../api'
import Modal from './Modal'

export default function CreateRoomModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('MOIM 이름을 입력해주세요.')
      return
    }

    setSubmitting(true)
    try {
      const res = await api.post('/rooms', { name: trimmed })
      onCreated(res.data)
    } catch {
      setError('MOIM 만들기에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="새 MOIM 만들기">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {error && <div className="login-error">{error}</div>}

        <div className="input-group">
          <label className="input-label" htmlFor="room-name">MOIM 이름</label>
          <input
            id="room-name"
            className="input-field"
            type="text"
            placeholder="예) 김씨 가족 MOIM"
            value={name}
            onChange={(e) => { setName(e.target.value); setError('') }}
            autoFocus
            maxLength={30}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
          {submitting ? '만드는 중...' : 'MOIM 만들기'}
        </button>

        <button type="button" className="btn btn-secondary btn-full" onClick={onClose}>
          취소
        </button>
      </form>
    </Modal>
  )
}
