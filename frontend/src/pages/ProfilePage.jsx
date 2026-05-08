import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Camera, LogOut } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import api from '../api'

const providerLabel = (p) => ({ LOCAL: '이메일', KAKAO: '카카오', GOOGLE: '구글' }[p] ?? p)

export default function ProfilePage() {
  const { user, logout, fetchUser } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [nickname, setNickname] = useState(user?.nickname || '')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!nickname.trim()) return

    setLoading(true)
    setMessage({ type: '', text: '' })
    try {
      await api.put('/users/me/nickname', { nickname })
      await fetchUser()
      setMessage({ type: 'success', text: '닉네임이 변경되었습니다.' })
    } catch {
      setMessage({ type: 'error', text: '변경에 실패했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    setMessage({ type: '', text: '' })
    try {
      await api.put('/users/me/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await fetchUser()
      setMessage({ type: 'success', text: '프로필 사진이 변경되었습니다.' })
    } catch {
      setMessage({ type: 'error', text: '사진 업로드에 실패했습니다.' })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?'

  const avatarSrc = user?.profileImage
    ? (user.profileImage.startsWith('http') ? user.profileImage : `${import.meta.env.VITE_API_URL}${user.profileImage}`)
    : null

  return (
    <div className="room-page">
      <div className="room-header">
        <button className="room-header-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="room-header-title">내 정보 관리</h1>
      </div>

      <div className="room-content" style={{ padding: 'var(--space-lg)' }}>
        {/* 프로필 이미지 */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div className="user-avatar" style={{ width: '100px', height: '100px', fontSize: '32px', margin: '0 auto', opacity: uploading ? 0.5 : 1 }}>
              {avatarSrc ? (
                <img src={avatarSrc} alt="" style={{ borderRadius: '50%' }} />
              ) : (
                getInitial(user?.nickname)
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: 'var(--color-primary)',
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white',
                cursor: 'pointer',
              }}
            >
              {uploading ? <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> : <Camera size={16} />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
          </div>
          <div style={{ marginTop: 'var(--space-md)' }}>
            <div style={{ fontWeight: 'bold', fontSize: 'var(--font-size-lg)' }}>{user?.nickname}</div>
          </div>
        </div>

        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="input-label">닉네임 변경</label>
              <span style={{ fontSize: 'var(--font-size-xs)', color: nickname.length >= 16 ? 'var(--color-danger)' : 'var(--color-text-light)' }}>
                {nickname.length}/16
              </span>
            </div>
            <input
              className="input-field"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="변경할 닉네임을 입력하세요"
              maxLength={16}
            />
          </div>

          {message.text && (
            <div style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)',
              textAlign: 'center',
              backgroundColor: message.type === 'success' ? 'var(--color-success-light)' : 'var(--color-danger-light)',
              color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
            }}>
              {message.text}
            </div>
          )}

          <button className="btn btn-primary btn-full" disabled={loading || nickname === user?.nickname}>
            {loading ? '저장 중...' : '정보 수정하기'}
          </button>
        </form>

        <div style={{ marginTop: 'var(--space-2xl)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-lg)' }}>
          <button
            className="btn btn-secondary btn-full"
            style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger-light)' }}
            onClick={() => { if (window.confirm('로그아웃 하시겠습니까?')) logout() }}
          >
            <LogOut size={18} /> 로그아웃
          </button>
        </div>
      </div>
    </div>
  )
}
