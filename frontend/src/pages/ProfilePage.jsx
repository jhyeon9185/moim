import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Camera, LogOut, Check, X } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import Modal from '../components/Modal'
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
  
  // 이미지 업로드 관련 상태
  const [previewImage, setPreviewImage] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [showZoom, setShowZoom] = useState(false)

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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setImageFile(file)
    setPreviewImage(URL.createObjectURL(file))
    setMessage({ type: '', text: '' })
  }

  const handleSaveImage = async () => {
    if (!imageFile) return

    const formData = new FormData()
    formData.append('file', imageFile)

    setUploading(true)
    setMessage({ type: '', text: '' })
    try {
      await api.put('/users/me/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await fetchUser()
      setImageFile(null)
      setPreviewImage(null)
      setMessage({ type: 'success', text: '프로필 사진이 변경되었습니다.' })
    } catch {
      setMessage({ type: 'error', text: '사진 업로드에 실패했습니다.' })
    } finally {
      setUploading(false)
    }
  }

  const cancelImageChange = () => {
    setImageFile(null)
    setPreviewImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?'

  const currentAvatarSrc = user?.profileImage
    ? (user.profileImage.startsWith('http') ? user.profileImage : `${import.meta.env.VITE_API_URL}${user.profileImage}`)
    : null
  
  const displaySrc = previewImage || currentAvatarSrc

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
            <div 
              className="user-avatar" 
              onClick={() => displaySrc && setShowZoom(true)}
              style={{ 
                width: '120px', 
                height: '120px', 
                fontSize: '40px', 
                margin: '0 auto', 
                opacity: uploading ? 0.5 : 1,
                cursor: displaySrc ? 'zoom-in' : 'default',
                border: imageFile ? '3px solid var(--color-primary)' : 'none'
              }}
            >
              {displaySrc ? (
                <img src={displaySrc} alt="" style={{ borderRadius: '50%' }} />
              ) : (
                getInitial(user?.nickname)
              )}
            </div>
            
            {/* 사진 변경 버튼 - 크기 키움 */}
            {!imageFile && (
              <button
                type="button"
                className="btn-camera-float"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  background: 'var(--color-primary)',
                  color: 'white',
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid white',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                {uploading ? <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> : <Camera size={20} />}
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          {/* 이미지 변경 확정 버튼 */}
          {imageFile && !uploading && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
              <button 
                onClick={handleSaveImage}
                className="btn btn-primary"
                style={{ minHeight: '40px', padding: '0 16px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-sm)' }}
              >
                <Check size={16} style={{ marginRight: '4px' }} /> 변경 적용
              </button>
              <button 
                onClick={cancelImageChange}
                className="btn btn-secondary"
                style={{ minHeight: '40px', padding: '0 16px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-sm)' }}
              >
                <X size={16} style={{ marginRight: '4px' }} /> 취소
              </button>
            </div>
          )}

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

      {/* 이미지 확대 모달 */}
      <Modal isOpen={showZoom} onClose={() => setShowZoom(false)} title="프로필 사진 확대">
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-md) 0' }}>
          <img 
            src={displaySrc} 
            alt="프로필 사진 확대" 
            style={{ width: '100%', maxWidth: '100%', borderRadius: 'var(--radius-lg)', objectFit: 'contain' }} 
          />
        </div>
        <button className="btn btn-secondary btn-full" onClick={() => setShowZoom(false)} style={{ marginTop: 'var(--space-md)' }}>
          닫기
        </button>
      </Modal>
    </div>
  )
}
