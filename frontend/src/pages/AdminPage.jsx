import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Megaphone, Pencil, ToggleLeft, ToggleRight } from 'lucide-react'
import { AppHeader, IconButton } from '../components/MoimUI'
import { IBack, IUsers, IHome, IBell, ITrash, IChevR } from '../components/Icons'
import DesktopLayout from '../components/DesktopLayout'
import { useIsDesktop } from '../hooks/useIsDesktop'
import api from '../api'
import './AdminPage.css'

export default function AdminPage() {
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()
  const [users, setUsers] = useState([])
  const [rooms, setRooms] = useState([])
  const [roomMembers, setRoomMembers] = useState({})
  const [expandedRoom, setExpandedRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('users')

  // 알림 발송
  const [notifTitle, setNotifTitle] = useState('')
  const [notifBody, setNotifBody] = useState('')
  const [notifResult, setNotifResult] = useState(null)
  const [notifSending, setNotifSending] = useState(false)
  const [connectedCount, setConnectedCount] = useState(null)

  // 공지사항
  const [announcements, setAnnouncements] = useState([])
  const [noticeContent, setNoticeContent] = useState('')
  const [noticeActive, setNoticeActive] = useState(true)
  const [editingNotice, setEditingNotice] = useState(null)
  const [noticeSaving, setNoticeSaving] = useState(false)

  useEffect(() => { fetchData(); fetchAnnouncements() }, [])

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/admin/announcements')
      setAnnouncements(res.data)
    } catch {}
  }

  const handleSaveNotice = async () => {
    if (!noticeContent.trim()) { alert('내용을 입력해주세요.'); return }
    setNoticeSaving(true)
    try {
      if (editingNotice) {
        const res = await api.put(`/admin/announcements/${editingNotice.id}`, { content: noticeContent, active: noticeActive })
        setAnnouncements(prev => prev.map(a => a.id === editingNotice.id ? res.data : a))
      } else {
        const res = await api.post('/admin/announcements', { content: noticeContent, active: noticeActive })
        setAnnouncements(prev => [res.data, ...prev])
      }
      setNoticeContent('')
      setNoticeActive(true)
      setEditingNotice(null)
    } catch {
      alert('저장에 실패했습니다.')
    } finally {
      setNoticeSaving(false)
    }
  }

  const handleToggleNotice = async (a) => {
    try {
      const res = await api.put(`/admin/announcements/${a.id}`, { active: !a.active })
      setAnnouncements(prev => prev.map(x => x.id === a.id ? res.data : x))
    } catch {}
  }

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('이 공지를 삭제하시겠습니까?')) return
    try {
      await api.delete(`/admin/announcements/${id}`)
      setAnnouncements(prev => prev.filter(a => a.id !== id))
      if (editingNotice?.id === id) { setEditingNotice(null); setNoticeContent(''); setNoticeActive(true) }
    } catch {
      alert('삭제에 실패했습니다.')
    }
  }

  const startEditNotice = (a) => {
    setEditingNotice(a)
    setNoticeContent(a.content)
    setNoticeActive(a.active)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersRes, roomsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/rooms'),
      ])
      setUsers(usersRes.data)
      setRooms(roomsRes.data)
    } catch {
      alert('관리자 데이터를 불러오는데 실패했습니다.')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('이 사용자를 정말 삭제하시겠습니까?')) return
    try {
      await api.delete(`/admin/users/${userId}`)
      setUsers(u => u.filter(x => x.id !== userId))
    } catch {
      alert('사용자 삭제에 실패했습니다.')
    }
  }

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('이 모임방을 정말 삭제하시겠습니까?')) return
    try {
      await api.delete(`/admin/rooms/${roomId}`)
      setRooms(r => r.filter(x => x.id !== roomId))
      if (expandedRoom === roomId) setExpandedRoom(null)
    } catch {
      alert('모임방 삭제에 실패했습니다.')
    }
  }

  const handleExpandRoom = async (roomId) => {
    if (expandedRoom === roomId) { setExpandedRoom(null); return }
    if (!roomMembers[roomId]) {
      try {
        const res = await api.get(`/admin/rooms/${roomId}/members`)
        setRoomMembers(prev => ({ ...prev, [roomId]: res.data }))
      } catch {
        alert('멤버 목록을 불러오는데 실패했습니다.')
        return
      }
    }
    setExpandedRoom(roomId)
  }

  const fetchConnectedCount = async () => {
    try {
      const res = await api.get('/admin/notifications/connected')
      setConnectedCount(res.data.count)
    } catch {}
  }

  const handleBroadcast = async () => {
    if (!notifTitle.trim()) { alert('제목을 입력해주세요.'); return }
    setNotifSending(true)
    setNotifResult(null)
    try {
      const res = await api.post('/admin/notifications/broadcast', { title: notifTitle, body: notifBody })
      setNotifResult({ success: true, message: res.data.message })
      setNotifTitle('')
      setNotifBody('')
    } catch {
      setNotifResult({ success: false, message: '발송에 실패했습니다.' })
    } finally {
      setNotifSending(false)
    }
  }

  const handleKickMember = async (roomId, userId, nickname) => {
    if (!window.confirm(`${nickname} 님을 이 모임에서 추방하시겠습니까?`)) return
    try {
      await api.delete(`/admin/rooms/${roomId}/members/${userId}`)
      setRoomMembers(prev => ({ ...prev, [roomId]: prev[roomId].filter(m => m.userId !== userId) }))
      setRooms(r => r.map(x => x.id === roomId ? { ...x, memberCount: x.memberCount - 1 } : x))
    } catch (e) {
      alert(e.response?.data?.message || '추방에 실패했습니다.')
    }
  }

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?'
  const providerLabel = (p) => ({ LOCAL: '이메일', KAKAO: '카카오', GOOGLE: '구글' }[p] ?? p)

  const imgSrc = (path) => path
    ? (path.startsWith('http') ? path : `${import.meta.env.VITE_API_URL}${path}`)
    : null

  if (loading) return <div className="loading-page"><div className="spinner" /></div>

  const TABS = [
    { id: 'users', label: '회원 관리', Icon: IUsers },
    { id: 'rooms', label: '모임 관리', Icon: IHome },
    { id: 'notify', label: '알림 발송', Icon: IBell },
    { id: 'notice', label: '공지사항', Icon: Megaphone },
  ]

  const tabContent = (
    <div>
      {tab === 'users' && (
        <div className="admin-list">
          {users.length === 0 && <p className="admin-empty">회원이 없습니다.</p>}
          {users.map(u => (
            <div key={u.id} className="admin-card">
              <div className="admin-avatar">
                {imgSrc(u.profileImage) ? <img src={imgSrc(u.profileImage)} alt="" /> : getInitial(u.nickname)}
              </div>
              <div className="admin-card-info">
                <div className="admin-card-name">
                  {u.nickname}
                  <span className={`admin-role-badge ${u.role === 'ADMIN' ? 'is-admin' : ''}`}>
                    {u.role === 'ADMIN' ? '관리자' : '일반'}
                  </span>
                  <span className="admin-provider-badge">{providerLabel(u.provider)}</span>
                </div>
                <div className="admin-card-sub">{u.email}</div>
                <div className="admin-card-sub">{new Date(u.createdAt).toLocaleDateString('ko-KR')} 가입</div>
              </div>
              {u.role !== 'ADMIN' && (
                <button className="admin-action-btn danger" onClick={() => handleDeleteUser(u.id)} aria-label="삭제">
                  <ITrash size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

        {tab === 'rooms' && (
          <div className="admin-list">
            {rooms.length === 0 && <p className="admin-empty">모임이 없습니다.</p>}
            {rooms.map(r => (
              <div key={r.id} className="admin-room-card">
                <div className="admin-room-header">
                  <div className="admin-card-info">
                    <div className="admin-card-name">{r.name}</div>
                    <div className="admin-card-sub">
                      멤버 {r.memberCount}명 · {new Date(r.createdAt).toLocaleDateString('ko-KR')} 생성
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      className={`admin-action-btn ${expandedRoom === r.id ? 'active' : ''}`}
                      onClick={() => handleExpandRoom(r.id)}
                      aria-label="멤버 펼치기"
                    >
                      <IChevR size={16} style={{ transform: expandedRoom === r.id ? 'rotate(90deg)' : 'none', transition: 'transform 150ms' }} />
                    </button>
                    <button className="admin-action-btn danger" onClick={() => handleDeleteRoom(r.id)} aria-label="삭제">
                      <ITrash size={16} />
                    </button>
                  </div>
                </div>

                {expandedRoom === r.id && roomMembers[r.id] && (
                  <div className="admin-member-list">
                    {roomMembers[r.id].length === 0 && <p className="admin-empty small">멤버가 없습니다.</p>}
                    {roomMembers[r.id].map(m => (
                      <div key={m.userId} className="admin-member-row">
                        <div className="admin-avatar small">
                          {imgSrc(m.profileImage) ? <img src={imgSrc(m.profileImage)} alt="" /> : getInitial(m.nickname)}
                        </div>
                        <div className="admin-card-info">
                          <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                            {m.nickname}
                            <span className="admin-role-badge" style={{ marginLeft: '6px' }}>
                              {m.role === 'OWNER' ? '방장' : '멤버'}
                            </span>
                          </div>
                          <div className="admin-card-sub">{m.email}</div>
                        </div>
                        {m.role !== 'OWNER' && (
                          <button className="admin-action-btn danger small" onClick={() => handleKickMember(r.id, m.userId, m.nickname)} aria-label="추방">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 37.47 37.47" width="14" height="14">
                              <path d="m18.73,0c-3.01,0-5.86.71-8.38,1.98l3.76,3.78c1.45-.51,3-.79,4.62-.79,7.6,0,13.78,6.17,13.78,13.77,0,2.96-.95,5.79-2.66,8.12l-1.52-1.53L10.67,7.58l-1.87-1.88-1.65-1.67C2.8,7.46,0,12.78,0,18.74c0,10.33,8.4,18.73,18.73,18.73,2.54,0,5.01-.5,7.33-1.48.14-.06.29-.13.43-.2l-3.83-3.85c-1.27.38-2.58.57-3.93.57-7.59,0-13.77-6.18-13.77-13.77,0-2.8.84-5.4,2.27-7.58l1.31,1.31,17.7,17.8h.01l1.95,1.97,1.6,1.61c4.81-3.52,7.67-9.13,7.67-15.11C37.47,8.41,29.06,0,18.73,0Z" fill="currentColor"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 알림 발송 탭 */}
        {tab === 'notify' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>

            {/* 접속 현황 */}
            <div className="admin-stat-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>현재 SSE 연결 중</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>
                  {connectedCount ?? '-'}명
                </span>
                <button
                  className="admin-action-btn"
                  onClick={fetchConnectedCount}
                  title="새로고침"
                  style={{ width: '28px', height: '28px' }}
                >
                  ↻
                </button>
              </div>
            </div>

            {/* 발송 폼 */}
            <div className="admin-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--space-md)' }}>
              <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: '4px' }}>알림 작성</div>

              <div className="input-group">
                <label className="input-label">제목</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="알림 제목을 입력하세요"
                  value={notifTitle}
                  onChange={e => setNotifTitle(e.target.value)}
                  maxLength={50}
                />
              </div>

              <div className="input-group">
                <label className="input-label">내용</label>
                <textarea
                  className="input-field"
                  placeholder="알림 내용을 입력하세요 (선택)"
                  value={notifBody}
                  onChange={e => setNotifBody(e.target.value)}
                  rows={3}
                  maxLength={200}
                  style={{ resize: 'none' }}
                />
              </div>

              {notifResult && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  background: notifResult.success ? 'var(--color-success-light)' : 'var(--color-danger-light)',
                  color: notifResult.success ? 'var(--color-success)' : 'var(--color-danger)',
                }}>
                  {notifResult.message}
                </div>
              )}

              <button
                className="btn btn-primary btn-full"
                onClick={handleBroadcast}
                disabled={notifSending || !notifTitle.trim()}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <IBell size={16} />
                {notifSending ? '발송 중...' : '전체 발송하기'}
              </button>
            </div>

            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-light)', textAlign: 'center' }}>
              현재 앱에 접속 중이고 알림을 허용한 사용자에게만 발송됩니다.
            </p>
          </div>
        )}

        {/* 공지사항 탭 */}
        {tab === 'notice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>

            {/* 작성 / 수정 폼 */}
            <div className="admin-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--space-md)' }}>
              <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                {editingNotice ? '공지 수정' : '새 공지 작성'}
              </div>

              <textarea
                className="input-field"
                placeholder="공지 내용을 입력하세요 (최대 200자)"
                value={noticeContent}
                onChange={e => setNoticeContent(e.target.value)}
                maxLength={200}
                rows={3}
                style={{ resize: 'none' }}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>바로 게시</span>
                  <span onClick={() => setNoticeActive(v => !v)}>
                    {noticeActive
                      ? <ToggleRight size={28} color="var(--color-primary)" />
                      : <ToggleLeft size={28} color="var(--color-border)" />
                    }
                  </span>
                </label>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  {editingNotice && (
                    <button className="btn btn-secondary" onClick={() => { setEditingNotice(null); setNoticeContent(''); setNoticeActive(true) }}>
                      취소
                    </button>
                  )}
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveNotice}
                    disabled={noticeSaving || !noticeContent.trim()}
                  >
                    {noticeSaving ? '저장 중...' : editingNotice ? '수정 완료' : '등록'}
                  </button>
                </div>
              </div>
            </div>

            {/* 공지 목록 */}
            <div className="admin-list">
              {announcements.length === 0 && <p className="admin-empty">등록된 공지가 없습니다.</p>}
              {announcements.map(a => (
                <div key={a.id} className="admin-card" style={{ alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', wordBreak: 'break-word', marginBottom: '4px' }}>
                      {a.content}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-light)' }}>
                      {new Date(a.createdAt).toLocaleDateString('ko-KR')}
                      <span className={`admin-role-badge ${a.active ? 'is-admin' : ''}`} style={{ marginLeft: '6px' }}>
                        {a.active ? '게시 중' : '숨김'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <button className="admin-action-btn" onClick={() => handleToggleNotice(a)} title={a.active ? '숨기기' : '게시하기'}>
                      {a.active ? <ToggleRight size={16} color="var(--color-primary)" /> : <ToggleLeft size={16} />}
                    </button>
                    <button className="admin-action-btn" onClick={() => startEditNotice(a)} title="수정">
                      <Pencil size={14} />
                    </button>
                    <button className="admin-action-btn danger" onClick={() => handleDeleteNotice(a.id)} title="삭제">
                      <ITrash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  )

  if (isDesktop) {
    return (
      <DesktopLayout>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 700 }}>관리자</div>
          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.025em', margin: '4px 0 0' }}>대시보드</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 28 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--paper-200)', borderRadius: 'var(--r-xl)', padding: '20px 24px' }}>
            <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 4 }}>{users.length}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-500)', fontWeight: 700 }}>전체 회원</div>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--paper-200)', borderRadius: 'var(--r-xl)', padding: '20px 24px' }}>
            <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 4 }}>{rooms.length}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-500)', fontWeight: 700 }}>전체 모임</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--paper-200)', marginBottom: 28 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); if (t.id === 'notify') fetchConnectedCount() }} style={{
              padding: '10px 20px', background: 'none', border: 'none',
              borderBottom: `2.5px solid ${tab === t.id ? 'var(--clay)' : 'transparent'}`,
              marginBottom: -1,
              fontFamily: 'inherit', fontSize: 14,
              fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? 'var(--clay)' : 'var(--ink-400)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <t.Icon size={15}/>{t.label}
            </button>
          ))}
        </div>

        <div style={{ maxWidth: 760 }}>
          {tabContent}
        </div>
      </DesktopLayout>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--paper-50)', fontFamily: 'var(--font-sans)' }}>
      <AppHeader title="관리자 대시보드" left={<IconButton Icon={IBack} onClick={() => navigate('/')}/>}/>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-value">{users.length}</div>
          <div className="admin-stat-label">전체 회원</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{rooms.length}</div>
          <div className="admin-stat-label">전체 모임</div>
        </div>
      </div>

      <div style={{ display: 'flex', background: 'var(--surface)', borderBottom: '1px solid var(--paper-200)', padding: '0 20px' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); if (t.id === 'notify') fetchConnectedCount() }} style={{
            flex: 1, background: 'none', border: 'none', padding: '13px 4px',
            fontFamily: 'var(--font-sans)', fontSize: 13.5,
            fontWeight: tab === t.id ? 700 : 500,
            color: tab === t.id ? 'var(--clay)' : 'var(--ink-300)',
            borderBottom: `2.5px solid ${tab === t.id ? 'var(--clay)' : 'transparent'}`,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          }}>
            <t.Icon size={15}/>{t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-lg)' }}>
        {tabContent}
      </div>
    </div>
  )
}
