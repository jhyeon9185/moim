import { useState } from 'react';
import LoginScreen from './screens/LoginScreen.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import GroupCalendarScreen from './screens/GroupCalendarScreen.jsx';
import GlobalCalendarScreen from './screens/GlobalCalendarScreen.jsx';
import NotificationsScreen from './screens/NotificationsScreen.jsx';
import MyPageScreen from './screens/MyPageScreen.jsx';
import DesktopHomeScreen from './screens/DesktopHomeScreen.jsx';

const SCREENS = [
  { id: 'login', label: '로그인', C: LoginScreen, kind: 'mobile' },
  { id: 'home', label: '홈', C: HomeScreen, kind: 'mobile' },
  { id: 'gcal', label: '모임 캘린더', C: GroupCalendarScreen, kind: 'mobile' },
  { id: 'gcal-add', label: '일정 추가', C: (p) => <GroupCalendarScreen sheetOpen {...p} />, kind: 'mobile' },
  { id: 'global', label: '전체 캘린더', C: GlobalCalendarScreen, kind: 'mobile' },
  { id: 'notif', label: '알림', C: NotificationsScreen, kind: 'mobile' },
  { id: 'me', label: '마이', C: MyPageScreen, kind: 'mobile' },
  { id: 'desktop', label: '데스크탑 (1920)', C: DesktopHomeScreen, kind: 'desktop' },
];

export default function App() {
  const [active, setActive] = useState('home');
  const screen = SCREENS.find(s => s.id === active) || SCREENS[1];
  const Screen = screen.C;
  const isDesktop = screen.kind === 'desktop';

  // 데스크탑 화면은 1920×1080 캔버스를 viewport에 맞게 스케일
  const desktopScale = typeof window !== 'undefined'
    ? Math.min((window.innerWidth - 240) / 1920, (window.innerHeight - 64) / 1080, 1)
    : 0.5;

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#1a1a1a' }}>
      <aside style={{
        width: 220, background: '#2a2520', color: '#f4ecda',
        padding: 20, fontFamily: 'Pretendard Variable, system-ui, sans-serif',
        display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto', flexShrink: 0,
      }}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, letterSpacing: '-0.025em' }}>모임 화면</div>
        {SCREENS.map(s => (
          <button key={s.id} onClick={() => setActive(s.id)} style={{
            textAlign: 'left', padding: '8px 12px', borderRadius: 8,
            background: active === s.id ? '#C8694A' : 'transparent',
            color: active === s.id ? '#fff' : '#d5c9b0',
            border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 600,
          }}>{s.label}</button>
        ))}
      </aside>
      <main style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 32, overflow: 'auto',
      }}>
        {isDesktop ? (
          <div style={{
            width: 1920, height: 1080,
            transform: `scale(${desktopScale})`, transformOrigin: 'center',
            borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)', background: '#fff',
            flexShrink: 0,
          }}>
            <Screen />
          </div>
        ) : (
          <div style={{
            width: 390, height: 780, borderRadius: 32, overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)', background: '#fff',
          }}>
            <Screen />
          </div>
        )}
      </main>
    </div>
  );
}
