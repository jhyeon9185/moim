import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './Modal.css'

export default function Modal({ isOpen, onClose, title, children, className = '' }) {
  const [isDragging, setIsDragging] = useState(false)
  const [offsetY, setOffsetY] = useState(0)
  const startY = useRef(0)
  const contentRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    } else {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    const currentY = e.touches[0].clientY
    const deltaY = currentY - startY.current
    if (deltaY > 0) {
      setOffsetY(deltaY)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    if (offsetY > 100) {
      onClose()
    }
    setOffsetY(0)
  }

  return createPortal(
    <div className={`modal-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}>
      <div
        ref={contentRef}
        className={`modal-content ${className}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: `translateY(${offsetY}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div 
          className="modal-handle-area" 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="modal-handle" />
        </div>
        
        {title && <h2 className="modal-title">{title}</h2>}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
