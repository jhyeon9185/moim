import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Avatar, Tag, AppHeader, IconButton, TabBar } from '../components/MoimUI'
import { ICamera, IPencil, ISettings, IUser, ILink, ILogout, IChevR, IBack, ICheck, IX } from '../components/Icons'
import Modal from '../components/Modal'
import DesktopLayout from '../components/DesktopLayout'
import { useIsDesktop } from '../hooks/useIsDesktop'
import api from '../api'

function MenuGroup({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-500)', marginBottom: 8, paddingLeft: 4 }}>{title}</h2>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--paper-200)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}

function MenuRow({ icon, label, right, onClick, danger = false }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px', borderBottom: '1px solid var(--paper-200)',
      cursor: onClick ? 'pointer' : 'default',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 'var(--r-sm)',
        background: danger ? '#FDECEA' : 'var(--paper-100)',
        color: danger ? 'var(--danger)' : 'var(--ink-700)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon}</div>
      <div style={{ flex: 1, fontSize: 14.5, fontWeight: 600, letterSpacing: '-0.01em', color: danger ? 'var(--danger)' : 'var(--ink-900)' }}>{label}</div>
      <div style={{ color: 'var(--ink-500)' }}>{right || (onClick ? <IChevR size={18}/> : null)}</div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, logout, fetchUser } = useAuth()
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()
  const fileInputRef = useRef(null)

  const [nickname, setNickname] = useState(user?.nickname || '')
  const [editingNickname, setEditingNickname] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [previewImage, setPreviewImage] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [showZoom, setShowZoom] = useState(false)

  const handleUpdate = async () => {
    if (!nickname.trim() || nickname === user?.nickname) return
    setLoading(true)
    setMessage({ type: '', text: '' })
    try {
      await api.put('/users/me/nickname', { nickname })
      await fetchUser()
      setMessage({ type: 'success', text: '닉네임이 변경되었습니다.' })
      setEditingNickname(false)
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

  const currentAvatarSrc = user?.profileImage
    ? (user.profileImage.startsWith('http') ? user.profileImage : `${import.meta.env.VITE_API_URL}${user.profileImage}`)
    : null
  const displaySrc = previewImage || currentAvatarSrc

  const profileContent = (
    <div style={{ maxWidth: 560, margin: isDesktop ? '0 auto' : undefined }}>
      {/* Profile card */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--paper-200)',
        borderRadius: 'var(--r-xl)', padding: 22, marginBottom: 18,
        display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: 'var(--shadow-1)',
      }}>
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => displaySrc && setShowZoom(true)}
            style={{ cursor: displaySrc ? 'zoom-in' : 'default' }}
          >
            <Avatar name={user?.nickname || '?'} src={displaySrc} size={64} color="var(--wood)" ring/>
          </div>
          {!imageFile && (
            <button onClick={() => fileInputRef.current?.click()} style={{
              position: 'absolute', right: -2, bottom: -2,
              width: 26, height: 26, borderRadius: '50%',
              background: 'var(--clay)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--surface)', cursor: 'pointer',
            }}>
              {uploading
                ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }}/>
                : <ICamera size={13}/>}
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange}/>
        </div>

        {imageFile ? (
          <div style={{ flex: 1, display: 'flex', gap: 8 }}>
            <button onClick={handleSaveImage} disabled={uploading} style={{
              flex: 1, height: 38, borderRadius: 'var(--r-sm)',
              background: 'var(--clay)', color: '#fff',
              fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}>
              <ICheck size={14}/> 적용
            </button>
            <button onClick={cancelImageChange} style={{
              flex: 1, height: 38, borderRadius: 'var(--r-sm)',
              background: 'var(--paper-200)', color: 'var(--ink-700)',
              fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}>
              <IX size={14}/> 취소
            </button>
          </div>
        ) : (
          <div style={{ flex: 1, minWidth: 0 }}>
            {editingNickname ? (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  value={nickname} onChange={e => setNickname(e.target.value)}
                  maxLength={16} autoFocus
                  style={{
                    flex: 1, height: 36, padding: '0 10px',
                    background: 'var(--surface-sunken)', border: '1.5px solid var(--clay)',
                    borderRadius: 'var(--r-sm)', fontSize: 15, fontWeight: 600,
                    color: 'var(--ink-900)', fontFamily: 'inherit', outline: 'none',
                  }}
                />
                <button onClick={handleUpdate} disabled={loading} style={{
                  height: 36, padding: '0 12px', borderRadius: 'var(--r-sm)',
                  background: 'var(--clay)', color: '#fff',
                  fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}>{loading ? '...' : '저장'}</button>
                <button onClick={() => { setEditingNickname(false); setNickname(user?.nickname || '') }} style={{
                  height: 36, width: 36, borderRadius: 'var(--r-sm)',
                  background: 'var(--paper-200)', color: 'var(--ink-700)',
                  fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}><IX size={14}/></button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>{user?.nickname}</span>
                {user?.role === 'ADMIN' && <Tag color="clay" size="sm">관리자</Tag>}
              </div>
            )}
            {!editingNickname && (
              <div style={{ fontSize: 12.5, color: 'var(--ink-500)', fontWeight: 500 }}>{user?.email || ''}</div>
            )}
          </div>
        )}

        {!imageFile && !editingNickname && (
          <IconButton Icon={IPencil} onClick={() => setEditingNickname(true)}/>
        )}
      </div>

      {message.text && (
        <div style={{
          padding: '12px', borderRadius: 'var(--r-sm)', fontSize: 13.5, textAlign: 'center', marginBottom: 16,
          background: message.type === 'success' ? 'var(--tag-sage-bg)' : '#FDECEA',
          color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
          fontWeight: 600,
        }}>{message.text}</div>
      )}

      {user?.role === 'ADMIN' && (
        <MenuGroup title="관리자">
          <MenuRow icon={<ISettings size={20}/>} label="관리자 대시보드" onClick={() => navigate('/admin')}/>
        </MenuGroup>
      )}

      <MenuGroup title="앱 설정">
        <MenuRow icon={<IUser size={20}/>} label="계정 정보" right={<span style={{ fontSize: 13, color: 'var(--ink-500)', fontWeight: 600 }}>{user?.email || ''}</span>}/>
        <MenuRow icon={<ISettings size={20}/>} label="알림 설정" onClick={() => navigate('/settings')}/>
        <MenuRow icon={<ILink size={20}/>} label="고객센터"/>
      </MenuGroup>

      <button onClick={() => { if (window.confirm('로그아웃 하시겠습니까?')) logout() }} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: '100%', height: 48, marginTop: 8,
        color: 'var(--ink-500)', fontSize: 14, fontWeight: 600,
        background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
      }}>
        <ILogout size={18}/> 로그아웃
      </button>
    </div>
  )

  const zoomModal = (
    <Modal isOpen={showZoom} onClose={() => setShowZoom(false)} title="프로필 사진">
      <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
        {displaySrc && <img src={displaySrc} alt="프로필" style={{ width: '100%', borderRadius: 'var(--r-md)', objectFit: 'contain' }}/>}
      </div>
      <button className="btn btn-secondary btn-full" onClick={() => setShowZoom(false)} style={{ marginTop: 12 }}>닫기</button>
    </Modal>
  )

  // ─── 데스크탑 ─────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <>
        <DesktopLayout>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 700 }}>마이페이지</div>
            <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.025em', margin: '4px 0 0' }}>내 프로필</h1>
          </div>
          {profileContent}
        </DesktopLayout>
        {zoomModal}
      </>
    )
  }

  // ─── 모바일 ───────────────────────────────────────────────────────
  return (
    <div className="moim paper-grain" style={{
      width: '100%', height: '100dvh', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', background: 'var(--paper-50)',
      position: 'relative',
    }}>
      <AppHeader title="마이" left={<IconButton Icon={IBack} onClick={() => navigate(-1)}/>}/>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 96px' }}>
        {profileContent}
      </div>

      <TabBar/>
      {zoomModal}
    </div>
  )
}
