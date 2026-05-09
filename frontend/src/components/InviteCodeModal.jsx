import { useState } from 'react'
import { Clock, Link as LinkIcon } from 'lucide-react'
import { IDesignMail } from './Icons'
import api from '../api'
import Modal from './Modal'

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
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareKakao = () => {
    if (!window.Kakao?.isInitialized()) {
      alert('카카오톡 공유를 사용할 수 없습니다.')
      return
    }

    const origin = import.meta.env.VITE_FRONTEND_URL || window.location.origin
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
    <Modal isOpen={true} onClose={onClose} title="초대 코드">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        {code ? (
          <>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>
              아래 코드를 친구에게 보내주세요
            </p>

            <div style={{
              width: '100%', padding: '20px 16px',
              background: 'var(--color-primary-light)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}>
              <span style={{
                fontSize: 32, fontWeight: 900, letterSpacing: 6,
                color: 'var(--color-primary-dark)', fontFamily: 'monospace',
              }}>{code}</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} /> 24시간 후 만료 · 여러 명 사용 가능
              </span>
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-kakao btn-full" onClick={shareKakao}>
                <img src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png" alt="" style={{ width: 20, height: 20, marginRight: 6 }} />
                카카오톡으로 공유하기
              </button>
              <button className="btn btn-secondary btn-full" onClick={copyCode}>
                {copied ? '✓ 복사됨!' : <><LinkIcon size={15} style={{ marginRight: 6 }} />코드 복사하기</>}
              </button>
              <button className="btn btn-ghost btn-full" onClick={onClose}>닫기</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ padding: '8px 0 4px', color: 'var(--color-primary)' }}>
              <IDesignMail size={52} />
            </div>
            <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
              초대 코드를 만들어<br />친구를 모임에 초대하세요
            </p>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-primary btn-full" onClick={generateCode} disabled={loading}>
                {loading ? '만드는 중...' : '초대 코드 만들기'}
              </button>
              <button className="btn btn-ghost btn-full" onClick={onClose}>닫기</button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
