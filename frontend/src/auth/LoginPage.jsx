import { useState } from 'react'
import { useAuth } from './AuthContext'
import { useIsDesktop } from '../hooks/useIsDesktop'
import { IDesignHouse, IDesignClock, IDesignPin, IDesignMail } from '../components/Icons'
import api from '../api'

const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_OAUTH_REDIRECT_URI || `${window.location.origin}/oauth/callback`

const KakaoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4.5C7 4.5 3 7.7 3 11.6c0 2.5 1.7 4.7 4.3 5.9l-1 3.5c-.1.4.3.7.6.5l4.1-2.7c.3 0 .7.1 1 .1 5 0 9-3.2 9-7.1S17 4.5 12 4.5Z"/>
  </svg>
)

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2a9.7 9.7 0 0 0 3-7.3z"/>
    <path fill="#34A853" d="M12 22a9.5 9.5 0 0 0 6.6-2.4l-3.2-2.5a6 6 0 0 1-9-3.1H3.1v2.5A10 10 0 0 0 12 22z"/>
    <path fill="#FBBC04" d="M6.4 14a6 6 0 0 1 0-3.8V7.7H3.1a10 10 0 0 0 0 8.7L6.4 14z"/>
    <path fill="#EA4335" d="M12 6.2a5.4 5.4 0 0 1 3.8 1.5l2.9-2.9A9.6 9.6 0 0 0 12 2 10 10 0 0 0 3.1 7.7l3.3 2.5A6 6 0 0 1 12 6.2z"/>
  </svg>
)

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 31.47 44.03" width="36" height="36" fill="var(--clay)">
    <path d="m31.47,36.72v-18.46c0-1.02-.83-1.85-1.8-1.85H8.76v-5.77c0-3.85,3.13-6.98,6.98-6.98s6.99,3.13,6.99,6.98c0,1.01.82,1.83,1.83,1.83s1.83-.82,1.83-1.83C26.38,4.77,21.61,0,15.74,0S5.11,4.77,5.11,10.64v5.77H1.85c-1.02,0-1.85.83-1.85,1.85v23.97c0,.97.83,1.8,1.85,1.8h27.81c.97,0,1.8-.83,1.8-1.8v-1.85H3.65v-20.31h3.12c.05,0,.1.02.16.02s.1-.01.16-.02h20.73v16.66h3.65Z" />
    <path d="m15.74,35.74c1.01,0,1.83-.82,1.83-1.83v-2.65c1.17-.65,1.96-1.87,1.96-3.3,0-2.09-1.7-3.79-3.79-3.79s-3.79,1.7-3.79,3.79c0,1.43.8,2.65,1.96,3.3v2.65c0,1.01.82,1.83,1.83,1.83Z" />
  </svg>
)

const inputStyle = {
  width: '100%', height: 52, padding: '0 14px',
  background: 'var(--surface-sunken)', border: '1.5px solid transparent',
  borderRadius: 'var(--r-md)', outline: 'none',
  fontSize: 16, fontWeight: 500, color: 'var(--ink-900)',
  letterSpacing: '-0.01em', fontFamily: 'inherit',
}

function Field({ label, value, onChange, type = 'text', placeholder, autoFocus, autoComplete }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--ink-700)', marginBottom: 6, paddingLeft: 4 }}>{label}</label>}
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} autoFocus={autoFocus} autoComplete={autoComplete}
        style={{ ...inputStyle, ...(focused ? { borderColor: 'var(--clay)' } : {}) }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  )
}

