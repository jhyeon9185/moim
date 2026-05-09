import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useNotificationContext } from '../notification/NotificationContext'
import { useIsDesktop } from '../hooks/useIsDesktop'
import { Avatar } from './MoimUI'
import { IHome, ICalendar, IBell, IUser, ISettings, IPlus } from './Icons'
import CreateRoomModal from './CreateRoomModal'
import api from '../api'

const EVENT_COLORS = ['coral', 'mustard', 'sage', 'plum', 'sky', 'rose']
const hashColor = id => EVENT_COLORS[Math.abs(id || 0) % EVENT_COLORS.length]

function Sidebar({ rooms, onCreateRoom }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const { unreadCount } = useNotificationContext()

  const profileImgSrc = user?.profileImage
    ? (user.profileImage.startsWith('http') ? user.profileImage : `${import.meta.env.VITE_API_URL}${user.profileImage}`)
    : null

  const NAV = [
    { path: '/', label: '홈', Icon: IHome },
    { path: '/calendar', label: '전체 캘린더', Icon: ICalendar },
    { path: '/notifications', label: '알림', Icon: IBell, dot: unreadCount > 0 },
    { path: '/profile', label: '마이페이지', Icon: IUser },
  ]

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      logout()
      navigate('/login')
    }
  }

  return (
    <aside style={{
      background: 'var(--surface)', borderRight: '1px solid var(--paper-200)',
      padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto',
    }}>
      <div onClick={() => navigate('/')} style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 8px 22px', cursor: 'pointer',
      }}>
        <img src="/moim_main.png" alt="MOIM" style={{ width: 42, height: 42, borderRadius: 'var(--r-sm)', objectFit: 'cover', flexShrink: 0 }}/>
        <div>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.025em' }}>모임</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-500)', fontWeight: 600 }}>지인과 모이는 시간</div>
        </div>
      </div>

      {NAV.map(({ path, label, Icon, dot }) => {
        const active = pathname === path
        return (
          <button key={path} onClick={() => navigate(path)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', borderRadius: 'var(--r-md)',
            background: active ? 'var(--clay-100)' : 'transparent',
            color: active ? 'var(--clay)' : 'var(--ink-700)',
            fontSize: 14.5, fontWeight: active ? 700 : 600,
            border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
          }}>
            <Icon size={20}/>
            <span style={{ flex: 1 }}>{label}</span>
            {dot && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--clay)', flexShrink: 0 }}/>}
          </button>
        )
      })}

      <div style={{ height: 1, background: 'var(--paper-200)', margin: '14px 4px' }}/>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 14px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-500)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>내 모임</div>
        <button onClick={onCreateRoom} style={{
          display: 'flex', alignItems: 'center', gap: 3,
          padding: '3px 8px', borderRadius: 'var(--r-pill)',
          background: 'var(--clay-100)', color: 'var(--clay)',
          fontSize: 11.5, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        }}><IPlus size={11}/> 새 모임</button>
      </div>

      {rooms.map(r => {
        const c = hashColor(r.roomId)
        return (
          <button key={r.roomId} onClick={() => navigate(`/room/${r.roomId}`)} style={{
            display: 'flex', alignItems: 'center', gap: 11,
            padding: '9px 14px', borderRadius: 'var(--r-md)',
            color: 'var(--ink-700)', fontSize: 13.5, fontWeight: 600,
            textAlign: 'left', background: 'transparent',
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <span style={{
              width: 30, height: 30, borderRadius: 'var(--r-sm)',
              background: `var(--tag-${c}-bg)`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <IHome size={15} color={`var(--tag-${c})`}/>
            </span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.roomName}</span>
            {r.pendingCount > 0 && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--tag-mustard)', flexShrink: 0 }}/>}
          </button>
        )
      })}

      {rooms.length === 0 && (
        <div style={{ padding: '4px 14px', fontSize: 12.5, color: 'var(--ink-300)', fontWeight: 500 }}>모임이 없어요</div>
      )}

      <div style={{ flex: 1 }}/>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{
          background: 'var(--paper-100)', padding: '12px 14px', borderRadius: 'var(--r-md)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Avatar name={user?.nickname || '?'} src={profileImgSrc} size={38} color="var(--wood)"/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.nickname}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
          </div>
          <button onClick={() => navigate('/profile')} style={{ color: 'var(--ink-500)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
            <ISettings size={18}/>
          </button>
        </div>
        {user?.role === 'ADMIN' && (
          <button onClick={() => navigate('/admin')} style={{
            width: '100%', height: 38, borderRadius: 'var(--r-md)',
            background: 'var(--tag-plum-bg)', color: 'var(--tag-plum)',
            fontSize: 13, fontWeight: 700, border: 'none',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>관리자 대시보드</button>
        )}
        <button onClick={handleLogout} style={{
          width: '100%', height: 38, borderRadius: 'var(--r-md)',
          background: 'transparent', color: 'var(--ink-400)',
          fontSize: 13, fontWeight: 600, border: '1px solid var(--paper-200)',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>로그아웃</button>
      </div>
    </aside>
  )
}

export default function DesktopLayout({ children, rightRail, mainPadding = '36px 40px 56px' }) {
  const [rooms, setRooms] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const navigate = useNavigate()
  const isWide = useIsDesktop(1280)

  const loadRooms = () => {
    api.get('/rooms').then(res => {
      setRooms((res.data || []).filter(r => r.status === 'APPROVED'))
    }).catch(() => {})
  }

  useEffect(() => { loadRooms() }, [])

  const showRail = rightRail && isWide

  return (
    <div className="moim paper-grain" style={{
      width: '100%', height: '100dvh', overflow: 'hidden',
      display: 'grid',
      gridTemplateColumns: showRail ? '240px 1fr 360px' : '240px 1fr',
      background: 'var(--paper-50)',
    }}>
      <Sidebar rooms={rooms} onCreateRoom={() => setShowCreate(true)}/>
      <main style={{ overflow: 'auto', padding: mainPadding, minWidth: 0 }}>
        {children}
      </main>
      {showRail && (
        <aside style={{
          borderLeft: '1px solid var(--paper-200)',
          background: 'var(--surface)',
          padding: '36px 26px', overflowY: 'auto',
        }}>
          {rightRail}
        </aside>
      )}
      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onCreated={(newRoom) => {
            setShowCreate(false)
            loadRooms()
            navigate(`/room/${newRoom.id}`)
          }}
        />
      )}
    </div>
  )
}
