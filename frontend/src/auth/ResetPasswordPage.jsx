import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../api'
import './LoginPage.css'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [form, setForm] = useState({ newPassword: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.newPassword || !form.confirm) { setError('모든 항목을 입력해주세요.'); return }
    if (form.newPassword.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return }
    if (form.newPassword !== form.confirm) { setError('비밀번호가 일치하지 않습니다.'); return }
    setSubmitting(true); setError('')
    try {
      await api.post('/auth/reset-password', { token, newPassword: form.newPassword })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || '비밀번호 재설정에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--color-danger)', marginBottom: '16px' }}>유효하지 않은 링크입니다.</p>
          <button className="btn btn-primary btn-full" onClick={() => navigate('/login')}>로그인으로 이동</button>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-logo">
        <img src="/moim_main.png" alt="모임" className="login-logo-img" />
        <p className="login-logo-desc">소중한 사람들과 특별한 순간들</p>
      </div>

      <div className="login-card">
        <div className="forgot-title">새 비밀번호 설정</div>

        {success ? (
          <div className="forgot-sent">
            <div className="forgot-sent-icon">✅</div>
            <p>비밀번호가 성공적으로 변경되었습니다!</p>
            <button className="btn btn-primary btn-full" style={{ marginTop: '16px' }} onClick={() => navigate('/login')}>
              로그인하러 가기
            </button>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="login-error">{error}</div>}
            <div className="input-group">
              <label className="input-label">새 비밀번호</label>
              <input className="input-field" type="password" placeholder="6자 이상"
                value={form.newPassword} onChange={e => { setForm(f => ({ ...f, newPassword: e.target.value })); setError('') }}
                autoComplete="new-password" autoFocus />
            </div>
            <div className="input-group">
              <label className="input-label">비밀번호 확인</label>
              <input className="input-field" type="password" placeholder="비밀번호 재입력"
                value={form.confirm} onChange={e => { setForm(f => ({ ...f, confirm: e.target.value })); setError('') }}
                autoComplete="new-password" />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
              {submitting ? <span className="spinner" style={{ width: 22, height: 22, borderWidth: 2 }} /> : '비밀번호 변경'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
