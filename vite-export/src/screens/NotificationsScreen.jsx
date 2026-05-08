import { AppHeader, IconButton, TabBar } from '../components/MoimUI.jsx';
import { ISettings, IBell } from '../components/Icons.jsx';

function NotifItem({ color, title, sub, time, unread = false }) {
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
        <div style={{ fontSize: 12.5, color: 'var(--ink-500)', fontWeight: 500, marginTop: 2 }}>{sub} · {time}</div>
      </div>
      {unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--clay)', marginTop: 8 }}/>}
    </div>
  );
}

export default function NotificationsScreen() {
  return (
    <div className="moim paper-grain" style={{
      width: '100%', height: '100%', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', background: 'var(--paper-50)',
    }}>
      <AppHeader title="알림" right={<IconButton Icon={ISettings}/>}/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 96px' }}>
        <div style={{ padding: '0 4px 10px', fontSize: 12, color: 'var(--ink-500)', fontWeight: 700 }}>오늘</div>
        <NotifItem unread color="mustard" title="어버이날 가족 식사 1시간 전이에요" sub="우리 가족 · 한정식 모란각" time="방금"/>
        <NotifItem unread color="sage" title="민준님이 동기 캠핑 일정을 추가했어요" sub="동기 모임" time="2시간 전"/>
        <div style={{ padding: '14px 4px 10px', fontSize: 12, color: 'var(--ink-500)', fontWeight: 700 }}>이번 주</div>
        <NotifItem color="clay" title="수민님이 우리 가족 모임에 참여했어요" sub="우리 가족" time="월요일"/>
        <NotifItem color="sky" title="독서 모임 정모 일정이 변경되었어요" sub="22일 → 25일" time="일요일"/>
        <NotifItem color="plum" title="아빠 생신이 16일 앞으로 다가왔어요" sub="잊지 말고 챙겨주세요" time="3일 전"/>
      </div>
      <TabBar active="notif"/>
    </div>
  );
}
