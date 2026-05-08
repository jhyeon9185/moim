import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import api from '../api'
import './LoginPage.css'

const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_OAUTH_REDIRECT_URI || `${window.location.origin}/oauth/callback`

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 31.47 44.03" width="36" height="36" fill="var(--color-primary)">
    <path d="m31.47,36.72v-18.46c0-1.02-.83-1.85-1.8-1.85H8.76v-5.77c0-3.85,3.13-6.98,6.98-6.98s6.99,3.13,6.99,6.98c0,1.01.82,1.83,1.83,1.83s1.83-.82,1.83-1.83C26.38,4.77,21.61,0,15.74,0S5.11,4.77,5.11,10.64v5.77H1.85c-1.02,0-1.85.83-1.85,1.85v23.97c0,.97.83,1.8,1.85,1.8h27.81c.97,0,1.8-.83,1.8-1.8v-1.85H3.65v-20.31h3.12c.05,0,.1.02.16.02s.1-.01.16-.02h20.73v16.66h3.65Z" />
    <path d="m15.74,35.74c1.01,0,1.83-.82,1.83-1.83v-2.65c1.17-.65,1.96-1.87,1.96-3.3,0-2.09-1.7-3.79-3.79-3.79s-3.79,1.7-3.79,3.79c0,1.43.8,2.65,1.96,3.3v2.65c0,1.01.82,1.83,1.83,1.83Z" />
  </svg>
)

