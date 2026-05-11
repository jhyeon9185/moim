import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AppHeader, IconButton, BottomSheet, Button, Avatar } from '../components/MoimUI'
import { IBack, ISettings, IPlus, IClock, IPin, IPencil, ITrash, ILink, IUsers, IBell, ICheck, IX } from '../components/Icons'
import { MonthCalendar } from '../components/Calendar'
import InviteCodeModal from '../components/InviteCodeModal'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'
import DesktopLayout from '../components/DesktopLayout'
import { useIsDesktop } from '../hooks/useIsDesktop'
import api from '../api'

const EVENT_COLORS = ['coral', 'mustard', 'sage', 'plum', 'sky', 'rose']
const hashColor = (id) => EVENT_COLORS[Math.abs(id || 0) % EVENT_COLORS.length]

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function buildEventsMap(schedules) {
  const map = {}
  schedules.forEach(s => {
    const key = s.eventDate
    if (!map[key]) map[key] = []
    map[key].push({ color: hashColor(s.id) })
  })
  return map
}

function ScheduleItem({ s, onEdit, onDelete, isOwnerOrAdmin }) {
  return (
    <div style={{
      display: 'flex', gap: 12,
      background: 'var(--surface)', border: '1px solid var(--paper-200)',
      borderRadius: 'var(--r-md)', padding: '12px 14px',
    }}>
      <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 4, background: `var(--tag-${hashColor(s.id)})` }}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.015em', marginBottom: 4 }}>{s.title}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 12.5, color: 'var(--ink-500)', fontWeight: 500 }}>
          {s.eventTime && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><IClock size={13}/> {s.eventTime}</span>}
          {s.location && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><IPin size={13}/> {s.location}</span>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={() => onEdit(s)} style={{ width: 30, height: 30, borderRadius: 'var(--r-xs)', background: 'var(--paper-100)', color: 'var(--ink-700)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IPencil size={14}/>
        </button>
        {isOwnerOrAdmin && (
          <button onClick={() => onDelete(s.id)} style={{ width: 30, height: 30, borderRadius: 'var(--r-xs)', background: '#FDECEA', color: 'var(--danger)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ITrash size={14}/>
          </button>
        )}
      </div>
    </div>
  )
}

function AddScheduleSheet({ onClose, onCreated, roomId, defaultDate = '', schedule = null }) {
  const isEdit = !!schedule
  const [form, setForm] = useState({
    title: schedule?.title ?? '',
    eventDate: schedule?.eventDate ?? defaultDate,
    eventTime: schedule?.eventTime ?? '',
    location: schedule?.location ?? '',
    category: 'mustard',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return
    const userMsg = chatInput.trim()
    const next = [...chatMessages, { role: 'user', content: userMsg }]
    setChatMessages(next)
    setChatInput('')
    setChatLoading(true)
    try {
      const res = await api.post('/ai/momi', {
        message: userMsg,
        history: chatMessages.slice(-6),
        date: form.eventDate,
        location: form.location,
        title: form.title,
      })
      setChatMessages([...next, { role: 'assistant', content: res.data.reply }])
    } catch {
      setChatMessages([...next, { role: 'assistant', content: '오류가 발생했어요. 다시 시도해주세요.' }])
    } finally {
      setChatLoading(false)
    }
  }

  const CATEGORIES = [
    ['mustard', '기념일'],
    ['sage', '모임/외식'],
    ['coral', '약속'],
    ['plum', '생일'],
    ['sky', '여행'],
    ['rose', '지인'],
  ]

  const ALERT_OPTIONS = ['1시간 전', '3시간 전', '하루 전', '꺼짐']
  const [alertIdx, setAlertIdx] = useState(0)

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('일정 제목을 입력해주세요.'); return }
    if (!form.eventDate) { setError('날짜를 선택해주세요.'); return }
    setSubmitting(true)
    try {
      const payload = {
        title: form.title.trim(),
        eventDate: form.eventDate,
        eventTime: form.eventTime || null,
        location: form.location.trim() || null,
        description: null,
      }
      if (isEdit) {
        await api.put(`/rooms/${roomId}/schedules/${schedule.id}`, payload)
      } else {
        await api.post(`/rooms/${roomId}/schedules`, payload)
      }
      onCreated()
    } catch {
      setError(isEdit ? '일정 수정에 실패했습니다.' : '일정 추가에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = {
    width: '100%', height: 52, padding: '0 14px',
    background: 'var(--surface-sunken)', border: '1.5px solid transparent',
    borderRadius: 'var(--r-md)', fontSize: 16, fontWeight: 500,
    color: 'var(--ink-900)', fontFamily: 'inherit', outline: 'none',
  }

  return (
    <BottomSheet open onClose={onClose}>
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 4 }}>{isEdit ? '일정 수정' : '새 일정 추가'}</h2>
      </div>

      {error && <div style={{ background: '#FDECEA', color: 'var(--danger)', padding: '10px 12px', borderRadius: 'var(--r-sm)', fontSize: 13.5, marginBottom: 12 }}>{error}</div>}

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--ink-700)', marginBottom: 6, paddingLeft: 4 }}>무슨 모임인가요?</label>
        <input value={form.title} onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setError('') }} placeholder="예: 친구들과의 저녁 식사" autoFocus style={inputStyle}/>
      </div>

      {!isEdit && (
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--ink-700)', marginBottom: 6, paddingLeft: 4 }}>카테고리</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CATEGORIES.map(([c, l]) => (
              <button key={c} onClick={() => setForm(f => ({ ...f, category: c }))} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '8px 13px', borderRadius: 'var(--r-pill)',
                background: form.category === c ? `var(--tag-${c}-bg)` : 'var(--surface-sunken)',
                border: form.category === c ? `1.5px solid var(--tag-${c})` : '1.5px solid transparent',
                color: form.category === c ? `var(--tag-${c})` : 'var(--ink-500)',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: `var(--tag-${c})` }}/>
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 0 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--ink-700)', marginBottom: 6, paddingLeft: 4 }}>날짜</label>
          <input type="date" value={form.eventDate} onChange={e => { setForm(f => ({ ...f, eventDate: e.target.value })); setError('') }} onClick={(e) => e.target.showPicker?.()} style={inputStyle}/>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--ink-700)', marginBottom: 6, paddingLeft: 4 }}>시간 (선택)</label>
          <input type="time" value={form.eventTime} onChange={e => setForm(f => ({ ...f, eventTime: e.target.value }))} onClick={(e) => e.target.showPicker?.()} style={inputStyle}/>
        </div>
      </div>

      <div style={{ marginTop: 14, marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--ink-700)', marginBottom: 6, paddingLeft: 4 }}>장소 (선택)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-sunken)', border: '1.5px solid transparent', borderRadius: 'var(--r-md)', padding: '0 14px', height: 52 }}>
          <IPin size={18} style={{ color: 'var(--ink-500)', flexShrink: 0 }}/>
          <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="예: 한정식 모란각" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 16, fontWeight: 500, color: 'var(--ink-900)', fontFamily: 'inherit' }}/>
        </div>
      </div>

      {!isEdit && (
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--ink-700)', marginBottom: 6, paddingLeft: 4 }}>알림</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {ALERT_OPTIONS.map((l, i) => (
              <button key={l} onClick={() => setAlertIdx(i)} style={{
                flex: 1, height: 40, borderRadius: 'var(--r-sm)',
                background: alertIdx === i ? 'var(--ink-900)' : 'var(--surface-sunken)',
                color: alertIdx === i ? 'var(--paper-50)' : 'var(--ink-500)',
                fontSize: 12.5, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              }}>{l}</button>
            ))}
          </div>
        </div>
      )}

      <Button variant="primary" size="lg" full onClick={handleSubmit} disabled={submitting}>
        {submitting ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}/> : (isEdit ? '수정하기' : '일정 추가하기')}
      </Button>
      <div style={{ height: 8 }}/>
      <Button variant="ghost" size="md" full onClick={onClose}>취소</Button>

      {!isEdit && (
        <div className="momi-section">
          <div className="momi-header">
            <div className="momi-badge">모미</div>
            <div className="momi-header-text">
              <span className="momi-name">모미에게 물어봐요!</span>
              <span className="momi-desc">날씨 · 미세먼지 등 일정 정보를 알려드려요</span>
            </div>
          </div>
          {chatMessages.length > 0 && (
            <div className="momi-messages">
              {chatMessages.map((m, i) => (
                <div key={i} className={`momi-msg ${m.role}`}>{m.content}</div>
              ))}
              {chatLoading && (
                <div className="momi-msg assistant momi-typing"><span/><span/><span/></div>
              )}
              <div ref={chatEndRef}/>
            </div>
          )}
          <div className="momi-input-row">
            <input
              className="input-field momi-input"
              placeholder="예) 이날 비 올까요?"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleChatSend()}
              disabled={chatLoading}
            />
            <button className="btn btn-primary momi-send-btn" onClick={handleChatSend} disabled={chatLoading || !chatInput.trim()}>
              {chatLoading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}/> : '전송'}
            </button>
          </div>
        </div>
      )}
    </BottomSheet>
  )
}

