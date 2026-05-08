import { useState } from 'react'
import api from '../api'

export default function CreateScheduleModal({ roomId, onClose, onCreated, defaultDate = '', schedule = null }) {
  const isEdit = !!schedule
  const [form, setForm] = useState({
    title: schedule?.title ?? '',
    eventDate: schedule?.eventDate ?? defaultDate,
    eventTime: schedule?.eventTime ?? '',
    location: schedule?.location ?? '',
    description: schedule?.description ?? '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <h2 className="modal-title">{isEdit ? '일정 수정' : '일정 추가'}</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {error && <div className="login-error">{error}</div>}

          <div className="input-group">
            <label className="input-label" htmlFor="schedule-title">무슨 모임인가요?</label>
            <input
              id="schedule-title"
              className="input-field"
              type="text"
              name="title"
              placeholder="예) 어버이날 가족 식사"
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

          <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
            {submitting ? (isEdit ? '수정 중...' : '추가 중...') : (isEdit ? '수정하기' : '일정 추가하기')}
          </button>

          <button type="button" className="btn btn-secondary btn-full" onClick={onClose}>
            취소
          </button>
        </form>
      </div>
    </div>
  )
}
