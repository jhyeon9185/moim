import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Avatar, Tag, Section, TabBar, IconButton } from '../components/MoimUI'
import { IChevR, IPlus, ISearch } from '../components/Icons'
import { IllusCalendar } from '../components/Illustrations'
import CreateRoomModal from '../components/CreateRoomModal'
import JoinRoomModal from '../components/JoinRoomModal'
import UpdateNicknameModal from '../components/UpdateNicknameModal'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../api'

const EVENT_COLORS = ['coral', 'mustard', 'sage', 'plum', 'sky', 'rose']
const hashColor = (id) => EVENT_COLORS[Math.abs(id || 0) % EVENT_COLORS.length]

function GroupCard({ room, onClick }) {
  const color = hashColor(room.roomId)
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: 'var(--surface)', border: '1px solid var(--paper-200)',
      borderRadius: 'var(--r-lg)', padding: '14px 16px', boxShadow: 'var(--shadow-1)',
      cursor: 'pointer',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 'var(--r-md)',
        background: `var(--tag-${color}-bg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, color: `var(--tag-${color})`,
      }}>🏠</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-0.015em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.roomName}</div>
          {room.pendingCount > 0 && (
            <span style={{ background: 'var(--tag-mustard-bg)', color: 'var(--tag-mustard)', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 'var(--r-pill)' }}>
              {room.pendingCount}명 대기
            </span>
          )}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-500)', fontWeight: 500 }}>멤버 {room.memberCount || 0}명</div>
      </div>
      <div style={{ color: 'var(--ink-300)' }}><IChevR size={20}/></div>
    </div>
  )
}

function PendingCard({ room, onCancel }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: 'var(--surface)', border: '1px solid var(--paper-200)',
      borderRadius: 'var(--r-lg)', padding: '14px 16px', boxShadow: 'var(--shadow-1)',
    }}>
      <div style={{ width: 48, height: 48, borderRadius: 'var(--r-md)', background: 'var(--tag-mustard-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⏳</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-0.015em', marginBottom: 2 }}>{room.roomName}</div>
        <div style={{ fontSize: 12.5, color: 'var(--tag-mustard)', fontWeight: 600 }}>승인 대기 중</div>
      </div>
      <button onClick={onCancel} style={{
        padding: '6px 12px', borderRadius: 'var(--r-pill)',
        background: 'var(--paper-200)', color: 'var(--ink-700)',
        fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
      }}>취소</button>
    </div>
  )
}

export default function RoomListPage() {
  const { user, fetchUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [rooms, setRooms] = useState([])
  const [pendingRooms, setPendingRooms] = useState([])
  const [rejectedRooms, setRejectedRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [showNicknameModal, setShowNicknameModal] = useState(false)
  const [announcement, setAnnouncement] = useState(null)
  const [upcomingSchedules, setUpcomingSchedules] = useState([])

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
      setAnnouncement(noticeRes?.data ?? null)
      const approved = roomsRes.data.filter(r => r.status === 'APPROVED')
      const pending = roomsRes.data.filter(r => r.status === 'PENDING')
      const rejected = roomsRes.data.filter(r => r.status === 'REJECTED')
      setRooms(approved)
      setPendingRooms(pending)
      setRejectedRooms(rejected)

      // Fetch upcoming schedules from all approved rooms
      if (approved.length > 0) {
        const today = new Date().toISOString().slice(0, 10)
        const schedResults = await Promise.all(
          approved.map(r => api.get(`/rooms/${r.roomId}/schedules`).catch(() => ({ data: [] })))
        )
        const all = schedResults.flatMap((res, i) =>
          (res.data || []).map(s => ({ ...s, roomName: approved[i].roomName, roomId: approved[i].roomId }))
        )
        const upcoming = all
          .filter(s => s.eventDate >= today)
          .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
          .slice(0, 5)
        setUpcomingSchedules(upcoming)
      }
    } catch {
      // silently ignore
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

  const today = new Date()
  const todaySchedule = upcomingSchedules.find(s => s.eventDate === today.toISOString().slice(0, 10))

  if (loading) {
    return <div className="loading-page"><LoadingSpinner /></div>
  }

  const profileImgSrc = user?.profileImage
    ? (user.profileImage.startsWith('http') ? user.profileImage : `${import.meta.env.VITE_API_URL}${user.profileImage}`)
    : null

  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  const formatEventDate = (dateStr) => {
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}월 ${d.getDate()}일 (${weekdays[d.getDay()]})`
  }

  return (
    <div className="moim paper-grain" style={{
      width: '100%', height: '100dvh', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', background: 'var(--paper-50)',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
            <Avatar name={user?.nickname || '?'} src={profileImgSrc} size={44} color="var(--wood)" ring/>
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--ink-500)', fontWeight: 600 }}>안녕하세요</div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 6 }}>
              {user?.nickname}님
              {user?.role === 'ADMIN' && (
                <Tag color="clay" size="sm" onClick={() => navigate('/admin')} style={{ cursor: 'pointer' }}>ADMIN</Tag>
              )}
            </div>
          </div>
        </div>
        <IconButton Icon={ISearch} iconSize={22}/>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px 96px' }}>

        {/* Today hero card */}
        {todaySchedule ? (
          <div style={{
            background: 'linear-gradient(135deg, var(--clay) 0%, #B85838 100%)',
            color: '#fff', borderRadius: 'var(--r-xl)', padding: 20,
            marginBottom: 20, boxShadow: 'var(--shadow-2)',
            position: 'relative', overflow: 'hidden',
            cursor: 'pointer',
          }} onClick={() => navigate(`/room/${todaySchedule.roomId}`)}>
            <div style={{ position: 'absolute', right: -10, top: -10, opacity: 0.2 }}>
              <IllusCalendar size={120}/>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.85, marginBottom: 4 }}>
              오늘 · {formatEventDate(todaySchedule.eventDate)}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>{todaySchedule.title}</div>
            <div style={{ fontSize: 13.5, opacity: 0.9 }}>
              {todaySchedule.roomName}{todaySchedule.eventTime ? ` · ${todaySchedule.eventTime}` : ''}{todaySchedule.location ? ` · ${todaySchedule.location}` : ''}
            </div>
          </div>
        ) : (
          <div style={{
            background: 'linear-gradient(135deg, var(--clay) 0%, #B85838 100%)',
            color: '#fff', borderRadius: 'var(--r-xl)', padding: 20,
            marginBottom: 20, boxShadow: 'var(--shadow-2)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', right: -10, top: -10, opacity: 0.2 }}>
              <IllusCalendar size={120}/>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.85, marginBottom: 4 }}>
              오늘 · {today.getMonth()+1}월 {today.getDate()}일 ({weekdays[today.getDay()]})
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', opacity: 0.85 }}>오늘은 일정이 없어요</div>
            <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>새 일정을 추가해보세요</div>
          </div>
        )}

        {/* Announcement */}
        {announcement && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--tag-mustard-bg)',
            borderRadius: 'var(--r-md)', padding: '12px 14px', marginBottom: 20,
          }}>
            <Tag color="mustard" size="sm">공지</Tag>
            <div style={{ fontSize: 13, color: 'var(--ink-700)', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {announcement.content}
            </div>
          </div>
        )}

        {/* Admin banner */}
        {user?.role === 'ADMIN' && (
          <div onClick={() => navigate('/admin')} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--tag-plum-bg)', borderRadius: 'var(--r-md)',
            padding: '12px 14px', marginBottom: 20, cursor: 'pointer',
          }}>
            <Tag color="plum" size="sm">관리자</Tag>
            <span style={{ fontSize: 13, color: 'var(--ink-700)', fontWeight: 600, flex: 1 }}>관리자 대시보드</span>
            <IChevR size={16} color="var(--ink-500)"/>
          </div>
        )}

        {/* Rooms section */}
        <Section
          title={`내 MOIM ${rooms.length}`}
          action={
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setShowJoin(true)} style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-700)', padding: '4px 8px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>참가하기</button>
              <button onClick={() => setShowCreate(true)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                fontSize: 13, fontWeight: 700, color: 'var(--clay)',
                background: 'var(--clay-100)',
                padding: '6px 10px', borderRadius: 'var(--r-pill)',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <IPlus size={14}/> 만들기
              </button>
            </div>
          }
        >
          {rooms.length === 0 && pendingRooms.length === 0 && rejectedRooms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ink-500)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>아직 MOIM이 없어요</div>
              <div style={{ fontSize: 13.5 }}>새 MOIM을 만들거나 초대 코드로 참가해보세요!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rooms.map(r => <GroupCard key={r.roomId} room={r} onClick={() => navigate(`/room/${r.roomId}`)}/>)}
              {pendingRooms.map(r => <PendingCard key={r.roomId} room={r} onCancel={() => handleCancelJoin(r.roomId)}/>)}
              {rejectedRooms.map(r => (
                <div key={r.roomId} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface)', border: '1px solid var(--paper-200)', borderRadius: 'var(--r-lg)', padding: '14px 16px' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 'var(--r-md)', background: '#FDECEA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>✗</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 700, marginBottom: 2 }}>{r.roomName}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--danger)', fontWeight: 600 }}>가입이 거절되었습니다</div>
                  </div>
                  <button onClick={() => handleCancelJoin(r.roomId)} style={{ padding: '6px 12px', borderRadius: 'var(--r-pill)', background: 'var(--paper-200)', color: 'var(--ink-700)', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>확인</button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Upcoming schedules */}
        {upcomingSchedules.length > 0 && (
          <Section title="다가오는 일정">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcomingSchedules.filter(s => s.eventDate > today.toISOString().slice(0, 10)).slice(0, 4).map((s, i) => {
                const color = hashColor(s.id || i)
                const d = new Date(s.eventDate)
                return (
                  <div key={s.id} onClick={() => navigate(`/room/${s.roomId}`)} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: 'var(--surface)', border: '1px solid var(--paper-200)',
                    borderRadius: 'var(--r-md)', padding: '12px 14px', cursor: 'pointer',
                  }}>
                    <div style={{
                      width: 48, padding: '8px 0', borderRadius: 'var(--r-sm)',
                      background: `var(--tag-${color}-bg)`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0,
                    }}>
                      <div style={{ fontSize: 19, fontWeight: 800, color: `var(--tag-${color})`, lineHeight: 1, letterSpacing: '-0.02em' }}>{d.getDate()}</div>
                      <div style={{ fontSize: 10, color: `var(--tag-${color})`, fontWeight: 700, opacity: 0.8 }}>{d.getMonth()+1}월 {weekdays[d.getDay()]}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.015em', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 500 }}>{s.roomName}{s.eventTime ? ` · ${s.eventTime}` : ''}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>
        )}
      </div>

      <TabBar/>

      {showNicknameModal && (
        <UpdateNicknameModal
          isMandatory={!user?.nicknameSet}
          onClose={() => {
            if (!user?.nicknameSet) return
            setShowNicknameModal(false)
            if (rooms.length === 1) navigate(`/room/${rooms[0].roomId}`, { replace: true })
          }}
          onUpdated={async () => {
            await fetchUser()
            setShowNicknameModal(false)
            if (rooms.length === 1) navigate(`/room/${rooms[0].roomId}`, { replace: true })
          }}
        />
      )}
      {showCreate && (
        <CreateRoomModal onClose={() => setShowCreate(false)} onCreated={handleRoomCreated}/>
      )}
      {showJoin && (
        <JoinRoomModal onClose={() => setShowJoin(false)} onJoined={handleJoined}/>
      )}
    </div>
  )
}
