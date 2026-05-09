import { useEffect } from 'react'
import { useNotificationContext } from '../notification/NotificationContext'
import { AppHeader, TabBar } from '../components/MoimUI'
import { IBell } from '../components/Icons'
import DesktopLayout from '../components/DesktopLayout'
import { useIsDesktop } from '../hooks/useIsDesktop'

function NotifItem({ color = 'mustard', title, sub, time, unread = false }) {
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '14px 12px',
      background: unread ? 'var(--surface)' : 'transparent',
      border: unread ? '1px solid var(--paper-200)' : '1px solid transparent',
      borderRadius: 'var(--r-md)', marginBottom: 6, alignItems: 'flex-start',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 'var(--r-sm)',
        background: `var(--tag-${color}-bg)`,
        color: `var(--tag-${color})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <IBell size={20}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: unread ? 700 : 600, letterSpacing: '-0.015em', lineHeight: 1.4 }}>{title}</div>
        {sub && <div style={{ fontSize: 12.5, color: 'var(--ink-500)', fontWeight: 500, marginTop: 2 }}>{sub} · {time}</div>}
        {!sub && <div style={{ fontSize: 12.5, color: 'var(--ink-500)', fontWeight: 500, marginTop: 2 }}>{time}</div>}
      </div>
      {unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--clay)', marginTop: 8, flexShrink: 0 }}/>}
    </div>
  )
}

const NOTIF_COLORS = ['coral', 'mustard', 'sage', 'plum', 'sky', 'rose']

function formatTime(date) {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return '방금 전'
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  return new Date(date).toLocaleDateString('ko-KR')
}

export default function NotificationsPage() {
  const isDesktop = useIsDesktop()
  const { notifications, unreadCount, markAllRead, clearAll } = useNotificationContext()

  useEffect(() => { markAllRead() }, [])

  const notifContent = (
    <div style={{ maxWidth: isDesktop ? 640 : undefined, margin: isDesktop ? '0 auto' : undefined }}>
      {notifications.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 12 }}>
          <IBell size={48} stroke={1.2} style={{ color: 'var(--ink-300)' }}/>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-500)' }}>새로운 알림이 없어요</div>
        </div>
      ) : (
        <>
          {unreadCount > 0 && (
            <div style={{ padding: '0 4px 10px', fontSize: 12, color: 'var(--ink-500)', fontWeight: 700 }}>
              읽지 않은 알림 {unreadCount}개
            </div>
          )}
          {notifications.map((n, i) => (
            <NotifItem
              key={n.id}
              color={NOTIF_COLORS[i % NOTIF_COLORS.length]}
              title={n.title}
              sub={n.body}
              time={formatTime(n.time)}
              unread={i < unreadCount}
            />
          ))}
        </>
      )}
    </div>
  )

  // ─── 데스크탑 ─────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <DesktopLayout>
        <div style={{ textAlign: 'center', marginBottom: 28, position: 'relative' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 700 }}>알림</div>
            <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.025em', margin: '4px 0 0' }}>알림 센터</h1>
          </div>
          {notifications.length > 0 && (
            <button onClick={clearAll} style={{
              position: 'absolute', right: 0, bottom: 4,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, color: 'var(--ink-500)', fontWeight: 600, fontFamily: 'inherit',
            }}>전체 삭제</button>
          )}
        </div>
        {notifContent}
      </DesktopLayout>
    )
  }

  // ─── 모바일 ───────────────────────────────────────────────────────
  return (
    <div className="moim paper-grain" style={{
      width: '100%', height: '100dvh', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', background: 'var(--paper-50)',
      position: 'relative',
    }}>
      <AppHeader
        title="알림"
        right={
          notifications.length > 0 ? (
            <button onClick={clearAll} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, color: 'var(--ink-500)', fontWeight: 600, fontFamily: 'inherit',
            }}>전체 삭제</button>
          ) : null
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 96px' }}>
        {notifContent}
      </div>

      <TabBar/>
    </div>
  )
}
