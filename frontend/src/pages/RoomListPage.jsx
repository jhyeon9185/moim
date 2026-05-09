import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Avatar, Tag, Section, TabBar, IconButton } from '../components/MoimUI'
import { IChevR, IPlus, ISearch, IHome, ICalendar, IBell, IUser, ISettings, IClock, IDesignHouse, IDesignClock, IDesignBox, IDesignPin, IUsers } from '../components/Icons'
import { IllusCalendar } from '../components/Illustrations'
import { MonthCalendar } from '../components/Calendar'
import { useNotificationContext } from '../notification/NotificationContext'
import CreateRoomModal from '../components/CreateRoomModal'
import CreateScheduleModal from '../components/CreateScheduleModal'
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
  const members = room.members || [
    { name: '김', color: 'var(--tag-coral)' },
    { name: '이', color: 'var(--tag-mustard)' },
    { name: '박', color: 'var(--tag-sage)' },
    { name: '최', color: 'var(--tag-plum)' }
  ]
  
  return (
    <div onClick={onClick} style={{
      background: 'var(--surface)', border: '1px solid var(--paper-200)',
      borderRadius: 'var(--r-xl)', padding: 24, boxShadow: 'var(--shadow-1)',
      cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative',
      display: 'flex', flexDirection: 'column', gap: 16
    }} className="group-card-hover">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 'var(--r-lg)',
          background: `var(--tag-${color}-bg)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: `var(--tag-${color})`,
        }}>
          <IDesignHouse size={32} color="#fff"/>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {members.slice(0, 4).map((m, i) => (
            <div key={i} style={{
              width: 24, height: 24, borderRadius: '50%',
              background: m.color || 'var(--paper-300)',
              border: '2px solid var(--surface)',
              marginLeft: i === 0 ? 0 : -8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, color: '#fff'
            }}>{m.name?.[0]}</div>
          ))}
          {room.memberCount > 4 && (
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'var(--paper-100)', border: '2px solid var(--surface)',
              marginLeft: -8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, color: 'var(--ink-500)'
            }}>+{room.memberCount - 4}</div>
          )}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 2 }}>{room.roomName}</div>
        <div style={{ fontSize: 13, color: 'var(--ink-500)', fontWeight: 500 }}>멤버 {room.memberCount || 0}명</div>
      </div>

      <div style={{ 
        background: 'var(--surface-sunken)', borderRadius: 'var(--r-pill)',
        padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 12.5, color: 'var(--ink-700)', fontWeight: 600
      }}>
        <IClock size={14} color="var(--ink-500)"/>
        <span>{room.nextSchedule || '5월 12일 어버이날 식사'}</span>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, Icon, color }) {
  return (
    <div style={{ 
      background: 'var(--surface)', border: '1px solid var(--paper-200)', 
      borderRadius: 'var(--r-xl)', padding: 20, 
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' 
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-500)', marginBottom: 8 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--ink-900)', marginBottom: 4 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-400)', fontWeight: 500 }}>{sub || '\u00A0'}</div>
      </div>
      <div style={{ 
        width: 44, height: 44, borderRadius: 'var(--r-md)', 
        background: `var(--tag-${color}-bg)`, 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        color: `var(--tag-${color})` 
      }}>
        <Icon size={24} />
      </div>
    </div>
  )
}

function RecentActivity() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/activities/recent')
      .then(res => setActivities(res.data || []))
      .catch(() => setActivities([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--paper-200)', borderRadius: 'var(--r-xl)', overflow: 'hidden', height: '100%' }}>
      <div style={{ padding: '20px 20px 10px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800 }}>최근 활동</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--ink-400)', fontSize: 13, fontWeight: 500 }}>
            불러오는 중...
          </div>
        ) : activities.length === 0 ? (
          <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--ink-400)', fontSize: 13, fontWeight: 500 }}>
            최근 활동 내역이 없습니다.
          </div>
        ) : (
          activities.map((act, idx) => (
            <div key={act.id} style={{ 
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
              borderTop: idx === 0 ? 'none' : '1px solid var(--paper-100)'
            }}>
              <div style={{ 
                width: 32, height: 32, borderRadius: '50%', 
                background: `var(--tag-${act.color || 'mustard'}-bg)`, color: `var(--tag-${act.color || 'mustard'})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800
              }}>{act.user?.[0] || '?'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-800)', lineHeight: 1.4 }}>
                  <strong style={{ fontWeight: 800 }}>{act.user}</strong>님이 {act.action}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-400)', fontWeight: 500, marginTop: 2 }}>{act.time}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function PendingCard({ room, onCancel }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: 'var(--surface)', border: '1px solid var(--paper-200)',
      borderRadius: 'var(--r-xl)', padding: 24, boxShadow: 'var(--shadow-1)',
    }}>
      <div style={{ 
        width: 56, height: 56, borderRadius: 'var(--r-lg)', 
        background: 'var(--tag-mustard-bg)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--tag-mustard)'
      }}>
        <IDesignClock size={32} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 2 }}>{room.roomName}</div>
        <div style={{ fontSize: 13, color: 'var(--tag-mustard)', fontWeight: 600 }}>승인 대기 중</div>
      </div>
      <button onClick={onCancel} style={{
        padding: '8px 16px', borderRadius: 'var(--r-pill)',
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
  const [showAddSchedule, setShowAddSchedule] = useState(false)
  const [scheduleDefaultDate, setScheduleDefaultDate] = useState('')
  const [showNicknameModal, setShowNicknameModal] = useState(false)
  const [announcement, setAnnouncement] = useState(null)
  const [upcomingSchedules, setUpcomingSchedules] = useState([])
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (location.state?.showNicknameModal || (user && !user.nicknameSet)) {
      setShowNicknameModal(true)
    }
    fetchData()
    fetchAnnouncements()
    fetchStats()
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

  const fetchStats = async () => {
    try {
      const res = await api.get('/users/stats')
      setStats(res.data)
    } catch {
      setStats(null)
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
    fetchData()
    navigate(`/room/${newRoom.id}`)
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
      {showAddSchedule && (
        <CreateScheduleModal
          availableRooms={rooms}
          defaultDate={scheduleDefaultDate}
          onClose={() => setShowAddSchedule(false)}
          onCreated={() => {
            setShowAddSchedule(false)
            loadData()
          }}
        />
      )}
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
    const upcomingList = upcomingSchedules.filter(s => s.eventDate > todayStr).slice(0, 8)

    const rightRail = (
      <>
        <div style={{ marginBottom: 32 }}>
          <MonthCalendar 
            year={today.getFullYear()} month={today.getMonth() + 1} 
            today={{ d: today.getDate(), m: today.getMonth() + 1, y: today.getFullYear() }} 
            onSelect={({y,m,d}) => {
              setScheduleDefaultDate(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`)
              setShowAddSchedule(true)
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink-700)' }}>다가오는 일정</h2>
          <button onClick={() => navigate('/calendar')} style={{ fontSize: 12.5, color: 'var(--clay)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>전체 보기</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {upcomingList.length > 0 ? (
            upcomingList.map((s, i) => {
              const color = hashColor(s.id || i)
              const d = new Date(s.eventDate)
              return (
                <div key={s.id} onClick={() => navigate(`/room/${s.roomId}`)} style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 'var(--r-lg)',
                    background: `var(--tag-${color}-bg)`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: `var(--tag-${color})`, lineHeight: 1 }}>{d.getDate()}</div>
                    <div style={{ fontSize: 9, fontWeight: 800, color: `var(--tag-${color})`, opacity: 0.7 }}>{WEEKDAYS[d.getDay()]}</div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--ink-900)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 600 }}>{s.roomName} · {s.eventTime || '19:30'}</div>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, color: 'var(--ink-500)', fontWeight: 700 }}>{dateLabel}</div>
              <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em', marginTop: 4 }}>
                안녕하세요, {user?.nickname}님
              </h1>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button onClick={() => { setScheduleDefaultDate(''); setShowAddSchedule(true) }} style={{
                height: 48, padding: '0 24px', borderRadius: 'var(--r-pill)',
                background: 'var(--clay)', color: '#fff',
                fontSize: 15, fontWeight: 800, border: 'none',
                cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 4px 12px rgba(200, 105, 74, 0.25)'
              }}>
                <IPlus size={20}/> 일정 추가
              </button>
            </div>
          </div>

          {/* 히어로 카드 */}
          {todaySchedule ? (
            <div onClick={() => navigate(`/room/${todaySchedule.roomId}`)} style={{
              background: 'linear-gradient(135deg, var(--clay) 0%, #B85838 100%)',
              color: '#fff', borderRadius: 'var(--r-xl)', padding: '28px 36px',
              marginBottom: 20, boxShadow: 'var(--shadow-lg)',
              display: 'flex', alignItems: 'center', gap: 32,
              cursor: 'pointer', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 'var(--r-pill)', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>오늘의 일정 · 1건</div>
                <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 8 }}>{todaySchedule.title}</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 13.5, fontWeight: 600, opacity: 0.9 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IClock size={16}/> 오후 {todaySchedule.eventTime || '2:00 — 4:00'}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IDesignPin size={16} /> {todaySchedule.roomName}</span>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button style={{ height: 34, padding: '0 14px', borderRadius: 'var(--r-pill)', background: '#fff', color: 'var(--clay)', fontSize: 12.5, fontWeight: 800, border: 'none' }}>자세히 보기</button>
                  <button style={{ height: 34, padding: '0 14px', borderRadius: 'var(--r-pill)', background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 12.5, fontWeight: 800, border: 'none' }}>멤버 알림</button>
                </div>
              </div>
              <div style={{ opacity: 0.9, position: 'relative', zIndex: 1 }}><IllusCalendar size={130}/></div>
              <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', top: -60, right: -30 }}/>
            </div>
          ) : (
            <div style={{
              background: 'linear-gradient(135deg, var(--clay) 0%, #B85838 100%)',
              color: '#fff', borderRadius: 'var(--r-xl)', padding: '28px 36px',
              marginBottom: 20, boxShadow: 'var(--shadow-lg)',
              display: 'flex', alignItems: 'center', gap: 32,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.85, marginBottom: 6 }}>오늘 · {today.getMonth()+1}월 {today.getDate()}일</div>
                <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.03em', opacity: 0.95 }}>오늘은 일정이 없어요</div>
                <div style={{ fontSize: 14, opacity: 0.75, marginTop: 6, fontWeight: 500 }}>새 모임을 만들거나 초대 코드로 참가해 일정을 추가해보세요!</div>
              </div>
              <div style={{ opacity: 0.6 }}><IllusCalendar size={110}/></div>
            </div>
          )}

          {/* 공지사항 */}
          {announcement && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--tag-mustard-bg)', borderRadius: 'var(--r-lg)', padding: '14px 18px', marginBottom: 24, overflow: 'hidden' }}>
              <Tag color="mustard" size="sm" style={{ flexShrink: 0 }}>공지</Tag>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ display: 'inline-block', whiteSpace: 'nowrap', animation: 'marquee 18s linear infinite', fontSize: 14, color: 'var(--ink-700)', fontWeight: 600 }}>{announcement.content}</div>
              </div>
            </div>
          )}

          {/* 통계 카드 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
            <StatCard label="참여 모임" value={rooms.length || 0} sub="+1 이번 달" Icon={IDesignHouse} color="coral" />
            <StatCard label="이번 달 일정" value={thisMonthScheds.length || 0} sub={`${upcomingList.length}개 다가옴`} Icon={ICalendar} color="sage" />
            <StatCard label="함께한 순간" value={stats?.totalMoments ?? 0} sub={stats?.momentsSub || "최근 활동 없음"} Icon={IDesignBox} color="mustard" />
            <StatCard label="연결된 지인" value={stats?.totalConnections ?? 0} sub={stats?.connectionsSub || "새로운 연결 없음"} Icon={IUsers} color="plum" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em' }}>내 모임</h2>
                <button onClick={() => setShowCreate(true)} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 10px', borderRadius: 'var(--r-pill)',
                  background: 'var(--clay-100)', color: 'var(--clay)',
                  fontSize: 12.5, fontWeight: 800, border: 'none', cursor: 'pointer'
                }}>
                  <IPlus size={13}/> 새 모임 만들기
                </button>
              </div>
              
              {rooms.length === 0 && pendingRooms.length === 0 && rejectedRooms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', background: 'var(--surface)', border: '1.5px dashed var(--paper-300)', borderRadius: 'var(--r-xl)' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                    <IDesignBox size={48} color="var(--paper-300)"/>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>아직 모임이 없어요</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>새 모임을 만들거나 초대 코드로 참가해보세요!</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  {rooms.map(r => <GroupCard key={r.roomId} room={r} onClick={() => navigate(`/room/${r.roomId}`)}/>)}
                  {pendingRooms.map(r => <PendingCard key={r.roomId} room={r} onCancel={() => handleCancelJoin(r.roomId)}/>)}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <RecentActivity />
            </div>
          </div>
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
            overflow: 'hidden',
          }}>
            <Tag color="mustard" size="sm" style={{ flexShrink: 0 }}>공지</Tag>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ display: 'inline-block', whiteSpace: 'nowrap', animation: 'marquee 18s linear infinite', fontSize: 13, color: 'var(--ink-700)', fontWeight: 600 }}>{announcement.content}</div>
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
                border: 'none', cursor: 'pointer', fontFamily: 'inherit'
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
