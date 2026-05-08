import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Settings, Calendar, Users, Link as LinkIcon, ChevronRight, Trash2, Clock, MapPin, Plus, Pencil, Bell } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import CreateScheduleModal from '../components/CreateScheduleModal'
import InviteCodeModal from '../components/InviteCodeModal'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../api'
import './RoomPage.css'

function CalendarView({ schedules, onDateClick, selectedDate }) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date())

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = Array(firstDow).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const getEvents = (day) => {
    if (!day) return []
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return schedules.filter(s => s.eventDate?.startsWith(dateStr))
  }

  const isToday = (day) =>
    day && today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  const isSelected = (day) => {
    if (!day || !selectedDate) return false
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return dateStr === selectedDate
  }

  const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="calendar-view">
      <div className="calendar-nav">
        <div className="calendar-nav-label">
          <span className="calendar-nav-year">{year}</span>
          <span className="calendar-nav-month">{month + 1}월</span>
        </div>
        <div className="calendar-nav-arrows">
          <button className="calendar-nav-btn" onClick={() => setViewDate(new Date(year, month - 1, 1))}>
            <ChevronLeft size={20} />
          </button>
          <button className="calendar-nav-btn" onClick={() => setViewDate(new Date(year, month + 1, 1))}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="calendar-weekdays-row">
        {WEEKDAYS.map((w, i) => (
          <div key={w} className={`calendar-weekday ${i === 0 ? 'sun' : i === 6 ? 'sat' : ''}`}>{w}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {cells.map((day, i) => {
          const col = i % 7
          const events = getEvents(day)
          const today_ = isToday(day)
          const selected_ = isSelected(day)
          return (
            <div
              key={i}
              className={`calendar-cell ${!day ? 'empty' : ''}`}
              onClick={() => {
                if (!day) return
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                onDateClick(dateStr)
              }}
            >
              {day && (
                <>
                  <span className={`calendar-day-num ${today_ ? 'today' : ''} ${selected_ ? 'selected' : ''} ${col === 0 ? 'sun' : col === 6 ? 'sat' : ''}`}>
                    {day}
                  </span>
                  <div className="calendar-dots">
                    {events.slice(0, 3).map((_, di) => (
                      <span key={di} className="calendar-dot" />
                    ))}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function RoomPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [room, setRoom] = useState(null)
  const [members, setMembers] = useState([])
  const [schedules, setSchedules] = useState([])
  const [pendingMembers, setPendingMembers] = useState([])
  const [tab, setTab] = useState('calendar')
  const [loading, setLoading] = useState(true)
  const [showCreateSchedule, setShowCreateSchedule] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [showScheduleList, setShowScheduleList] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [rejectConfirmUserId, setRejectConfirmUserId] = useState(null)
  const [viewingMember, setViewingMember] = useState(null)
  const [notifSetting, setNotifSetting] = useState({ enabled: true, alert1h: true, alert3h: false, alertDay: false })

  const isOwner = room?.ownerId === user?.id

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
    try {
      await api.put(`/notifications/settings/${id}`, patch)
    } catch {}
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
    try {
      await api.patch(`/rooms/${id}/members/${userId}`, { status: 'APPROVED' })
      fetchRoom()
    } catch { /* 에러 처리 */ }
  }

  const handleReject = async (userId) => {
    try {
      await api.delete(`/rooms/${id}/members/${userId}`)
      fetchRoom()
    } catch { /* 에러 처리 */ }
  }

  const handleScheduleCreated = () => {
    setShowCreateSchedule(false)
    setEditingSchedule(null)
    setSelectedDate('')
    fetchRoom()
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

  const groupSchedulesByMonth = () => {
    const groups = {}
    ;[...schedules]
      .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
      .forEach(s => {
        const d = new Date(s.eventDate)
        const key = `${d.getFullYear()}년 ${d.getMonth() + 1}월`
        if (!groups[key]) groups[key] = []
        groups[key].push(s)
      })
    return groups
  }

  const handleDateClick = (dateStr) => {
    setSelectedDate(prev => prev === dateStr ? '' : dateStr)
  }

  const formatSelectedDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const weekdays = ['일', '월', '화', '수', '목', '금', '토']
    return `${d.getMonth() + 1}월 ${d.getDate()}일 (${weekdays[d.getDay()]})`
  }

  const selectedDateSchedules = selectedDate
    ? schedules.filter(s => s.eventDate?.startsWith(selectedDate))
    : []

  const getInitial = (name) => name ? name.charAt(0) : '?'

  if (loading) {
    return <div className="loading-page"><LoadingSpinner /></div>
  }

  return (
    <div className="room-page">
      {/* 헤더 */}
      <div className="room-header">
        <button className="room-header-back" onClick={() => navigate('/', { state: { skipAutoRedirect: true } })}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="room-header-title">{room?.name}</h1>
        <button className="room-header-menu" onClick={() => setTab('settings')}>
          <Settings size={24} />
        </button>
      </div>

      {/* 탭 */}
      <div className="room-tabs">
        <button
          className={`room-tab ${tab === 'calendar' ? 'active' : ''}`}
          onClick={() => setTab('calendar')}
        >
          <Calendar size={18} style={{ marginRight: '4px' }} /> 일정
        </button>
        <button
          className={`room-tab ${tab === 'members' ? 'active' : ''}`}
          onClick={() => setTab('members')}
        >
          <Users size={18} style={{ marginRight: '4px' }} /> 멤버 {pendingMembers.length > 0 && isOwner ? `(${pendingMembers.length})` : ''}
        </button>
        <button
          className={`room-tab ${tab === 'settings' ? 'active' : ''}`}
          onClick={() => setTab('settings')}
        >
          <Settings size={18} style={{ marginRight: '4px' }} /> 설정
        </button>
      </div>

      {/* 콘텐츠 */}
      <div className="room-content" style={{ padding: tab === 'calendar' ? '0' : 'var(--space-lg)' }}>
        {/* 일정 탭 - 달력 뷰 */}
        {tab === 'calendar' && (
          <>
            <CalendarView
              schedules={schedules}
              onDateClick={handleDateClick}
              selectedDate={selectedDate}
            />

            {/* 날짜 선택 시 하단 섹션 */}
            {selectedDate && (
              <div className="date-detail-section">
                <div className="date-detail-header">
                  <span className="date-detail-title">{formatSelectedDate(selectedDate)}</span>
                  <button className="date-detail-add-btn" onClick={() => setShowCreateSchedule(true)}>
                    <Plus size={14} />일정 추가
                  </button>
                </div>
                <div className="date-detail-body">
                  {selectedDateSchedules.length === 0 ? (
                    <p className="date-detail-empty">이 날은 일정이 없어요</p>
                  ) : (
                    selectedDateSchedules.map(s => (
                      <div key={s.id} className="date-detail-schedule-item">
                        <span className="date-detail-schedule-dot" />
                        <div className="date-detail-schedule-info">
                          <div className="date-detail-schedule-title">{s.title}</div>
                          {(s.eventTime || s.location) && (
                            <div className="date-detail-schedule-meta">
                              {s.eventTime && <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={12} />{s.eventTime}</span>}
                              {s.eventTime && s.location && <span>·</span>}
                              {s.location && <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={12} />{s.location}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* 멤버 탭 */}
        {tab === 'members' && (
          <>
            {/* 승인 대기 (방장만 보임) */}
            {isOwner && pendingMembers.length > 0 && (
              <div className="pending-list">
                <h3 style={{ fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-sm)', color: 'var(--color-secondary)' }}>
                  승인 대기 ({pendingMembers.length}명)
                </h3>
                {pendingMembers.map((m) => (
                  <div key={m.userId} className="pending-item">
                    <div className="member-avatar">{getInitial(m.nickname)}</div>
                    <div className="pending-item-info">
                      <div className="pending-item-name">{m.nickname}</div>
                    </div>
                    <div className="pending-actions">
                      <button className="btn btn-primary" onClick={() => handleApprove(m.userId)}>
                        승인
                      </button>
                      <button className="btn btn-danger" onClick={() => setRejectConfirmUserId(m.userId)}>
                        거절
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: pendingMembers.length > 0 && isOwner ? 'var(--space-lg)' : 0 }}>
              <h3 style={{ fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-sm)', color: 'var(--color-text-secondary)' }}>
                멤버 ({members.length}명)
              </h3>
              {members.map((m) => (
                <div key={m.userId} className="member-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <div className="member-avatar">
                      {m.profileImage ? (
                        <img
                          src={m.profileImage.startsWith('http') ? m.profileImage : `${import.meta.env.VITE_API_URL}${m.profileImage}`}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                        />
                      ) : getInitial(m.nickname)}
                    </div>
                    <div className="member-info">
                      <div className="member-name">
                        {m.nickname}
                        {m.userId === user?.id && ' (나)'}
                      </div>
                      <div className="member-role">
                        {m.role === 'OWNER' ? '방장' : '멤버'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button className="member-icon-btn" onClick={() => setViewingMember(m)} aria-label="상세보기">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 47.62 47.63" width="18" height="18">
                        <path d="m46.99,43.94l-14.95-14.95c5.52-7.03,5.05-17.26-1.43-23.74C27.23,1.87,22.72,0,17.93,0S8.63,1.87,5.25,5.25c-6.99,6.99-6.99,18.38,0,25.37,3.43,3.43,8.05,5.25,12.72,5.25,2.54,0,5.09-.54,7.48-1.64l-1.36-2.94c-5.57,2.57-12.22,1.38-16.56-2.96C1.81,22.6,1.81,13.28,7.54,7.54c2.78-2.78,6.47-4.31,10.39-4.31s7.62,1.53,10.39,4.31c5.73,5.73,5.73,15.06,0,20.79h0c-.84.85-.84,2.21,0,3.06l15.61,15.61c.42.42.97.63,1.53.63s1.11-.21,1.53-.63c.84-.84.84-2.21,0-3.05Z" fill="currentColor"/>
                        <path d="m29.13,15.76c-.43-2.24-1.52-4.27-3.13-5.89-3.32-3.32-8.43-4.27-12.72-2.35-.82.36-1.18,1.32-.82,2.14.36.82,1.32,1.18,2.14.82,3.07-1.37,6.73-.69,9.11,1.69,1.16,1.16,1.93,2.62,2.24,4.21.15.77.83,1.31,1.59,1.31.1,0,.21,0,.31-.03.88-.17,1.45-1.02,1.28-1.9Z" fill="currentColor"/>
                      </svg>
                    </button>

                    {(isOwner || user?.role === 'ADMIN') && m.userId !== user?.id && m.role !== 'OWNER' && (
                      <button
                        className="member-icon-btn danger"
                        aria-label="강제탈퇴"
                        onClick={async () => {
                          if (window.confirm('이 멤버를 정말 강제탈퇴 시키겠습니까?')) {
                            try {
                              await api.delete(`/rooms/${id}/members/${m.userId}`)
                              fetchRoom()
                            } catch {
                              alert('멤버 강제탈퇴에 실패했습니다.')
                            }
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 37.47 37.47" width="18" height="18">
                          <path d="m18.73,0c-3.01,0-5.86.71-8.38,1.98l3.76,3.78c1.45-.51,3-.79,4.62-.79,7.6,0,13.78,6.17,13.78,13.77,0,2.96-.95,5.79-2.66,8.12l-1.52-1.53L10.67,7.58l-1.87-1.88-1.65-1.67C2.8,7.46,0,12.78,0,18.74c0,10.33,8.4,18.73,18.73,18.73,2.54,0,5.01-.5,7.33-1.48.14-.06.29-.13.43-.2l-3.83-3.85c-1.27.38-2.58.57-3.93.57-7.59,0-13.77-6.18-13.77-13.77,0-2.8.84-5.4,2.27-7.58l1.31,1.31,17.7,17.8h.01l1.95,1.97,1.6,1.61c4.81-3.52,7.67-9.13,7.67-15.11C37.47,8.41,29.06,0,18.73,0Z" fill="currentColor"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 설정 탭 */}
        {tab === 'settings' && (
          <>
            <div className="settings-section">
              <div className="settings-title">모임 관리</div>
              <button className="settings-item" onClick={() => setShowInvite(true)}>
                <span className="settings-item-icon"><LinkIcon size={20} color="var(--color-primary)" /></span>
                <span style={{ flex: 1 }}>초대 코드 만들기</span>
                <span style={{ color: 'var(--color-text-light)' }}><ChevronRight size={20} /></span>
              </button>
            </div>

            {/* 알림 설정 */}
            <div className="settings-section">
              <div className="settings-title">알림 설정</div>
              <div className="settings-item" style={{ cursor: 'default' }}>
                <span className="settings-item-icon"><Bell size={20} color="var(--color-primary)" /></span>
                <span style={{ flex: 1 }}>이 모임 알림</span>
                <label className="notif-toggle">
                  <input
                    type="checkbox"
                    checked={notifSetting.enabled}
                    onChange={e => updateNotifSetting({ enabled: e.target.checked })}
                  />
                  <span className="notif-toggle-slider" />
                </label>
              </div>

              {notifSetting.enabled && (
                <div className="notif-options">
                  {[
                    { key: 'alert1h',  label: '1시간 전',  desc: '일정 시작 1시간 전 알림' },
                    { key: 'alert3h',  label: '3시간 전',  desc: '일정 시작 3시간 전 알림' },
                    { key: 'alertDay', label: '하루 전 알림', desc: '전날 오전 8시에 알림' },
                  ].map(({ key, label, desc }) => {
                    const checked = notifSetting[key] ?? false
                    return (
                      <button
                        key={key}
                        className={`notif-option-row${checked ? ' checked' : ''}`}
                        onClick={() => updateNotifSetting({ [key]: !checked })}
                      >
                        <div className="notif-option-check">
                          {checked && <span className="notif-option-checkmark">✓</span>}
                        </div>
                        <div>
                          <div className="notif-option-label">{label}</div>
                          <div className="notif-option-desc">{desc}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="settings-section">
              <div className="settings-title">정보</div>
              <div className="settings-item" style={{ cursor: 'default' }}>
                <span className="settings-item-icon"><Users size={20} color="var(--color-secondary)" /></span>
                <span style={{ flex: 1 }}>멤버 수</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>{members.length}명</span>
              </div>
              {/* 등록된 일정 — 클릭 시 월별 목록 펼침 */}
              <button className="settings-item" onClick={() => setShowScheduleList(v => !v)}>
                <span className="settings-item-icon"><Calendar size={20} color="var(--color-success)" /></span>
                <span style={{ flex: 1 }}>등록된 일정</span>
                <span style={{ color: 'var(--color-text-secondary)', marginRight: '4px' }}>{schedules.length}개</span>
                <ChevronRight size={20} color="var(--color-text-light)" style={{ transform: showScheduleList ? 'rotate(90deg)' : 'none', transition: 'transform 150ms' }} />
              </button>

              {showScheduleList && (
                <div className="schedule-list-expanded">
                  {schedules.length === 0 ? (
                    <p className="schedule-list-empty">등록된 일정이 없어요</p>
                  ) : (
                    Object.entries(groupSchedulesByMonth()).map(([month, items]) => (
                      <div key={month} className="schedule-month-group">
                        <div className="schedule-month-label">{month}</div>
                        {items.map(s => (
                          <div key={s.id} className="schedule-list-item">
                            <div className="schedule-list-item-info">
                              <div className="schedule-list-item-title">{s.title}</div>
                              <div className="schedule-list-item-meta">
                                {new Date(s.eventDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                                {s.eventTime && ` · ${s.eventTime}`}
                              </div>
                            </div>
                            <div className="schedule-list-item-actions">
                              <button
                                className="schedule-action-btn"
                                onClick={() => { setEditingSchedule(s); setShowCreateSchedule(true) }}
                                aria-label="수정"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                className="schedule-action-btn danger"
                                onClick={() => handleDeleteSchedule(s.id)}
                                aria-label="삭제"
                              >
                                <Trash2 size={16} />
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

            {(isOwner || user?.role === 'ADMIN') && (
              <div className="settings-section" style={{ marginTop: 'var(--space-xl)' }}>
                <button
                  className="settings-item"
                  style={{ color: 'var(--color-danger)' }}
                  onClick={async () => {
                    if (window.confirm('정말 이 모임을 삭제하시겠습니까? (복구할 수 없습니다)')) {
                      try {
                        await api.delete(`/rooms/${id}`)
                        navigate('/', { replace: true })
                      } catch {
                        alert('모임 삭제에 실패했습니다.')
                      }
                    }
                  }}
                >
                  <span className="settings-item-icon"><Trash2 size={20} /></span>
                  <span style={{ flex: 1 }}>모임 방 삭제</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 모달들 */}
      {showCreateSchedule && (
        <CreateScheduleModal
          roomId={id}
          schedule={editingSchedule}
          defaultDate={selectedDate}
          onClose={() => { setShowCreateSchedule(false); setEditingSchedule(null); setSelectedDate('') }}
          onCreated={handleScheduleCreated}
        />
      )}
      {showInvite && (
        <InviteCodeModal
          roomId={id}
          roomName={room?.name}
          onClose={() => setShowInvite(false)}
        />
      )}

      {/* 멤버 상세보기 모달 */}
      {viewingMember && (
        <div className="modal-overlay" onClick={() => setViewingMember(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-md)', paddingBottom: 'var(--space-lg)' }}>
              <div className="member-avatar" style={{ width: '72px', height: '72px', fontSize: 'var(--font-size-2xl)' }}>
                {viewingMember.profileImage ? (
                  <img
                    src={viewingMember.profileImage.startsWith('http') ? viewingMember.profileImage : `${import.meta.env.VITE_API_URL}${viewingMember.profileImage}`}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  />
                ) : getInitial(viewingMember.nickname)}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: '4px' }}>
                  {viewingMember.nickname}
                  {viewingMember.userId === user?.id && <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}> (나)</span>}
                </div>
                <div style={{ display: 'inline-block', background: viewingMember.role === 'OWNER' ? 'var(--color-primary-light)' : 'var(--color-bg)', color: viewingMember.role === 'OWNER' ? 'var(--color-primary)' : 'var(--color-text-secondary)', borderRadius: 'var(--radius-full)', padding: '2px 12px', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  {viewingMember.role === 'OWNER' ? '방장' : '멤버'}
                </div>
              </div>
            </div>
            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setViewingMember(null)}>
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 거절 확인 모달 */}
      {rejectConfirmUserId && (
        <div className="modal-overlay" onClick={() => setRejectConfirmUserId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 'var(--max-width)' }}>
            <div className="modal-handle" />
            <h2 className="modal-title">가입 거절</h2>
            <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xl)' }}>
              이 멤버의 가입을 거절하시겠습니까?<br />
              <span style={{ fontSize: 'var(--font-size-sm)' }}>거절된 멤버에게 알림이 표시됩니다.</span>
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setRejectConfirmUserId(null)}>
                취소
              </button>
              <button
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={async () => {
                  await handleReject(rejectConfirmUserId)
                  setRejectConfirmUserId(null)
                }}
              >
                거절하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
