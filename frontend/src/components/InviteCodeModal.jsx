import { useState } from 'react'
import { Clock, Link as LinkIcon } from 'lucide-react'
import api from '../api'

export default function InviteCodeModal({ roomId, roomName, onClose }) {
  const [code, setCode] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateCode = async () => {
    setLoading(true)
    try {
      const res = await api.post(`/rooms/${roomId}/invite`)
      setCode(res.data.code)
    } catch { /* 에러 처리 */ }
    finally { setLoading(false) }
  }

  const copyCode = async () => {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const el = document.createElement('textarea')
      el.value = code
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareKakao = () => {
    if (!window.Kakao?.isInitialized()) {
      alert('카카오톡 공유를 사용할 수 없습니다.')
      return
    }

    const origin = window.location.origin
    const name = roomName ? `"${roomName}" ` : ''
    
    window.Kakao.Share.sendDefault({
      objectType: 'text',
      text: `📬 ${name}모임 초대 코드: ${code}\n⏰ 24시간 이내 1회 사용 가능`,
      link: {
        mobileWebUrl: origin,
        webUrl: origin,
      },
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <h2 className="modal-title">초대 코드</h2>

        {code ? (
          <>
            <p style={{ textAlign: 'center', fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
              아래 코드를 가족에게 보내주세요
            </p>

            <div className="invite-code-display">
              <span className="invite-code-text">{code}</span>
            </div>

            <p style={{ textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)', margin: 'var(--space-sm) 0 var(--space-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Clock size={14} /> 24시간 후 만료 · 1회만 사용 가능
            </p>

            <button className="btn btn-kakao btn-full" onClick={shareKakao} style={{ marginBottom: 'var(--space-sm)' }}>
              <img src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png" alt="" style={{ width: '22px', height: '22px', marginRight: '6px' }} />
              카카오톡으로 공유하기
            </button>

            <button className="btn btn-secondary btn-full" onClick={copyCode}>
              {copied ? '✓ 복사됨!' : '코드 복사하기'}
            </button>
          </>
        ) : (
          <>
            <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
              <div className="empty-state-icon">
                <LinkIcon size={48} strokeWidth={1.5} color="var(--color-primary)" />
              </div>
              <p className="empty-state-desc">
                초대 코드를 만들어<br />가족을 모임에 초대하세요
              </p>
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={generateCode}
              disabled={loading}
            >
              {loading ? '만드는 중...' : '초대 코드 만들기'}
            </button>
          </>
        )}

        <button
          className="btn btn-secondary btn-full"
          onClick={onClose}
          style={{ marginTop: 'var(--space-sm)' }}
        >
          닫기
        </button>
      </div>
    </div>
  )
}
