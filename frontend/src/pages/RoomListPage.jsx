import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Users, Home, ChevronRight, Clock, XCircle, Bell } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { useNotificationContext } from '../notification/NotificationContext'
import CreateRoomModal from '../components/CreateRoomModal'
import JoinRoomModal from '../components/JoinRoomModal'
import UpdateNicknameModal from '../components/UpdateNicknameModal'
import api from '../api'
import './RoomListPage.css'

export default function RoomListPage() {
  const { user, logout, fetchUser } = useAuth()
  const { notifications, unreadCount, markAllRead, clearAll } = useNotificationContext()
  const navigate = useNavigate()
  const location = useLocation()

  const [rooms, setRooms] = useState([])
  const [pendingRooms, setPendingRooms] = useState([])
  const [rejectedRooms, setRejectedRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [showNicknameModal, setShowNicknameModal] = useState(false)
  const [showNotifPanel, setShowNotifPanel] = useState(false)
  const [announcement, setAnnouncement] = useState(null)

  const formatNotifTime = (date) => {
    const diff = Date.now() - new Date(date).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return '방금 전'
    if (m < 60) return `${m}분 전`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}시간 전`
    return new Date(date).toLocaleDateString('ko-KR')
  }

  useEffect(() => {
    if (location.state?.showNicknameModal || (user && !user.nicknameSet)) {
      setShowNicknameModal(true)
      window.history.replaceState({}, document.title)
    }
    fetchRooms()
  }, [user?.nicknameSet])

  const fetchRooms = async () => {
    try {
      const [roomsRes, noticeRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/announcements/active').catch(() => null),
      ])
      const res = roomsRes
      setAnnouncement(noticeRes?.data ?? null)
      const approved = res.data.filter(r => r.status === 'APPROVED')
      const pending = res.data.filter(r => r.status === 'PENDING')
      const rejected = res.data.filter(r => r.status === 'REJECTED')

      setRooms(approved)
      setPendingRooms(pending)
      setRejectedRooms(rejected)
    } catch {
      // 에러 시 빈 목록 표시
    } finally {
      setLoading(false)
    }
  }

  const handleRoomCreated = (room) => {
    setShowCreate(false)
    navigate(`/room/${room.id}`)
  }

  const handleJoined = () => {
    setShowJoin(false)
    fetchRooms()
  }

  const handleCancelJoin = async (roomId) => {
    try {
      await api.delete(`/rooms/${roomId}/members/me`)
      fetchRooms()
    } catch {
      alert('취소에 실패했습니다.')
    }
  }

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?'

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
      </div>
    )
  }

  const isEmpty = rooms.length === 0 && pendingRooms.length === 0 && rejectedRooms.length === 0

  return (
    <div className="room-list-page">
      {/* 유저 프로필 */}
      <div className="user-profile">
        <div className="user-avatar" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          {user?.profileImage ? (
            <img
              src={user.profileImage.startsWith('http') ? user.profileImage : `${import.meta.env.VITE_API_URL}${user.profileImage}`}
              alt=""
            />
          ) : (
            getInitial(user?.nickname)
          )}
        </div>
        <div className="user-greeting">
          <div className="user-greeting-row">
            <span className="user-greeting-name">{user?.nickname}</span>
            {user?.role === 'ADMIN' && (
              <span className="user-admin-badge" onClick={() => navigate('/admin')}>ADMIN</span>
            )}
          </div>
          <span className="user-greeting-sub">님, 안녕하세요!</span>
        </div>
        <div className="user-actions">
          <button className="user-action-btn" onClick={() => navigate('/profile')}>정보 수정</button>
          <span className="user-actions-divider">|</span>
          <button className="user-action-btn" onClick={() => navigate('/settings')}>설정</button>
          <span className="user-actions-divider">|</span>
          <button className="user-action-btn" onClick={logout}>로그아웃</button>
        </div>
      </div>

      {/* 공지사항 배너 */}
      {announcement && (
        <div className="notice-banner">
          <span className="notice-banner-label">공지</span>
          <div className="notice-ticker-wrap">
            <div
              className="notice-ticker-track"
              style={{ animationDuration: `${Math.max(8, announcement.content.length * 0.25)}s` }}
            >
              <span className="notice-ticker-text">{announcement.content}</span>
              <span className="notice-ticker-text" aria-hidden="true">{announcement.content}</span>
            </div>
          </div>
        </div>
      )}

      {/* 관리자 전용 배너 */}
      {user?.role === 'ADMIN' && (
        <button className="admin-banner" onClick={() => navigate('/admin')}>
          <span className="admin-banner-label">관리자 대시보드</span>
          <ChevronRight size={18} />
        </button>
      )}

      {/* 헤더 */}
      <div className="room-list-header">
        <h1 className="room-list-title">내 모임</h1>
        <div className="room-list-actions">
          <button
            className="notif-bell-btn"
            onClick={() => { setShowNotifPanel(true); markAllRead() }}
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="notif-bell-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </button>
          <button className="btn btn-secondary" onClick={() => setShowJoin(true)}>
            참가하기
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + 만들기
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Users size={48} strokeWidth={1.5} color="var(--color-primary)" />
          </div>
          <h2 className="empty-state-title">아직 모임이 없어요</h2>
          <p className="empty-state-desc">
            새 모임을 만들거나,<br />초대 코드로 참가해보세요!
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
            <button className="btn btn-secondary" onClick={() => setShowJoin(true)}>
              초대 코드 입력
            </button>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              모임 만들기
            </button>
          </div>
        </div>
      ) : (
        <div className="room-list">
          {/* 승인된 모임 */}
          {rooms.map((room) => (
            <div
              key={room.roomId}
              className="room-card"
              onClick={() => navigate(`/room/${room.roomId}`)}
            >
              <div className="room-card-icon">
                <Home size={24} color="var(--color-primary)" />
              </div>
              <div className="room-card-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="room-card-name">{room.roomName}</div>
                  {room.pendingCount > 0 && (
                    <span className="room-card-pending-count">{room.pendingCount}명 대기</span>
                  )}
                </div>
                <div className="room-card-meta">멤버 {room.memberCount || 0}명</div>
              </div>
              <div className="room-card-arrow">
                <ChevronRight size={24} color="var(--color-text-tertiary)" />
              </div>
            </div>
          ))}

          {/* 승인 대기 중인 모임 */}
          {pendingRooms.map((room) => (
            <div key={room.roomId} className="room-card room-card-pending">
              <div className="room-card-icon">
                <Clock size={24} color="var(--color-secondary)" />
              </div>
              <div className="room-card-info">
                <div className="room-card-name">{room.roomName}</div>
                <div className="room-card-meta room-card-pending-badge">
                  승인 대기 중
                </div>
              </div>
              <button className="room-card-status-btn" onClick={() => handleCancelJoin(room.roomId)}>
                취소
              </button>
            </div>
          ))}

          {/* 거절된 모임 */}
          {rejectedRooms.map((room) => (
            <div key={room.roomId} className="room-card room-card-rejected">
              <div className="room-card-icon">
                <XCircle size={24} color="var(--color-danger)" />
              </div>
              <div className="room-card-info">
                <div className="room-card-name">{room.roomName}</div>
                <div className="room-card-meta room-card-rejected-badge">
                  가입이 거절되었습니다
                </div>
              </div>
              <button className="room-card-status-btn room-card-status-btn-danger" onClick={() => handleCancelJoin(room.roomId)}>
                확인
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 알림 패널 */}
      {showNotifPanel && (
        <div className="modal-overlay" onClick={() => setShowNotifPanel(false)}>
          <div className="modal-content notif-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="notif-panel-header">
              <span>알림</span>
              {notifications.length > 0 && (
                <button className="notif-panel-clear" onClick={clearAll}>전체 삭제</button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="notif-panel-empty">새로운 알림이 없어요</div>
            ) : (
              <div className="notif-panel-list">
                {notifications.map(n => (
                  <div key={n.id} className="notif-panel-item">
                    <div className="notif-panel-item-title">{n.title}</div>
                    {n.body && <div className="notif-panel-item-body">{n.body}</div>}
                    <div className="notif-panel-item-time">{formatNotifTime(n.time)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 모달들 */}
      {showNicknameModal && (
        <UpdateNicknameModal
          isMandatory={!user?.nicknameSet}
          onClose={() => {
            if (!user?.nicknameSet) return
            setShowNicknameModal(false)
            if (rooms.length === 1) {
              navigate(`/room/${rooms[0].roomId}`, { replace: true })
            }
          }}
          onUpdated={async () => {
            await fetchUser()
            setShowNicknameModal(false)
            if (rooms.length === 1) {
              navigate(`/room/${rooms[0].roomId}`, { replace: true })
            }
          }}
        />
      )}
      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onCreated={handleRoomCreated}
        />
      )}
      {showJoin && (
        <JoinRoomModal
          onClose={() => setShowJoin(false)}
          onJoined={handleJoined}
        />
      )}
    </div>
  )
}