export default function RoomPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isDesktop = useIsDesktop()

  const [room, setRoom] = useState(null)
  const [members, setMembers] = useState([])
  const [schedules, setSchedules] = useState([])
  const [pendingMembers, setPendingMembers] = useState([])
  const [tab, setTab] = useState('calendar')
  const [loading, setLoading] = useState(true)
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [sel, setSel] = useState(null)
  const [showInvite, setShowInvite] = useState(false)
  const [viewingMember, setViewingMember] = useState(null)
  const [notifSetting, setNotifSetting] = useState({ enabled: true, alert1h: true, alert3h: false, alertDay: false })
  const [showScheduleList, setShowScheduleList] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  const today = new Date()
  const todayObj = { y: today.getFullYear(), m: today.getMonth() + 1, d: today.getDate() }
  const [calYear, setCalYear] = useState(todayObj.y)
  const [calMonth, setCalMonth] = useState(todayObj.m)

  const isOwner = room?.ownerId === user?.id
  const isOwnerOrAdmin = isOwner || user?.role === 'ADMIN'

  useEffect(() => {
    fetchRoom()
    fetchNotifSetting()
  }, [id])

  const fetchNotifSetting = async () => {
    try {
      const res = await api.get(`/notifications/settings/${id}`)
      setNotifSetting(res.data)
    } catch {}
  }

  const updateNotifSetting = async (patch) => {
    const updated = { ...notifSetting, ...patch }
    setNotifSetting(updated)
    try { await api.put(`/notifications/settings/${id}`, patch) } catch {}
  }

  const fetchRoom = async () => {
    try {
      const [roomRes, membersRes, schedulesRes] = await Promise.all([
        api.get(`/rooms/${id}`),
        api.get(`/rooms/${id}/members`),
        api.get(`/rooms/${id}/schedules`),
      ])
      setRoom(roomRes.data)
      setMembers(membersRes.data.filter(m => m.status === 'APPROVED'))
      setPendingMembers(membersRes.data.filter(m => m.status === 'PENDING'))
      setSchedules(schedulesRes.data)
    } catch {
      navigate('/', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId) => {
    try { await api.patch(`/rooms/${id}/members/${userId}`, { status: 'APPROVED' }); fetchRoom() } catch {}
  }

  const handleReject = async (userId) => {
    try { await api.delete(`/rooms/${id}/members/${userId}`); fetchRoom() } catch {}
  }

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('이 일정을 삭제하시겠습니까?')) return
    try {
      await api.delete(`/rooms/${id}/schedules/${scheduleId}`)
      fetchRoom()
    } catch {
      alert('일정 삭제에 실패했습니다.')
    }
  }

  const handleScheduleCreated = () => {
    setShowAddSheet(false)
    setEditingSchedule(null)
    fetchRoom()
  }

  const selDateStr = sel ? `${sel.y}-${String(sel.m).padStart(2,'0')}-${String(sel.d).padStart(2,'0')}` : null
  const daySchedules = selDateStr ? schedules.filter(s => s.eventDate?.startsWith(selDateStr)) : schedules

  const eventsMap = buildEventsMap(schedules)

  const groupByMonth = () => {
    const groups = {}
    ;[...schedules].sort((a, b) => a.eventDate.localeCompare(b.eventDate)).forEach(s => {
      const d = new Date(s.eventDate)
      const key = `${d.getFullYear()}년 ${d.getMonth() + 1}월`
      if (!groups[key]) groups[key] = []
      groups[key].push(s)
    })
    return groups
  }

  if (loading) return <div className="loading-page"><LoadingSpinner /></div>

  const profileSrc = (img) => img ? (img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL}${img}`) : null

  if (isDesktop) {
    const selDateStr = sel ? `${sel.y}-${String(sel.m).padStart(2,'0')}-${String(sel.d).padStart(2,'0')}` : null
    const daySchedules = selDateStr ? schedules.filter(s => s.eventDate?.startsWith(selDateStr)) : schedules
    const eventsMap = buildEventsMap(schedules)

    return (
      <DesktopLayout title={room?.name}>
        <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: 32, height: '100%', overflow: 'hidden' }}>
          {/* Left: Main Content (Tabs) */}
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '0 0 20px', display: 'flex', gap: 6 }}>
              {[
                { id: 'calendar', label: '일정' },
                { id: 'members', label: `멤버${pendingMembers.length > 0 && isOwner ? ` (${pendingMembers.length})` : ''}` },
                { id: 'settings', label: '관리' },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  padding: '8px 24px', borderRadius: 'var(--r-pill)',
                  background: tab === t.id ? 'var(--ink-900)' : 'var(--paper-100)',
                  color: tab === t.id ? 'var(--paper-50)' : 'var(--ink-500)',
                  fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}>{t.label}</button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 10 }}>
              {tab === 'calendar' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                  <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-xl)', padding: 24, border: '1px solid var(--paper-200)' }}>
                    <MonthCalendar
                      year={calYear} month={calMonth}
                      today={todayObj}
                      events={eventsMap}
                      selected={sel}
                      onSelect={s => setSel(prev => prev?.d === s.d && prev?.m === s.m ? null : s)}
                      onPrev={() => { if (calMonth === 1) { setCalMonth(12); setCalYear(y => y-1) } else setCalMonth(m => m-1) }}
                      onNext={() => { if (calMonth === 12) { setCalMonth(1); setCalYear(y => y+1) } else setCalMonth(m => m+1) }}
                    />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 24 }}>
                      {[['mustard','기념일'],['sage','모임/외식'],['coral','약속'],['sky','여행'],['plum','생일'],['rose','지인']].map(([c,l]) => (
                        <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-500)', fontWeight: 600 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: `var(--tag-${c})` }}/>
                          {l}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                      <h2 style={{ fontSize: 18, fontWeight: 800 }}>{sel ? `${sel.y}년 ${sel.m}월 ${sel.d}일 일정` : '전체 일정'}</h2>
                      <button onClick={() => { setEditingSchedule(null); setShowAddSheet(true) }} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'var(--clay)', color: '#fff',
                        height: 36, padding: '0 16px', borderRadius: 'var(--r-pill)',
                        fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer'
                      }}><IPlus size={16}/> 일정 추가</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {daySchedules.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-400)', fontSize: 14 }}>일정이 없습니다.</div>
                      ) : (
                        daySchedules.map(s => (
                          <ScheduleItem key={s.id} s={s} onEdit={sc => { setEditingSchedule(sc); setShowAddSheet(true) }} onDelete={handleDeleteSchedule} isOwnerOrAdmin={isOwner || user?.role === 'ADMIN'} />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {tab === 'members' && (
                <div style={{ maxWidth: 800 }}>
                  {isOwner && pendingMembers.length > 0 && (
                    <div style={{ marginBottom: 32 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>가입 신청 ({pendingMembers.length})</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                        {pendingMembers.map(m => (
                          <div key={m.userId} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--tag-mustard-bg)', padding: 16, borderRadius: 'var(--r-lg)' }}>
                            <Avatar src={profileSrc(m.profileImage)} name={m.nickname} size={40} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700 }}>{m.nickname}</div>
                              <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>신청일: {m.joinedAt?.slice(0,10)}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => handleApprove(m.userId)} style={{ padding: '6px 12px', borderRadius: 'var(--r-pill)', background: 'var(--ink-900)', color: 'var(--paper-50)', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>승인</button>
                              <button onClick={() => handleReject(m.userId)} style={{ padding: '6px 12px', borderRadius: 'var(--r-pill)', background: 'var(--paper-200)', color: 'var(--ink-700)', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>거절</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>참여 멤버 ({members.length})</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    {members.map(m => (
                      <div key={m.userId} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface)', border: '1px solid var(--paper-200)', padding: 12, borderRadius: 'var(--r-lg)' }}>
                        <Avatar src={profileSrc(m.profileImage)} name={m.nickname} size={36} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{m.nickname}</div>
                          <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{m.role === 'OWNER' ? '방장' : '멤버'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'settings' && (
                <div style={{ maxWidth: 600 }}>
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--paper-200)', borderRadius: 'var(--r-xl)', padding: 24, marginBottom: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>초대 코드</h3>
                    <button onClick={() => setShowInvite(true)} style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                      background: 'var(--paper-100)', padding: '16px 24px', borderRadius: 'var(--r-lg)',
                      border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                    }}>
                      <ILink size={20} color="var(--clay)"/>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-800)' }}>초대 코드 만들기</span>
                      <span style={{ marginLeft: 'auto', color: 'var(--ink-400)', fontSize: 18 }}>›</span>
                    </button>
                  </div>
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--paper-200)', borderRadius: 'var(--r-xl)', padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>알림 설정</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {[
                        { id: 'enabled', label: '전체 알림 받기', desc: '이 모임의 모든 알림을 받습니다.' },
                        { id: 'alert1h', label: '1시간 전 알림', desc: '일정 시작 1시간 전에 알려드립니다.' },
                        { id: 'alert3h', label: '3시간 전 알림', desc: '일정 시작 3시간 전에 알려드립니다.' },
                        { id: 'alertDay', label: '하루 전 알림', desc: '일정 시작 전날 오전에 알려드립니다.' },
                      ].map(opt => (
                        <div key={opt.id} onClick={() => handleToggleNotif(opt.id, !notifSetting[opt.id])} style={{
                          display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
                          padding: '12px 16px', borderRadius: 'var(--r-lg)',
                          background: notifSetting[opt.id] ? 'var(--clay-100)' : 'var(--paper-50)',
                          border: `1px solid ${notifSetting[opt.id] ? 'var(--clay)' : 'var(--paper-200)'}`,
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{opt.label}</div>
                            <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>{opt.desc}</div>
                          </div>
                          <div style={{
                            width: 44, height: 24, borderRadius: 12, background: notifSetting[opt.id] ? 'var(--clay)' : 'var(--paper-300)',
                            position: 'relative', transition: '0.2s'
                          }}>
                            <div style={{
                              width: 18, height: 18, borderRadius: '50%', background: '#fff',
                              position: 'absolute', top: 3, left: notifSetting[opt.id] ? 23 : 3, transition: '0.2s'
                            }}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Room Info Rail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--paper-200)', borderRadius: 'var(--r-xl)', padding: 24 }}>
              <div style={{ fontSize: 13, color: 'var(--ink-500)', fontWeight: 700, marginBottom: 8 }}>현재 모임</div>
              <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>{room?.name}</h1>
              <p style={{ fontSize: 14, color: 'var(--ink-600)', lineHeight: 1.6, marginBottom: 20 }}>{room?.description || '모임에 대한 설명이 없습니다.'}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'var(--paper-100)', borderRadius: 'var(--r-lg)' }}>
                <IUsers size={18} color="var(--ink-400)"/>
                <span style={{ fontSize: 14, fontWeight: 700 }}>멤버 {members.length}명 참여 중</span>
              </div>
            </div>
            {!isOwner && (
              <button style={{
                height: 48, borderRadius: 'var(--r-xl)', background: '#FDECEA', color: 'var(--danger)',
                fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer'
              }} onClick={() => setShowLeaveConfirm(true)}>모임 나가기</button>
            )}
            {isOwner && (
              <button style={{
                height: 48, borderRadius: 'var(--r-xl)', background: 'var(--paper-200)', color: 'var(--ink-700)',
                fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer'
              }} onClick={() => { setDeleteInput(''); setShowDeleteConfirm(true) }}>모임 삭제하기</button>
            )}
          </div>
        </div>

        {showAddSheet && (
          <Modal title={editingSchedule ? "일정 수정" : "새 일정 추가"} onClose={() => setShowAddSheet(false)}>
            <AddScheduleSheet
              roomId={id}
              defaultDate={selDateStr}
              schedule={editingSchedule}
              onClose={() => setShowAddSheet(false)}
              onCreated={handleScheduleCreated}
            />
          </Modal>
        )}
        {showInvite && (
          <InviteCodeModal roomId={id} roomName={room?.name} onClose={() => setShowInvite(false)}/>
        )}
        {showLeaveConfirm && (
          <Modal isOpen={true} onClose={() => setShowLeaveConfirm(false)} title="모임 나가기">
            <p style={{ fontSize: 14, color: 'var(--ink-500)', lineHeight: 1.7, marginBottom: 20 }}>
              <strong style={{ color: 'var(--ink-900)' }}>{room?.name}</strong> 모임에서 나가시겠습니까?<br/>
              나가면 다시 초대 코드로 재가입해야 합니다.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowLeaveConfirm(false)}>취소</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={async () => {
                try { await api.delete(`/rooms/${id}/members/me`); navigate('/', { replace: true }) }
                catch { alert('모임 나가기에 실패했습니다.') }
              }}>나가기</button>
            </div>
          </Modal>
        )}
        {showDeleteConfirm && (
          <Modal isOpen={true} onClose={() => setShowDeleteConfirm(false)} title="모임 삭제">
            <p style={{ fontSize: 14, color: 'var(--ink-500)', lineHeight: 1.7, marginBottom: 16 }}>
              이 작업은 되돌릴 수 없습니다.<br/>
              삭제하려면 모임 이름 <strong style={{ color: 'var(--ink-900)' }}>{room?.name}</strong>을 정확히 입력하세요.
            </p>
            <div className="input-group" style={{ marginBottom: 16 }}>
              <input
                className="input-field"
                type="text"
                placeholder={room?.name}
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowDeleteConfirm(false)}>취소</button>
              <button
                className="btn btn-danger"
                style={{ flex: 1, opacity: deleteInput === room?.name ? 1 : 0.4, cursor: deleteInput === room?.name ? 'pointer' : 'not-allowed' }}
                disabled={deleteInput !== room?.name}
                onClick={async () => {
                  try { await api.delete(`/rooms/${id}`); navigate('/', { replace: true }) }
                  catch { alert('모임 삭제에 실패했습니다.') }
                }}
              >삭제하기</button>
            </div>
          </Modal>
        )}
      </DesktopLayout>
    )
  }

  return (
    <div className="moim paper-grain" style={{
      width: '100%', height: '100dvh', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      background: 'var(--paper-50)', position: 'relative',
    }}>
      <AppHeader
        title={room?.name}
        subtitle={`멤버 ${members.length}명`}
        left={<IconButton Icon={IBack} onClick={() => navigate('/', { state: { skipAutoRedirect: true } })}/>}
        right={<IconButton Icon={ISettings} onClick={() => setTab('settings')}/>}
      />

      {/* Tabs */}
      <div style={{ padding: '4px 16px 14px', display: 'flex', gap: 6 }}>
        {[
          { id: 'calendar', label: '일정' },
          { id: 'members', label: `멤버${pendingMembers.length > 0 && isOwner ? ` (${pendingMembers.length})` : ''}` },
          { id: 'settings', label: '관리' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, height: 36, borderRadius: 'var(--r-pill)',
            background: tab === t.id ? 'var(--ink-900)' : 'var(--paper-100)',
            color: tab === t.id ? 'var(--paper-50)' : 'var(--ink-500)',
            fontSize: 13.5, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Calendar tab */}
      {tab === 'calendar' && (
        <>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 220px' }}>
            <MonthCalendar
              year={calYear} month={calMonth}
              today={todayObj}
              events={eventsMap}
              selected={sel}
              onSelect={s => setSel(prev => prev?.d === s.d && prev?.m === s.m ? null : s)}
              onPrev={() => { if (calMonth === 1) { setCalMonth(12); setCalYear(y => y-1) } else setCalMonth(m => m-1) }}
              onNext={() => { if (calMonth === 12) { setCalMonth(1); setCalYear(y => y+1) } else setCalMonth(m => m+1) }}
            />
            {/* Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
              {[['mustard','기념일'],['sage','모임/외식'],['coral','약속'],['sky','여행'],['plum','생일'],['rose','지인']].map(([c,l]) => (
                <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-500)', fontWeight: 600 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: `var(--tag-${c})` }}/>
                  {l}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom day panel */}
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            background: 'var(--surface-raised)',
            borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
            boxShadow: '0 -8px 24px rgba(80,60,30,0.12)',
            padding: '12px 20px 28px', maxHeight: '52%', overflowY: 'auto', zIndex: 10,
          }}>
            <div style={{ width: 40, height: 4, background: 'var(--paper-300)', borderRadius: 999, margin: '0 auto 10px' }}/>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                {sel ? (
                  <>
                    <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 700 }}>
                      {sel.y}년 {sel.m}월 {sel.d}일 {WEEKDAYS[new Date(sel.y, sel.m-1, sel.d).getDay()]}요일
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>
                      일정 {daySchedules.length}개
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 700 }}>전체 일정</div>
                    <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>총 {schedules.length}개</div>
                  </>
                )}
              </div>
              <button onClick={() => { setEditingSchedule(null); setShowAddSheet(true) }} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: 'var(--clay)', color: '#fff',
                height: 38, padding: '0 14px', borderRadius: 'var(--r-pill)',
                fontSize: 13.5, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <IPlus size={16}/> 일정 추가
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {daySchedules.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--ink-500)', fontSize: 14, fontWeight: 500 }}>
                  {sel ? '이 날은 일정이 없어요' : '일정이 없어요'}
                </div>
              ) : (
                daySchedules.map(s => (
                  <ScheduleItem key={s.id} s={s}
                    onEdit={(s) => { setEditingSchedule(s); setShowAddSheet(true) }}
                    onDelete={handleDeleteSchedule}
                    isOwnerOrAdmin={isOwnerOrAdmin}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Members tab */}
      {tab === 'members' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 24px' }}>
          {isOwner && pendingMembers.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-500)', marginBottom: 10, paddingLeft: 4 }}>승인 대기 ({pendingMembers.length}명)</h3>
              {pendingMembers.map(m => (
                <div key={m.userId} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--tag-mustard-bg)', borderRadius: 'var(--r-md)', padding: '12px 14px', marginBottom: 8 }}>
                  <Avatar name={m.nickname} src={profileSrc(m.profileImage)} size={40} color="var(--wood)"/>
                  <div style={{ flex: 1, fontSize: 15, fontWeight: 700 }}>{m.nickname}</div>
                  <button onClick={() => handleApprove(m.userId)} style={{ height: 34, padding: '0 14px', borderRadius: 'var(--r-pill)', background: 'var(--clay)', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>승인</button>
                  <button onClick={() => handleReject(m.userId)} style={{ height: 34, padding: '0 14px', borderRadius: 'var(--r-pill)', background: '#FDECEA', color: 'var(--danger)', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>거절</button>
                </div>
              ))}
            </div>
          )}

          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-500)', marginBottom: 10, paddingLeft: 4 }}>멤버 ({members.length}명)</h3>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--paper-200)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
            {members.map((m, i) => (
              <div key={m.userId} onClick={() => setViewingMember(m)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer',
                borderBottom: i < members.length - 1 ? '1px solid var(--paper-200)' : 'none',
              }}>
                <Avatar name={m.nickname} src={profileSrc(m.profileImage)} size={40} color="var(--wood)"/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.015em' }}>
                    {m.nickname}{m.userId === user?.id ? ' (나)' : ''}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 600 }}>{m.role === 'OWNER' ? '방장' : '멤버'}</div>
                </div>
                {isOwnerOrAdmin && m.userId !== user?.id && m.role !== 'OWNER' && (
                  <button onClick={e => {
                    e.stopPropagation()
                    if (window.confirm('이 멤버를 강제탈퇴 시키겠습니까?')) {
                      api.delete(`/rooms/${id}/members/${m.userId}/kick`).then(() => fetchRoom()).catch(() => alert('실패했습니다.'))
                    }
                  }} style={{ width: 30, height: 30, borderRadius: 'var(--r-xs)', background: '#FDECEA', color: 'var(--danger)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IX size={14}/>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings tab */}
      {tab === 'settings' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 24px' }}>

          {/* Invite */}
          <div style={{ marginBottom: 18 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-500)', marginBottom: 8, paddingLeft: 4 }}>모임 관리</h3>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--paper-200)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
              <div onClick={() => setShowInvite(true)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--paper-100)', color: 'var(--ink-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ILink size={18}/>
                </div>
                <div style={{ flex: 1, fontSize: 14.5, fontWeight: 600, letterSpacing: '-0.01em' }}>초대 코드 만들기</div>
                <span style={{ color: 'var(--ink-400)' }}>›</span>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div style={{ marginBottom: 18 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-500)', marginBottom: 8, paddingLeft: 4 }}>알림 설정</h3>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--paper-200)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--paper-200)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--paper-100)', color: 'var(--ink-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IBell size={18}/>
                </div>
                <div style={{ flex: 1, fontSize: 14.5, fontWeight: 600 }}>이 모임 알림</div>
                <label className="notif-toggle">
                  <input type="checkbox" checked={notifSetting.enabled} onChange={e => updateNotifSetting({ enabled: e.target.checked })}/>
                  <span className="notif-toggle-slider"/>
                </label>
              </div>
              {notifSetting.enabled && [
                { key: 'alert1h', label: '1시간 전', desc: '일정 시작 1시간 전 알림' },
                { key: 'alert3h', label: '3시간 전', desc: '일정 시작 3시간 전 알림' },
                { key: 'alertDay', label: '하루 전 알림', desc: '전날 오전 8시에 알림' },
              ].map(({ key, label, desc }) => {
                const checked = notifSetting[key] ?? false
                return (
                  <div key={key} onClick={() => updateNotifSetting({ [key]: !checked })} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderBottom: '1px solid var(--paper-200)', cursor: 'pointer',
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: checked ? 'var(--clay)' : 'var(--paper-200)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {checked && <ICheck size={13} style={{ color: '#fff' }}/>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>{desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Info */}
          <div style={{ marginBottom: 18 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-500)', marginBottom: 8, paddingLeft: 4 }}>정보</h3>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--paper-200)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--paper-200)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--paper-100)', color: 'var(--ink-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IUsers size={18}/>
                </div>
                <div style={{ flex: 1, fontSize: 14.5, fontWeight: 600 }}>멤버 수</div>
                <span style={{ fontSize: 13.5, color: 'var(--ink-500)', fontWeight: 600 }}>{members.length}명</span>
              </div>
              <div onClick={() => setShowScheduleList(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--paper-100)', color: 'var(--ink-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IBell size={18}/>
                </div>
                <div style={{ flex: 1, fontSize: 14.5, fontWeight: 600 }}>등록된 일정</div>
                <span style={{ fontSize: 13.5, color: 'var(--ink-500)', fontWeight: 600, marginRight: 4 }}>{schedules.length}개</span>
                <span style={{ color: 'var(--ink-400)', transform: showScheduleList ? 'rotate(90deg)' : 'none', transition: 'transform 150ms', display: 'inline-block' }}>›</span>
              </div>
              {showScheduleList && (
                <div style={{ borderTop: '1px solid var(--paper-200)', padding: '10px 16px' }}>
                  {schedules.length === 0 ? (
                    <p style={{ fontSize: 14, color: 'var(--ink-500)', textAlign: 'center', padding: '10px 0' }}>등록된 일정이 없어요</p>
                  ) : (
                    Object.entries(groupByMonth()).map(([mon, items]) => (
                      <div key={mon} style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-500)', marginBottom: 6 }}>{mon}</div>
                        {items.map(s => (
                          <div key={s.id} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--paper-100)' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 14, fontWeight: 600 }}>{s.title}</div>
                              <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>
                                {new Date(s.eventDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                                {s.eventTime ? ` · ${s.eventTime}` : ''}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button onClick={() => { setEditingSchedule(s); setShowAddSheet(true); setTab('calendar') }} style={{ width: 28, height: 28, borderRadius: 'var(--r-xs)', background: 'var(--paper-100)', color: 'var(--ink-700)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <IPencil size={13}/>
                              </button>
                              <button onClick={() => handleDeleteSchedule(s.id)} style={{ width: 28, height: 28, borderRadius: 'var(--r-xs)', background: '#FDECEA', color: 'var(--danger)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ITrash size={13}/>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Leave / Delete room */}
          {!isOwner && (
            <button onClick={() => setShowLeaveConfirm(true)} style={{
              width: '100%', height: 48, marginTop: 8,
              color: 'var(--danger)', fontSize: 14, fontWeight: 600,
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              모임 나가기
            </button>
          )}
          {isOwner && (
            <button onClick={() => { setDeleteInput(''); setShowDeleteConfirm(true) }} style={{
              width: '100%', height: 48, marginTop: 8,
              color: 'var(--danger)', fontSize: 14, fontWeight: 600,
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <ITrash size={16}/> 모임 방 삭제
            </button>
          )}
        </div>
      )}

      {/* Add/Edit schedule sheet */}
      {showAddSheet && (
        <AddScheduleSheet
          roomId={id}
          defaultDate={selDateStr || ''}
          schedule={editingSchedule}
          onClose={() => { setShowAddSheet(false); setEditingSchedule(null) }}
          onCreated={handleScheduleCreated}
        />
      )}

      {/* Invite modal */}
      {showInvite && (
        <InviteCodeModal roomId={id} roomName={room?.name} onClose={() => setShowInvite(false)}/>
      )}

      {/* Member detail modal */}
      {viewingMember && (
        <Modal isOpen={true} onClose={() => setViewingMember(null)} title="">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingBottom: 16 }}>
            <Avatar name={viewingMember.nickname} src={profileSrc(viewingMember.profileImage)} size={72} color="var(--wood)" ring/>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
                {viewingMember.nickname}
                {viewingMember.userId === user?.id && <span style={{ color: 'var(--ink-500)', fontSize: 14, fontWeight: 500 }}> (나)</span>}
              </div>
              <div style={{
                display: 'inline-block', background: viewingMember.role === 'OWNER' ? 'var(--clay-100)' : 'var(--paper-200)',
                color: viewingMember.role === 'OWNER' ? 'var(--clay)' : 'var(--ink-500)',
                borderRadius: 'var(--r-pill)', padding: '3px 12px', fontSize: 13, fontWeight: 700,
              }}>{viewingMember.role === 'OWNER' ? '방장' : '멤버'}</div>
            </div>
          </div>
          <button className="btn btn-secondary btn-full" onClick={() => setViewingMember(null)}>닫기</button>
        </Modal>
      )}

      {showLeaveConfirm && (
        <Modal isOpen={true} onClose={() => setShowLeaveConfirm(false)} title="모임 나가기">
          <p style={{ fontSize: 14, color: 'var(--ink-500)', lineHeight: 1.7, marginBottom: 20 }}>
            <strong style={{ color: 'var(--ink-900)' }}>{room?.name}</strong> 모임에서 나가시겠습니까?<br/>
            나가면 다시 초대 코드로 재가입해야 합니다.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowLeaveConfirm(false)}>취소</button>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={async () => {
              try { await api.delete(`/rooms/${id}/members/me`); navigate('/', { replace: true }) }
              catch { alert('모임 나가기에 실패했습니다.') }
            }}>나가기</button>
          </div>
        </Modal>
      )}

      {showDeleteConfirm && (
        <Modal isOpen={true} onClose={() => setShowDeleteConfirm(false)} title="모임 삭제">
          <p style={{ fontSize: 14, color: 'var(--ink-500)', lineHeight: 1.7, marginBottom: 16 }}>
            이 작업은 되돌릴 수 없습니다.<br/>
            삭제하려면 모임 이름 <strong style={{ color: 'var(--ink-900)' }}>{room?.name}</strong>을 정확히 입력하세요.
          </p>
          <div className="input-group" style={{ marginBottom: 16 }}>
            <input
              className="input-field"
              type="text"
              placeholder={room?.name}
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              autoFocus
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowDeleteConfirm(false)}>취소</button>
            <button
              className="btn btn-danger"
              style={{ flex: 1, opacity: deleteInput === room?.name ? 1 : 0.4, cursor: deleteInput === room?.name ? 'pointer' : 'not-allowed' }}
              disabled={deleteInput !== room?.name}
              onClick={async () => {
                try { await api.delete(`/rooms/${id}`); navigate('/', { replace: true }) }
                catch { alert('모임 삭제에 실패했습니다.') }
              }}
            >삭제하기</button>
          </div>
        </Modal>
      )}

    </div>
  )
}
