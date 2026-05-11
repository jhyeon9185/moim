import React, { useState, useEffect } from 'react'

export default function LoadingSpinner() {
  const [showSlowMessage, setShowSlowMessage] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSlowMessage(true)
    }, 4000) // 4초 이상 걸리면 메시지 표시
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', gap: 20 }}>
      <div className="loader">
        <span></span>
        <span></span>
        <span></span>
      </div>
      {showSlowMessage && (
        <div style={{ 
          textAlign: 'center', 
          animation: 'fadeIn 0.5s ease-in',
          color: 'var(--ink-500)',
          fontSize: 14,
          lineHeight: 1.6
        }}>
          서버가 깨어나는 중입니다...<br/>
          최대 1분이 소요될 수 있습니다.
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