export default function LoginPage() {
  const { login, signup } = useAuth()
  const navigate = useNavigate()

  // 모드: 'login' | 'signup' | 'forgot'
  const [mode, setMode] = useState('login')

  // 로그인 폼
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })

  // 회원가입 단계: 1(이메일 입력) → 2(코드 확인) → 3(닉네임+비밀번호)
  const [signupStep, setSignupStep] = useState(1)
  const [signupEmail, setSignupEmail] = useState('')
  const [signupCode, setSignupCode] = useState('')
  const [signupForm, setSignupForm] = useState({ nickname: '', password: '', passwordConfirm: '' })

  // 비밀번호 찾기
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const clearError = () => setError('')

  const switchMode = (next) => {
    setMode(next)
    setError('')
    setSignupStep(1)
    setSignupEmail('')
    setSignupCode('')
    setSignupForm({ nickname: '', password: '', passwordConfirm: '' })
    setForgotEmail('')
    setForgotSent(false)
  }

  // ── 로그인 ──────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault()
    if (!loginForm.email || !loginForm.password) { setError('이메일과 비밀번호를 입력해주세요.'); return }
    setSubmitting(true); clearError()
    try {
      await login(loginForm.email, loginForm.password)
    } catch (err) {
      setError(err.response?.data?.message || '이메일 또는 비밀번호를 확인해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── 회원가입 Step 1: 인증 코드 발송 ────────────────────────────
  const handleSendCode = async (e) => {
    e.preventDefault()
    if (!signupEmail) { setError('이메일을 입력해주세요.'); return }
    setSubmitting(true); clearError()
    try {
      await api.post('/auth/send-verification', { email: signupEmail })
      setSignupStep(2)
    } catch (err) {
      setError(err.response?.data?.message || '인증 코드 발송에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── 회원가입 Step 2: 코드 확인 ──────────────────────────────────
  const handleVerifyCode = async (e) => {
    e.preventDefault()
    if (!signupCode) { setError('인증 코드를 입력해주세요.'); return }
    setSubmitting(true); clearError()
    try {
      await api.post('/auth/verify-email', { email: signupEmail, code: signupCode })
      setSignupStep(3)
    } catch (err) {
      setError(err.response?.data?.message || '인증 코드가 올바르지 않습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── 회원가입 Step 3: 계정 생성 ──────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault()
    const { nickname, password, passwordConfirm } = signupForm
    if (!nickname || !password) { setError('모든 항목을 입력해주세요.'); return }
    if (password !== passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return }
    if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return }
    setSubmitting(true); clearError()
    try {
      await signup(signupEmail, password, nickname)
    } catch (err) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── 비밀번호 찾기 ────────────────────────────────────────────────
  const handleForgot = async (e) => {
    e.preventDefault()
    if (!forgotEmail) { setError('이메일을 입력해주세요.'); return }
    setSubmitting(true); clearError()
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail })
      setForgotSent(true)
    } catch (err) {
      setError(err.response?.data?.message || '요청에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleKakaoLogin = () => {
    if (!KAKAO_CLIENT_ID) { setError('카카오 로그인 설정이 필요합니다.'); return }
    window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&state=kakao`
  }

  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) { setError('구글 로그인 설정이 필요합니다.'); return }
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=openid email profile&state=google`
  }

  const signupStepLabel = ['', '이메일 입력', '이메일 인증', '계정 설정']

  return (
    <div className="login-page">
      <div className="login-logo">
        <img src="/moim_main.png" alt="모임" className="login-logo-img" onClick={() => navigate('/')} />
        <p className="login-logo-desc">소중한 사람들과 특별한 순간들</p>
      </div>

      <div className="login-card">

        {/* ── 로그인 ── */}
        {mode === 'login' && (
          <>
            <div className="login-social">
              <button type="button" className="btn btn-kakao btn-full" onClick={handleKakaoLogin}>
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.72 1.8 5.108 4.516 6.467-.197.735-1.268 4.683-1.31 4.991 0 0-.025.208.11.287.135.078.293.018.293.018.387-.054 4.478-2.94 5.185-3.436.39.055.79.084 1.206.084 5.523 0 10-3.463 10-7.691S17.523 3 12 3z" /></svg>
                카카오로 시작하기
              </button>
              <button type="button" className="btn btn-google btn-full" onClick={handleGoogleLogin}>
                <svg viewBox="0 0 24 24" width="22" height="22"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                구글로 시작하기
              </button>
            </div>
            <div className="divider">또는</div>
            <form className="login-form" onSubmit={handleLogin}>
              {error && <div className="login-error">{error}</div>}
              <div className="input-group">
                <label className="input-label">이메일</label>
                <input className="input-field" type="email" placeholder="example@email.com"
                  value={loginForm.email} onChange={e => { setLoginForm(f => ({ ...f, email: e.target.value })); clearError() }} autoComplete="email" />
              </div>
              <div className="input-group">
                <label className="input-label">비밀번호</label>
                <input className="input-field" type="password" placeholder="비밀번호 입력"
                  value={loginForm.password} onChange={e => { setLoginForm(f => ({ ...f, password: e.target.value })); clearError() }} autoComplete="current-password" />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                {submitting ? <span className="spinner" style={{ width: 22, height: 22, borderWidth: 2 }} /> : '로그인'}
              </button>
              <button type="button" className="forgot-link" onClick={() => switchMode('forgot')}>
                비밀번호를 잊으셨나요?
              </button>
            </form>
            <div className="login-toggle">
              처음이신가요? <button onClick={() => switchMode('signup')}>회원가입</button>
            </div>
          </>
        )}

        {/* ── 회원가입 ── */}
        {mode === 'signup' && (
          <>
            <div className="signup-steps">
              {[1, 2, 3].map(n => (
                <div key={n} className={`signup-step ${signupStep === n ? 'active' : signupStep > n ? 'done' : ''}`}>
                  <div className="signup-step-dot">{signupStep > n ? '✓' : n}</div>
                  <span>{signupStepLabel[n]}</span>
                </div>
              ))}
            </div>

            {error && <div className="login-error" style={{ marginBottom: '12px' }}>{error}</div>}

            {signupStep === 1 && (
              <form className="login-form" onSubmit={handleSendCode}>
                <div className="input-group">
                  <label className="input-label">이메일</label>
                  <input className="input-field" type="email" placeholder="가입할 이메일 주소"
                    value={signupEmail} onChange={e => { setSignupEmail(e.target.value); clearError() }} autoComplete="email" autoFocus />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                  {submitting ? <span className="spinner" style={{ width: 22, height: 22, borderWidth: 2 }} /> : '인증 코드 받기'}
                </button>
              </form>
            )}

            {signupStep === 2 && (
              <form className="login-form" onSubmit={handleVerifyCode}>
                <div className="verify-info">
                  <span className="verify-email-text">{signupEmail}</span>으로<br />인증 코드를 보냈습니다.
                </div>
                <div className="input-group">
                  <label className="input-label">인증 코드 6자리</label>
                  <input className="input-field verify-code-input" type="text" inputMode="numeric"
                    placeholder="000000" maxLength={6}
                    value={signupCode} onChange={e => { setSignupCode(e.target.value.replace(/\D/g, '')); clearError() }} autoFocus />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={submitting || signupCode.length !== 6}>
                  {submitting ? <span className="spinner" style={{ width: 22, height: 22, borderWidth: 2 }} /> : '인증하기'}
                </button>
                <button type="button" className="forgot-link" onClick={() => { setSignupStep(1); clearError() }}>
                  이메일 다시 입력하기
                </button>
              </form>
            )}

            {signupStep === 3 && (
              <form className="login-form" onSubmit={handleSignup}>
                <div className="verify-success">✓ 이메일 인증 완료</div>
                <div className="input-group">
                  <label className="input-label">닉네임</label>
                  <input className="input-field" type="text" placeholder="지인에게 보여줄 이름"
                    value={signupForm.nickname} maxLength={16}
                    onChange={e => { setSignupForm(f => ({ ...f, nickname: e.target.value })); clearError() }} autoFocus />
                </div>
                <div className="input-group">
                  <label className="input-label">비밀번호</label>
                  <input className="input-field" type="password" placeholder="6자 이상"
                    value={signupForm.password} onChange={e => { setSignupForm(f => ({ ...f, password: e.target.value })); clearError() }} autoComplete="new-password" />
                </div>
                <div className="input-group">
                  <label className="input-label">비밀번호 확인</label>
                  <input className="input-field" type="password" placeholder="비밀번호 재입력"
                    value={signupForm.passwordConfirm} onChange={e => { setSignupForm(f => ({ ...f, passwordConfirm: e.target.value })); clearError() }} autoComplete="new-password" />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                  {submitting ? <span className="spinner" style={{ width: 22, height: 22, borderWidth: 2 }} /> : '가입 완료'}
                </button>
              </form>
            )}

            <div className="login-toggle">
              이미 계정이 있으신가요? <button onClick={() => switchMode('login')}>로그인</button>
            </div>
          </>
        )}

        {/* ── 비밀번호 찾기 ── */}
        {mode === 'forgot' && (
          <>
            {forgotSent ? (
              <div className="forgot-sent">
                <div className="forgot-sent-icon">📬</div>
                <p className="forgot-sent-title"><strong>{forgotEmail}</strong>으로<br />재설정 링크를 보냈습니다.</p>
                <p className="forgot-sent-sub">메일함을 확인해주세요.<br />스팸함에 있을 수도 있어요.</p>
                <button className="btn btn-primary btn-full" style={{ marginTop: '20px' }} onClick={() => switchMode('login')}>
                  로그인으로 돌아가기
                </button>
              </div>
            ) : (
              <>
                <div className="forgot-header">
                  <div className="forgot-icon-wrap"><LockIcon /></div>
                  <div className="forgot-title">비밀번호 재설정</div>
                  <p className="forgot-desc">가입한 이메일 주소를 입력하면<br />비밀번호 재설정 링크를 보내드립니다.</p>
                </div>
                <form className="login-form" onSubmit={handleForgot}>
                  {error && <div className="login-error">{error}</div>}
                  <div className="input-group">
                    <label className="input-label">이메일</label>
                    <input className="input-field" type="email" placeholder="가입한 이메일 주소"
                      value={forgotEmail} onChange={e => { setForgotEmail(e.target.value); clearError() }} autoFocus />
                  </div>
                  <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                    {submitting ? <span className="spinner" style={{ width: 22, height: 22, borderWidth: 2 }} /> : '재설정 링크 받기'}
                  </button>
                </form>
                <div className="login-toggle">
                  <button onClick={() => switchMode('login')}>← 로그인으로 돌아가기</button>
                </div>
              </>
            )}
          </>
        )}

      </div>
    </div>
  )
}
