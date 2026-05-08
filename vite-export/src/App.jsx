import { useState } from 'react';
import LoginScreen from './screens/LoginScreen.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import GroupCalendarScreen from './screens/GroupCalendarScreen.jsx';
import GlobalCalendarScreen from './screens/GlobalCalendarScreen.jsx';
import NotificationsScreen from './screens/NotificationsScreen.jsx';
import MyPageScreen from './screens/MyPageScreen.jsx';

const SCREENS = [
  { id: 'login', label: '로그인', C: LoginScreen },
  { id: 'home', label: '홈', C: HomeScreen },
  { id: 'gcal', label: '모임 캘린더', C: GroupCalendarScreen },
  { id: 'gcal-add', label: '일정 추가', C: (p) => <GroupCalendarScreen sheetOpen {...p} /> },
  { id: 'global', label: '전체 캘린더', C: GlobalCalendarScreen },
  { id: 'notif', label: '알림', C: NotificationsScreen },
  { id: 'me', label: '마이', C: MyPageScreen },
];

export default function App() {
  const [active, setActive] = useState('home');
  const Screen = SCREENS.find(s => s.id === active)?.C || HomeScreen;
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#1a1a1a' }}>
      <aside style={{
        width: 200, background: '#2a2520', color: '#f4ecda',
        padding: 20, fontFamily: 'Pretendard Variable, system-ui, sans-serif',
        display: 'flex', flexDirection: 'column', gap: 4,
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
        <div style={{
          width: 390, height: 780,
          borderRadius: 32, overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          background: '#fff',
        }}>
          <Screen />
        </div>
      </main>
    </div>
  );
}
