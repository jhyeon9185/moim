import { useState, useRef, useEffect } from 'react'
import api from '../api'
import Modal from './Modal'
import './MomiChat.css'

export default function CreateScheduleModal({ roomId, availableRooms = [], onClose, onCreated, defaultDate = '', schedule = null }) {
  const isEdit = !!schedule
  const [targetRoomId, setTargetRoomId] = useState(roomId || (availableRooms.length > 0 ? availableRooms[0].roomId : 'personal'))
  const [form, setForm] = useState({
    title: schedule?.title ?? '',
    eventDate: schedule?.eventDate ?? defaultDate,
    eventTime: schedule?.eventTime ?? '',
    location: schedule?.location ?? '',
    description: schedule?.description ?? '',
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
    } catch (err) {
      const msg = err.response?.status === 429
        ? '하루 사용 한도(10회)에 도달했어요. 내일 다시 이용해주세요 🙏'
        : '오류가 발생했어요. 다시 시도해주세요 😥'
      setChatMessages([...next, { role: 'assistant', content: msg }])
    } finally {
      setChatLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('일정 제목을 입력해주세요.')
      return
    }
    if (!form.eventDate) {
      setError('날짜를 선택해주세요.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        title: form.title.trim(),
        eventDate: form.eventDate,
        eventTime: form.eventTime || null,
        location: form.location.trim() || null,
        description: form.description.trim() || null,
      }
      const isPersonal = !targetRoomId || targetRoomId === 'personal'
      if (isEdit) {
        const url = isPersonal ? `/schedules/${schedule.id}` : `/rooms/${targetRoomId}/schedules/${schedule.id}`
        await api.put(url, payload)
      } else {
        const url = isPersonal ? '/schedules' : `/rooms/${targetRoomId}/schedules`
        await api.post(url, payload)
      }
      onCreated()
    } catch {
      setError(isEdit ? '일정 수정에 실패했습니다.' : '일정 추가에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={isEdit ? '일정 수정' : '일정 추가'}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {error && <div className="login-error">{error}</div>}

        {!roomId && (
          <div className="input-group">
            <label className="input-label" htmlFor="schedule-room">어느 모임의 일정인가요?</label>
            <select
              id="schedule-room"
              className="input-field"
              value={targetRoomId}
              onChange={(e) => setTargetRoomId(e.target.value)}
            >
              <option value="personal">개인 일정</option>
              {availableRooms.map(r => (
                <option key={r.roomId} value={r.roomId}>{r.roomName}</option>
              ))}
            </select>
          </div>
        )}

        <div className="input-group">
          <label className="input-label" htmlFor="schedule-title">무슨 모임인가요?</label>
          <input
            id="schedule-title"
            className="input-field"
            type="text"
            name="title"
            placeholder="예) 지인들과의 저녁 식사"
            value={form.title}
            onChange={handleChange}
            autoFocus
          />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="schedule-date">날짜</label>
          <input
            id="schedule-date"
            className="input-field"
            type="date"
            name="eventDate"
            value={form.eventDate}
            onChange={handleChange}
            onClick={(e) => e.target.showPicker?.()}
          />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="schedule-time">시간 (선택)</label>
          <input
            id="schedule-time"
            className="input-field"
            type="time"
            name="eventTime"
            value={form.eventTime}
            onChange={handleChange}
            onClick={(e) => e.target.showPicker?.()}
          />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="schedule-location">장소 (선택)</label>
          <input
            id="schedule-location"
            className="input-field"
            type="text"
            name="location"
            placeholder="예) 할머니 댁"
            value={form.location}
            onChange={handleChange}
          />
        </div>

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
                  <div className="momi-msg assistant momi-typing">
                    <span /><span /><span />
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}

            <div className="momi-input-row">
              <input
                className="input-field momi-input"
                placeholder="예) 이날 비 올까요? 우산 챙겨야 해?"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleChatSend()}
                disabled={chatLoading}
              />
              <button
                className="btn btn-primary momi-send-btn"
                onClick={handleChatSend}
                disabled={chatLoading || !chatInput.trim()}
              >
                {chatLoading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : '전송'}
              </button>
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
          {submitting ? (isEdit ? '수정 중...' : '추가 중...') : (isEdit ? '수정하기' : '일정 추가하기')}
        </button>

        <button type="button" className="btn btn-secondary btn-full" onClick={onClose}>
          취소
        </button>
      </form>
    </Modal>
  )
}
