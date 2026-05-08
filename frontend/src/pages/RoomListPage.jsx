import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Avatar, Tag, Section, TabBar, IconButton } from '../components/MoimUI'
import { IChevR, IPlus, ISearch, IHome, ICalendar, IBell, IUser, ISettings, IClock, IDesignHouse, IDesignClock, IDesignBox, IDesignPin } from '../components/Icons'
import { IllusCalendar } from '../components/Illustrations'
import { MonthCalendar } from '../components/Calendar'
import { useNotificationContext } from '../notification/NotificationContext'
import CreateRoomModal from '../components/CreateRoomModal'
import JoinRoomModal from '../components/JoinRoomModal'
import UpdateNicknameModal from '../components/UpdateNicknameModal'
import LoadingSpinner from '../components/LoadingSpinner'
import DesktopLayout from '../components/DesktopLayout'
import { useIsDesktop } from '../hooks/useIsDesktop'
import api from '../api'

const EVENT_COLORS = ['coral', 'mustard', 'sage', 'plum', 'sky', 'rose']
const hashColor = (id) => EVENT_COLORS[Math.abs(id || 0) % EVENT_COLORS.length]
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

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
        color: `var(--tag-${color})`,
      }}>
        <IDesignHouse size={28} color="#fff"/>
      </div>
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
      <div style={{ 
        width: 48, height: 48, borderRadius: 'var(--r-md)', 
        background: 'var(--tag-mustard-bg)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--tag-mustard)'
      }}>
        <IDesignClock size={28} color="inherit"/>
      </div>
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
  const isDesktop = useIsDesktop()
  const isWideDesktop = useIsDesktop(1600)
  const { unreadCount, markAllRead } = useNotificationContext()

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
    }
    fetchData()
    fetchAnnouncements()
  }, [user, location.state])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [roomsRes, pendingRes, rejectedRes, schedsRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/rooms/pending'),
        api.get('/rooms/rejected'),
        api.get('/schedules/upcoming')
      ])
      setRooms(roomsRes.data)
      setPendingRooms(pendingRes.data)
      setRejectedRooms(rejectedRes.data)
      setUpcomingSchedules(schedsRes.data)
    } catch (e) {
      console.error('Fetch data failed', e)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements/active')
      setAnnouncement(res.data[0])
    } catch {}
  }

  const handleRoomCreated = (newRoom) => {
    setShowCreate(false)
    setRooms(prev => [newRoom, ...prev])
    navigate(`/room/${newRoom.roomId}`)
  }

  const handleJoined = () => {
    setShowJoin(false)
    fetchData()
  }

  const handleCancelJoin = async (roomId) => {
    if (!window.confirm('가입 신청을 취소하시겠습니까?')) return
    try {
      await api.delete(`/rooms/${roomId}/join`)
      setPendingRooms(p => p.filter(r => r.roomId !== roomId))
      setRejectedRooms(r => r.filter(x => x.roomId !== roomId))
    } catch {}
  }

  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)
  const todaySchedule = upcomingSchedules.find(s => s.eventDate === todayStr)

  const formatEventDate = (dateStr) => {
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`
  }

  const modals = (
    <>
      {showNicknameModal && (
        <UpdateNicknameModal
          isMandatory={!user?.nicknameSet}
          onClose={() => {
            if (!user?.nicknameSet) return
            setShowNicknameModal(false)
          }}
          onUpdated={async () => {
            await fetchUser()
            setShowNicknameModal(false)
          }}
        />
      )}
      {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} onCreated={handleRoomCreated}/>}
      {showJoin && <JoinRoomModal onClose={() => setShowJoin(false)} onJoined={handleJoined}/>}
    </>
  )

  if (loading) return <LoadingSpinner/>

  if (isDesktop) {
    const dateLabel = `${today.getMonth() + 1}월 ${today.getDate()}일 ${WEEKDAYS[today.getDay()]}요일`
    const thisMonthScheds = upcomingSchedules.filter(s => {
      const d = new Date(s.eventDate)
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
    })
    const totalMembers = rooms.reduce((acc, r) => acc + (r.memberCount || 0), 0)

    const rightRail = (
      <>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>다가오는 일정</h2>
          <button onClick={() => navigate('/calendar')} style={{ fontSize: 12.5, color: 'var(--clay)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>전체 보기</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {upcomingSchedules.filter(s => s.eventDate > todayStr).length > 0 ? (
            upcomingSchedules.filter(s => s.eventDate > todayStr).slice(0, 6).map((s, i) => {
              const color = hashColor(s.id || i)
              const d = new Date(s.eventDate)
              return (
                <div key={s.id} onClick={() => navigate(`/room/${s.roomId}`)} style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
                  <div style={{
                    width: 44, padding: '6px 0', borderRadius: 'var(--r-md)',
                    background: `var(--tag-${color}-bg)`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0,
                  }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: `var(--tag-${color})`, lineHeight: 1 }}>{d.getDate()}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: `var(--tag-${color})`, opacity: 0.8, marginTop: 2 }}>{d.getMonth()+1}월 {WEEKDAYS[d.getDay()]}</div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 500 }}>{s.roomName}</div>
                  </div>
                </div>
              )
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-300)', fontSize: 14, fontWeight: 500 }}>
              다가오는 일정이 없어요
            </div>
          )}
        </div>
      </>
    )

    return (
      <>
        <DesktopLayout rightRail={rightRail}>
          {/* 헤더 */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-500)', fontWeight: 700 }}>{dateLabel}</div>
              <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 6 }}>
                안녕하세요, {user?.nickname}님
              </h1>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button onClick={() => setShowJoin(true)} style={{
                height: 44, padding: '0 20px', borderRadius: 'var(--r-pill)',
                background: 'var(--surface)', border: '1.5px solid var(--paper-300)',
                color: 'var(--ink-700)', fontSize: 14.5, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>참가하기</button>
              <button onClick={() => setShowCreate(true)} style={{
                height: 44, padding: '0 22px', borderRadius: 'var(--r-pill)',
                background: 'var(--clay)', color: '#fff',
                fontSize: 14.5, fontWeight: 700, border: 'none',
                cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <IPlus size={18}/> 모임 만들기
              </button>
            </div>
          </div>

          {/* 히어로 카드 */}
          {todaySchedule ? (
            <div onClick={() => navigate(`/room/${todaySchedule.roomId}`)} style={{
              background: 'linear-gradient(135deg, var(--clay) 0%, #B85838 100%)',
              color: '#fff', borderRadius: 'var(--r-xl)', padding: 36,
              marginBottom: 32, boxShadow: 'var(--shadow-2)',
              display: 'flex', alignItems: 'center', gap: 32,
              cursor: 'pointer', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.85, marginBottom: 8, letterSpacing: '0.02em' }}>오늘의 일정</div>
                <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 10 }}>{todaySchedule.title}</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 14.5, opacity: 0.95, flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IClock size={16}/> {todaySchedule.eventTime || '시간 미정'}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IDesignPin size={16} color="inherit"/> {todaySchedule.roomName}</span>
                  {todaySchedule.location && <span>{todaySchedule.location}</span>}
                </div>
              </div>
              <div style={{ opacity: 0.9, flexShrink: 0 }}><IllusCalendar size={120}/></div>
            </div>
          ) : (
            <div style={{
              background: 'linear-gradient(135deg, var(--clay) 0%, #B85838 100%)',
              color: '#fff', borderRadius: 'var(--r-xl)', padding: 36,
              marginBottom: 32, boxShadow: 'var(--shadow-2)',
              display: 'flex', alignItems: 'center', gap: 32,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.85, marginBottom: 8 }}>오늘 · {formatEventDate(todayStr)}</div>
                <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em', opacity: 0.9 }}>오늘은 일정이 없어요</div>
                <div style={{ fontSize: 14.5, opacity: 0.75, marginTop: 8 }}>새 모임을 만들거나 초대 코드로 참가해 일정을 추가해보세요!</div>
              </div>
              <div style={{ opacity: 0.6, flexShrink: 0 }}><IllusCalendar size={100}/></div>
            </div>
          )}

          {/* 공지사항 */}
          {announcement && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--tag-mustard-bg)', borderRadius: 'var(--r-lg)', padding: '16px 20px', marginBottom: 32 }}>
              <Tag color="mustard" size="sm">공지</Tag>
              <div style={{ fontSize: 14.5, color: 'var(--ink-700)', fontWeight: 600 }}>{announcement.content}</div>
            </div>
          )}

          {/* 통계 카드 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
            {[
              { num: rooms.length, label: '내 모임', c: 'clay', sub: '참여 중인 모임' },
              { num: thisMonthScheds.length, label: '이번 달 일정', c: 'sage', sub: `${today.getMonth() + 1}월 일정` },
              { num: upcomingSchedules.filter(s => s.eventDate > todayStr).length, label: '다가오는 일정', c: 'mustard', sub: '오늘 이후' },
              { num: totalMembers, label: '총 멤버', c: 'sky', sub: '모든 모임 합계' },
            ].map(item => (
              <div key={item.label} style={{ background: 'var(--surface)', border: '1px solid var(--paper-200)', borderRadius: 'var(--r-xl)', padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-500)', marginBottom: 12 }}>{item.label}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: `var(--tag-${item.c})`, marginBottom: 4 }}>{item.num}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-400)', fontWeight: 500 }}>{item.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>내 모임</h2>
          </div>
          
          {rooms.length === 0 && pendingRooms.length === 0 && rejectedRooms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0', background: 'var(--surface)', border: '1.5px dashed var(--paper-300)', borderRadius: 'var(--r-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <IDesignBox size={64} color="var(--paper-300)"/>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>아직 모임이 없어요</div>
              <div style={{ fontSize: 13.5 }}>새 모임을 만들거나 초대 코드로 참가해보세요!</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {rooms.map(r => <GroupCard key={r.roomId} room={r} onClick={() => navigate(`/room/${r.roomId}`)}/>)}
              {pendingRooms.map(r => <PendingCard key={r.roomId} room={r} onCancel={() => handleCancelJoin(r.roomId)}/>)}
              {rejectedRooms.map(r => (
                <div key={r.roomId} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface)', border: '1px solid var(--paper-200)', borderRadius: 'var(--r-lg)', padding: '14px 16px' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 'var(--r-md)', background: '#FDECEA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', fontWeight: 800, fontSize: 20 }}>✕</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 700, marginBottom: 2 }}>{r.roomName}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--danger)', fontWeight: 600 }}>가입이 거절되었습니다</div>
                  </div>
                  <button onClick={() => handleCancelJoin(r.roomId)} style={{ padding: '6px 12px', borderRadius: 'var(--r-pill)', background: 'var(--paper-200)', color: 'var(--ink-700)', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>확인</button>
                </div>
              ))}
            </div>
          )}
        </DesktopLayout>
        {modals}
      </>
    )
  }

  const profileImgSrc = user?.profileImage
    ? (user.profileImage.startsWith('http') ? user.profileImage : `${import.meta.env.VITE_API_URL}${user.profileImage}`)
    : null

  // ─── 모바일 레이아웃 ──────────────────────────────────────────────
  return (
    <div className="moim paper-grain" style={{
      width: '100%', height: '100dvh', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', background: 'var(--paper-50)',
      position: 'relative',
    }}>
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

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px 96px' }}>
        {todaySchedule ? (
          <div style={{
            background: 'linear-gradient(135deg, var(--clay) 0%, #B85838 100%)',
            color: '#fff', borderRadius: 'var(--r-xl)', padding: 20,
            marginBottom: 20, boxShadow: 'var(--shadow-2)',
            position: 'relative', overflow: 'hidden', cursor: 'pointer',
          }} onClick={() => navigate(`/room/${todaySchedule.roomId}`)}>
            <div style={{ position: 'absolute', right: -10, top: -10, opacity: 0.2 }}>
              <IllusCalendar size={120}/>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.85, marginBottom: 4 }}>
              오늘 · {formatEventDate(todayStr)}
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
              오늘 · {today.getMonth()+1}월 {today.getDate()}일 ({WEEKDAYS[today.getDay()]})
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', opacity: 0.85 }}>오늘은 일정이 없어요</div>
            <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>새 일정을 추가해보세요</div>
          </div>
        )}

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

        <Section
          title={`내 모임 ${rooms.length}`}
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
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <IDesignBox size={64} color="var(--paper-300)"/>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>아직 모임이 없어요</div>
              <div style={{ fontSize: 13.5 }}>새 모임을 만들거나 초대 코드로 참가해보세요!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rooms.map(r => <GroupCard key={r.roomId} room={r} onClick={() => navigate(`/room/${r.roomId}`)}/>)}
              {pendingRooms.map(r => <PendingCard key={r.roomId} room={r} onCancel={() => handleCancelJoin(r.roomId)}/>)}
              {rejectedRooms.map(r => (
                <div key={r.roomId} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface)', border: '1px solid var(--paper-200)', borderRadius: 'var(--r-lg)', padding: '14px 16px' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 'var(--r-md)', background: '#FDECEA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', fontWeight: 800, fontSize: 20 }}>✕</div>
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

        {upcomingSchedules.length > 0 && (
          <Section title="다가오는 일정">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcomingSchedules.filter(s => s.eventDate > todayStr).slice(0, 4).map((s, i) => {
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
                      <div style={{ fontSize: 10, color: `var(--tag-${color})`, fontWeight: 700, opacity: 0.8 }}>{d.getMonth()+1}월 {WEEKDAYS[d.getDay()]}</div>
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
      {modals}
    </div>
  )
}