export default function LoginPage() {
  const { login, signup } = useAuth()
  const isDesktop = useIsDesktop(1280)

  const [mode, setMode] = useState('login')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupStep, setSignupStep] = useState(1)
  const [signupEmail, setSignupEmail] = useState('')
  const [signupCode, setSignupCode] = useState('')
  const [signupForm, setSignupForm] = useState({ nickname: '', password: '', passwordConfirm: '' })
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const clearError = () => setError('')
  const switchMode = (next) => {
    setMode(next); setError('')
    setSignupStep(1); setSignupEmail(''); setSignupCode('')
    setSignupForm({ nickname: '', password: '', passwordConfirm: '' })
    setForgotEmail(''); setForgotSent(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!loginForm.email || !loginForm.password) { setError('이메일과 비밀번호를 입력해주세요.'); return }
    setSubmitting(true); clearError()
    try { await login(loginForm.email, loginForm.password) }
    catch (err) { setError(err.response?.data?.message || '이메일 또는 비밀번호를 확인해주세요.') }
    finally { setSubmitting(false) }
  }

  const handleSendCode = async (e) => {
    e.preventDefault()
    if (!signupEmail) { setError('이메일을 입력해주세요.'); return }
    if (!agreed) { setError('개인정보처리방침에 동의해주세요.'); return }
    setSubmitting(true); clearError()
    try { await api.post('/auth/send-verification', { email: signupEmail }); setSignupStep(2) }
    catch (err) { setError(err.response?.data?.message || '인증 코드 발송에 실패했습니다.') }
    finally { setSubmitting(false) }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    if (!signupCode) { setError('인증 코드를 입력해주세요.'); return }
    setSubmitting(true); clearError()
    try { await api.post('/auth/verify-email', { email: signupEmail, code: signupCode }); setSignupStep(3) }
    catch (err) { setError(err.response?.data?.message || '인증 코드가 올바르지 않습니다.') }
    finally { setSubmitting(false) }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    const { nickname, password, passwordConfirm } = signupForm
    if (!nickname || !password) { setError('모든 항목을 입력해주세요.'); return }
    if (password !== passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return }
    if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return }
    if (!agreed) { setError('개인정보처리방침에 동의해주세요.'); return }
    setSubmitting(true); clearError()
    try { await signup(signupEmail, password, nickname, agreed) }
    catch (err) { setError(err.response?.data?.message || '회원가입에 실패했습니다.') }
    finally { setSubmitting(false) }
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    if (!forgotEmail) { setError('이메일을 입력해주세요.'); return }
    setSubmitting(true); clearError()
    try { await api.post('/auth/forgot-password', { email: forgotEmail }); setForgotSent(true) }
    catch (err) { setError(err.response?.data?.message || '요청에 실패했습니다.') }
    finally { setSubmitting(false) }
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

  const primaryBtn = {
    width: '100%', height: 52, borderRadius: 'var(--r-md)',
    background: 'var(--clay)', color: '#fff', border: 'none',
    fontSize: 15.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    letterSpacing: '-0.015em', marginTop: 4,
    opacity: submitting ? 0.65 : 1,
  }

  const formBody = (
    <>
      {/* ── 로그인 ── */}
      {mode === 'login' && (
        <>
          <button type="button" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', height: 52, borderRadius: 'var(--r-md)',
            background: '#FEE500', color: '#181600', border: 'none', cursor: 'pointer',
            fontSize: 15.5, fontWeight: 700, marginBottom: 10, fontFamily: 'inherit',
          }} onClick={handleKakaoLogin}>
            <KakaoIcon/> 카카오로 시작하기
          </button>
          <button type="button" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            width: '100%', height: 52, borderRadius: 'var(--r-md)',
            background: 'var(--surface)', color: 'var(--ink-900)',
            border: '1.5px solid var(--paper-200)', cursor: 'pointer',
            fontSize: 15.5, fontWeight: 700, marginBottom: 0, fontFamily: 'inherit',
          }} onClick={handleGoogleLogin}>
            <GoogleIcon/> 구글로 시작하기
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 14px' }}>
            <span style={{ flex: 1, height: 1, background: 'var(--paper-200)' }}/>
            <span style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 600 }}>또는 이메일</span>
            <span style={{ flex: 1, height: 1, background: 'var(--paper-200)' }}/>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
            {error && <div className="login-error" style={{ marginBottom: 12 }}>{error}</div>}
            <Field label="이메일" value={loginForm.email} onChange={e => { setLoginForm(f => ({ ...f, email: e.target.value })); clearError() }} type="email" placeholder="example@email.com" autoComplete="email"/>
            <Field label="비밀번호" value={loginForm.password} onChange={e => { setLoginForm(f => ({ ...f, password: e.target.value })); clearError() }} type="password" placeholder="비밀번호 입력" autoComplete="current-password"/>
            <button type="submit" style={primaryBtn} disabled={submitting}>
              {submitting ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}/> : '로그인'}
            </button>
            <button type="button" onClick={() => switchMode('forgot')} style={{ background: 'none', border: 'none', color: 'var(--ink-500)', fontSize: 13, cursor: 'pointer', padding: '10px 0', textAlign: 'center', fontFamily: 'inherit', textDecoration: 'underline' }}>
              비밀번호를 잊으셨나요?
            </button>
          </form>
        </>
      )}

      {/* ── 회원가입 ── */}
      {mode === 'signup' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            {[1,2,3].map((n, idx) => (
              <div key={n} style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: signupStep >= n ? 'var(--clay)' : 'var(--paper-200)',
                    color: signupStep >= n ? '#fff' : 'var(--ink-500)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                  }}>{signupStep > n ? '✓' : n}</div>
                  <span style={{ fontSize: 11, color: signupStep === n ? 'var(--clay)' : 'var(--ink-500)', fontWeight: 600, whiteSpace: 'nowrap' }}>{signupStepLabel[n]}</span>
                </div>
                {idx < 2 && <div style={{ height: 1.5, flex: 0.8, background: signupStep > n ? 'var(--clay)' : 'var(--paper-200)', marginBottom: 18 }}/>}
              </div>
            ))}
          </div>

          {error && <div className="login-error" style={{ marginBottom: 12 }}>{error}</div>}

          {signupStep === 1 && (
            <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column' }}>
              <Field label="이메일" value={signupEmail} onChange={e => { setSignupEmail(e.target.value); clearError() }} type="email" placeholder="가입할 이메일 주소" autoFocus autoComplete="email"/>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, margin: '4px 0 16px', padding: '0 4px' }}>
                <input 
                  type="checkbox" id="privacy-step1" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                  style={{ width: 18, height: 18, marginTop: 2, accentColor: 'var(--clay)', cursor: 'pointer' }}
                />
                <label htmlFor="privacy-step1" style={{ fontSize: 13, color: 'var(--ink-700)', fontWeight: 500, cursor: 'pointer', lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 700 }}>(필수)</span> <span style={{ textDecoration: 'underline' }}>개인정보처리방침</span>에 동의합니다.
                </label>
              </div>

              <button type="submit" style={primaryBtn} disabled={submitting}>
                {submitting ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}/> : '인증 코드 받기'}
              </button>
            </form>
          )}

          {signupStep === 2 && (
            <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--ink-500)', marginBottom: 16, lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--clay)' }}>{signupEmail}</strong>으로<br/>인증 코드를 보냈습니다.
              </div>
              <Field label="인증 코드 6자리" value={signupCode} onChange={e => { setSignupCode(e.target.value.replace(/\D/g, '')); clearError() }} type="text" placeholder="000000" autoFocus/>
              <button type="submit" style={primaryBtn} disabled={submitting || signupCode.length !== 6}>
                {submitting ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}/> : '인증하기'}
              </button>
              <button type="button" onClick={() => { setSignupStep(1); clearError() }} style={{ background: 'none', border: 'none', color: 'var(--ink-500)', fontSize: 13, cursor: 'pointer', padding: '10px 0', textAlign: 'center', fontFamily: 'inherit', textDecoration: 'underline' }}>
                이메일 다시 입력하기
              </button>
            </form>
          )}

          {signupStep === 3 && (
            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--success)', background: 'var(--tag-sage-bg)', borderRadius: 'var(--r-sm)', padding: '8px 12px', marginBottom: 14, fontWeight: 600 }}>
                ✓ 이메일 인증 완료
              </div>
              <Field label="닉네임" value={signupForm.nickname} onChange={e => { setSignupForm(f => ({ ...f, nickname: e.target.value })); clearError() }} placeholder="지인에게 보여줄 이름" autoFocus/>
              <Field label="비밀번호" value={signupForm.password} onChange={e => { setSignupForm(f => ({ ...f, password: e.target.value })); clearError() }} type="password" placeholder="6자 이상" autoComplete="new-password"/>
              <Field label="비밀번호 확인" value={signupForm.passwordConfirm} onChange={e => { setSignupForm(f => ({ ...f, passwordConfirm: e.target.value })); clearError() }} type="password" placeholder="비밀번호 재입력" autoComplete="new-password"/>
              
              <button type="submit" style={primaryBtn} disabled={submitting}>
                {submitting ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}/> : '가입 완료'}
              </button>
            </form>
          )}
        </>
      )}

      {/* ── 비밀번호 찾기 ── */}
      {mode === 'forgot' && (
        <>
          {forgotSent ? (
            <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <IDesignMail size={64} color="var(--clay)" />
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-900)', lineHeight: 1.8, marginBottom: 8 }}>
                <strong>{forgotEmail}</strong>으로<br/>재설정 링크를 보냈습니다.
              </p>
              <p style={{ fontSize: 13.5, color: 'var(--ink-500)', lineHeight: 1.7, marginBottom: 20 }}>
                메일함을 확인해주세요.<br/>스팸함에 있을 수도 있어요.
              </p>
              <button style={primaryBtn} onClick={() => switchMode('login')}>로그인으로 돌아가기</button>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  <LockIcon/>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 6 }}>비밀번호 재설정</div>
                <p style={{ fontSize: 13.5, color: 'var(--ink-500)', lineHeight: 1.6, margin: 0 }}>
                  가입한 이메일 주소를 입력하면<br/>비밀번호 재설정 링크를 보내드립니다.
                </p>
              </div>
              <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column' }}>
                {error && <div className="login-error" style={{ marginBottom: 12 }}>{error}</div>}
                <Field label="이메일" value={forgotEmail} onChange={e => { setForgotEmail(e.target.value); clearError() }} type="email" placeholder="가입한 이메일 주소" autoFocus/>
                <button type="submit" style={primaryBtn} disabled={submitting}>
                  {submitting ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}/> : '재설정 링크 받기'}
                </button>
              </form>
            </>
          )}
        </>
      )}

      {/* 하단 링크 */}
      <div style={{ textAlign: 'center', paddingTop: 20, fontSize: 13.5, color: 'var(--ink-500)' }}>
        {mode === 'login' && (
          <>처음이신가요? <button onClick={() => switchMode('signup')} style={{ background: 'none', border: 'none', color: 'var(--clay)', fontWeight: 700, cursor: 'pointer', fontSize: 13.5, fontFamily: 'inherit' }}>회원가입</button></>
        )}
        {mode === 'signup' && (
          <>이미 계정이 있으신가요? <button onClick={() => switchMode('login')} style={{ background: 'none', border: 'none', color: 'var(--clay)', fontWeight: 700, cursor: 'pointer', fontSize: 13.5, fontFamily: 'inherit' }}>로그인</button></>
        )}
        {mode === 'forgot' && !forgotSent && (
          <button onClick={() => switchMode('login')} style={{ background: 'none', border: 'none', color: 'var(--clay)', fontWeight: 700, cursor: 'pointer', fontSize: 13.5, fontFamily: 'inherit' }}>← 로그인으로 돌아가기</button>
        )}
      </div>
    </>
  )

  // ─── 데스크탑 레이아웃 (1280px 이상) ──────────────────────────────
  if (isDesktop) {
    return (
      <div className="moim" style={{ display: 'flex', width: '100%', height: '100dvh', overflow: 'hidden' }}>
        {/* 왼쪽 브랜드 패널 */}
        <div style={{
          width: '52%', flexShrink: 0,
          background: 'linear-gradient(150deg, var(--clay) 0%, #9C4830 100%)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '64px 72px',
          color: '#fff', position: 'relative', overflow: 'hidden',
        }}>
          {/* 배경 원 장식 */}
          <div style={{ position: 'absolute', width: 480, height: 480, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', top: -120, right: -140, pointerEvents: 'none' }}/>
          <div style={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', bottom: -80, left: -80, pointerEvents: 'none' }}/>

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '100%', maxWidth: 420 }}>
            <div style={{ marginBottom: 28 }}>
              <img
                src="/moim_main.png"
                alt="모임"
                style={{
                  width: 96, height: 96,
                  borderRadius: 24,
                  objectFit: 'cover',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
                  display: 'inline-block',
                }}
              />
            </div>
            <h1 style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14, lineHeight: 1 }}>MOIM</h1>
            <p style={{ fontSize: 18, fontWeight: 500, opacity: 0.88, lineHeight: 1.7, marginBottom: 52 }}>
              소중한 사람들과<br/>특별한 순간을 함께
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
              {[
                { Icon: IDesignHouse, text: '지인 모임 일정을 한눈에 관리' },
                { Icon: IDesignClock, text: '카카오·구글 간편 로그인' },
                { Icon: IDesignPin, text: 'AI 일정 도우미 Momi와 함께' },
              ].map(({ Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 'var(--r-sm)',
                    background: 'var(--tag-mustard-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={22} color="var(--clay)" />
                  </div>
                  <span style={{ fontSize: 15.5, fontWeight: 600, opacity: 0.92, color: '#fff' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 오른쪽 폼 패널 */}
        <div style={{
          flex: 1,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '48px 64px',
          background: 'var(--paper-50)',
          overflowY: 'auto',
        }}>
          <div style={{ width: '100%', maxWidth: 420 }}>
            {/* 모드 타이틀 */}
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 6 }}>
                {mode === 'login' && '로그인'}
                {mode === 'signup' && '회원가입'}
                {mode === 'forgot' && '비밀번호 재설정'}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--ink-500)', fontWeight: 500 }}>
                {mode === 'login' && '계정에 로그인해서 모임을 시작하세요'}
                {mode === 'signup' && '새 계정을 만들어 모임에 합류하세요'}
                {mode === 'forgot' && '이메일로 재설정 링크를 받으세요'}
              </p>
            </div>
            {formBody}
          </div>
        </div>
      </div>
    )
  }

  // ─── 모바일 레이아웃 ────────────────────────────────────────────────
  return (
    <div className="moim paper-grain" style={{
      width: '100%', minHeight: '100dvh',
      display: 'flex', flexDirection: 'column',
      padding: '48px 24px 32px',
      background: 'linear-gradient(180deg, var(--paper-100) 0%, var(--paper-50) 50%)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ display: 'inline-block', marginBottom: 16 }}>
          <img
            src="/moim_main.png"
            alt="모임"
            style={{ width: 80, height: 80, borderRadius: 20, objectFit: 'cover', boxShadow: '0 8px 24px rgba(200,105,74,0.28)' }}
          />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.035em', marginBottom: 6 }}>MOIM</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-500)', fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.5, margin: 0 }}>
          소중한 사람들과<br/>특별한 순간을 함께
        </p>
      </div>

      <div style={{
        background: 'var(--surface)', border: '1px solid var(--paper-200)',
        borderRadius: 'var(--r-xl)', padding: 22,
        boxShadow: 'var(--shadow-2)', flex: 1,
      }}>
        {formBody}
      </div>
    </div>
  )
}
