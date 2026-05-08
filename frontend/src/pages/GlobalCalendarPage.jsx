import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TabBar, IconButton } from '../components/MoimUI'
import { IPlus } from '../components/Icons'
import { MonthCalendar } from '../components/Calendar'
import api from '../api'
import LoadingSpinner from '../components/LoadingSpinner'

const EVENT_COLORS = ['coral', 'mustard', 'sage', 'plum', 'sky', 'rose']
const hashColor = (id) => EVENT_COLORS[Math.abs(id || 0) % EVENT_COLORS.length]

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function AgendaItem({ schedule, rooms }) {
  const d = new Date(schedule.eventDate)
  const color = hashColor(schedule.id)
  const room = rooms.find(r => r.roomId === schedule.roomId)
  return (
    <div style={{
      display: 'flex', gap: 10,
      background: 'var(--surface)', border: '1px solid var(--paper-200)',
      borderRadius: 'var(--r-md)', padding: '10px 12px',
    }}>
      <div style={{ width: 4, borderRadius: 4, background: `var(--tag-${color})`, alignSelf: 'stretch' }}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>{schedule.title}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 500, marginTop: 1 }}>
          {schedule.eventTime || '종일'} · {room?.roomName || '모임'}
        </div>
      </div>
    </div>
  )
}

export default function GlobalCalendarPage() {
  const navigate = useNavigate()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [rooms, setRooms] = useState([])
  const [allSchedules, setAllSchedules] = useState([])
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const roomsRes = await api.get('/rooms')
      const approved = roomsRes.data.filter(r => r.status === 'APPROVED')
      setRooms(approved)

      const schedResults = await Promise.all(
        approved.map(r => api.get(`/rooms/${r.roomId}/schedules`).catch(() => ({ data: [] })))
      )
      const all = schedResults.flatMap((res, i) =>
        (res.data || []).map(s => ({ ...s, roomId: approved[i].roomId }))
      )
      setAllSchedules(all)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const filtered = selectedRoomId
    ? allSchedules.filter(s => s.roomId === selectedRoomId)
    : allSchedules

  // Build events map for calendar
  const eventsMap = {}
  filtered.forEach(s => {
    const key = s.eventDate
    if (!eventsMap[key]) eventsMap[key] = []
    eventsMap[key].push({ color: hashColor(s.id) })
  })

  const todayObj = { y: today.getFullYear(), m: today.getMonth() + 1, d: today.getDate() }

  // Upcoming schedules (sorted, after today)
  const todayStr = today.toISOString().slice(0, 10)
  const upcoming = filtered
    .filter(s => s.eventDate >= todayStr)
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
    .slice(0, 10)

  // Group upcoming by date
  const byDate = {}
  upcoming.forEach(s => {
    if (!byDate[s.eventDate]) byDate[s.eventDate] = []
    byDate[s.eventDate].push(s)
  })

  if (loading) {
    return <div className="loading-page"><LoadingSpinner /></div>
  }

  return (
    <div className="moim paper-grain" style={{
      width: '100%', height: '100dvh', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', background: 'var(--paper-50)',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 700 }}>전체 일정</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em', margin: 0 }}>{year}년 {month}월</h1>
        </div>
      </div>

      {/* Room filter chips */}
      {rooms.length > 1 && (
        <div style={{ padding: '12px 20px', display: 'flex', gap: 6, overflowX: 'auto' }}>
          <button onClick={() => setSelectedRoomId(null)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '7px 13px', borderRadius: 'var(--r-pill)',
            background: !selectedRoomId ? 'var(--ink-900)' : 'var(--surface)',
            color: !selectedRoomId ? 'var(--paper-50)' : 'var(--ink-700)',
            border: !selectedRoomId ? 'none' : '1px solid var(--paper-200)',
            fontSize: 13, fontWeight: 700, flexShrink: 0, cursor: 'pointer', fontFamily: 'inherit',
          }}>전체</button>
          {rooms.map(r => {
            const active = selectedRoomId === r.roomId
            return (
              <button key={r.roomId} onClick={() => setSelectedRoomId(active ? null : r.roomId)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '7px 13px', borderRadius: 'var(--r-pill)',
                background: active ? 'var(--ink-900)' : 'var(--surface)',
                color: active ? 'var(--paper-50)' : 'var(--ink-700)',
                border: active ? 'none' : '1px solid var(--paper-200)',
                fontSize: 13, fontWeight: 700, flexShrink: 0, cursor: 'pointer', fontFamily: 'inherit',
              }}>{r.roomName}</button>
            )
          })}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 96px' }}>
        <MonthCalendar
          year={year} month={month}
          today={todayObj}
          events={eventsMap}
          selected={null}
          onSelect={() => {}}
          onPrev={() => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else { setMonth(m => m - 1) } }}
          onNext={() => { if (month === 12) { setMonth(1); setYear(y => y + 1) } else { setMonth(m => m + 1) } }}
          compact
        />

        {upcoming.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-700)', marginBottom: 10, paddingLeft: 4 }}>다가오는 일정</h2>
            {Object.entries(byDate).map(([dateStr, items]) => {
              const d = new Date(dateStr)
              const diffDays = Math.round((d - today) / 86400000)
              const badge = diffDays === 0 ? '오늘' : diffDays === 1 ? '내일' : `${diffDays}일 뒤`
              return (
                <div key={dateStr} style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
                  <div style={{ width: 44, flexShrink: 0, textAlign: 'center', paddingTop: 4 }}>
                    <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>{d.getDate()}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-500)', marginTop: 2 }}>{d.getMonth()+1}월 {WEEKDAYS[d.getDay()]}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600, marginBottom: 6 }}>{badge}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {items.map(s => <AgendaItem key={s.id} schedule={s} rooms={rooms}/>)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {upcoming.length === 0 && allSchedules.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-500)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>다가오는 일정이 없어요</div>
          </div>
        )}
      </div>

      <TabBar/>
    </div>
  )
}
