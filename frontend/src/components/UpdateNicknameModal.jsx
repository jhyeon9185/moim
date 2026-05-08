import { useState } from 'react'
import { Smile } from 'lucide-react'
import api from '../api'
import Modal from './Modal'

export default function UpdateNicknameModal({ onClose, onUpdated, isMandatory = false }) {
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.put('/users/me/nickname', { nickname })
      onUpdated(nickname)
    } catch (err) {
      setError(err.response?.data?.message || '닉네임 변경에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          background: 'var(--color-primary-light)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto var(--space-md)'
        }}>
          <Smile size={32} color="var(--color-primary)" />
        </div>
        <h2 className="modal-title" style={{ marginBottom: 'var(--space-xs)' }}>반가워요!</h2>
        <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
          가족 모임에서 사용할<br />닉네임을 설정해주세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="input-label" htmlFor="nickname">닉네임</label>
            <span style={{ fontSize: 'var(--font-size-xs)', color: nickname.length >= 16 ? 'var(--color-danger)' : 'var(--color-text-light)' }}>
              {nickname.length}/16
            </span>
          </div>
          <input
            id="nickname"
            type="text"
            placeholder="예: 홍길동, 아빠, 막내"
            value={nickname}
            onChange={(e) => { setNickname(e.target.value); setError('') }}
            className={`input-field ${error ? 'input-error' : ''}`}
            disabled={loading}
            maxLength={16}
            autoFocus
          />
          {error && <span className="input-error-text">{error}</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading || !nickname.trim()}
          >
            {loading ? '저장 중...' : '시작하기'}
          </button>
          {!isMandatory && (
            <button 
              type="button" 
              className="btn btn-secondary btn-full" 
              onClick={onClose}
              disabled={loading}
            >
              다음에 할게요
            </button>
          )}
        </div>
      </form>
    </Modal>
  )
}
