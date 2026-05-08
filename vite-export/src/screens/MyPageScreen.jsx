import { Avatar, Tag, AppHeader, IconButton, TabBar } from '../components/MoimUI.jsx';
import { ICamera, IPencil, IBell, IClock, ISettings, IUser, ILink, ILogout, IChevR } from '../components/Icons.jsx';
import { MOCK_USER } from '../data/mock.js';

function Toggle({ on = false }) {
  return (
    <div style={{
      width: 44, height: 26, borderRadius: 999,
      background: on ? 'var(--clay)' : 'var(--paper-300)',
      position: 'relative', transition: 'background 0.15s',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 20 : 2,
        width: 22, height: 22, borderRadius: '50%',
        background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        transition: 'left 0.15s',
      }}/>
    </div>
  );
}

function MenuGroup({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-500)', marginBottom: 8, paddingLeft: 4 }}>{title}</h2>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--paper-200)',
        borderRadius: 'var(--r-lg)', overflow: 'hidden',
      }}>{children}</div>
    </div>
  );
}

function MenuRow({ icon, label, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px', borderBottom: '1px solid var(--paper-200)',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 'var(--r-sm)',
        background: 'var(--paper-100)', color: 'var(--ink-700)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon}</div>
      <div style={{ flex: 1, fontSize: 14.5, fontWeight: 600, letterSpacing: '-0.01em' }}>{label}</div>
      <div style={{ color: 'var(--ink-500)' }}>{right || <IChevR size={18}/>}</div>
    </div>
  );
}

export default function MyPageScreen() {
  return (
    <div className="moim paper-grain" style={{
      width: '100%', height: '100%', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', background: 'var(--paper-50)',
    }}>
      <AppHeader title="마이"/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 96px' }}>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--paper-200)',
          borderRadius: 'var(--r-xl)', padding: 22, marginBottom: 18,
          display: 'flex', alignItems: 'center', gap: 16,
          boxShadow: 'var(--shadow-1)',
        }}>
          <div style={{ position: 'relative' }}>
            <Avatar name={MOCK_USER.name} size={64} color="var(--wood)" ring/>
            <button style={{
              position: 'absolute', right: -2, bottom: -2,
              width: 26, height: 26, borderRadius: '50%',
              background: 'var(--clay)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--surface)', cursor: 'pointer',
            }}><ICamera size={13}/></button>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>{MOCK_USER.name}</span>
              <Tag color="clay" size="sm">관리자</Tag>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-500)', fontWeight: 500 }}>seoyeon@moim.kr</div>
          </div>
          <IconButton Icon={IPencil}/>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 22 }}>
          {[
            { num: '3', l: '참여 모임', c: 'clay' },
            { num: '12', l: '이번 달 일정', c: 'sage' },
            { num: '47', l: '함께한 순간', c: 'mustard' },
          ].map(s => (
            <div key={s.l} style={{
              background: 'var(--surface)', border: '1px solid var(--paper-200)',
              borderRadius: 'var(--r-md)', padding: '14px 10px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: `var(--tag-${s.c})`, letterSpacing: '-0.02em' }}>{s.num}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-500)', fontWeight: 600, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <MenuGroup title="알림 설정">
          <MenuRow icon={<IBell size={20}/>} label="푸시 알림" right={<Toggle on/>}/>
          <MenuRow icon={<IBell size={20}/>} label="이메일 알림" right={<Toggle/>}/>
          <MenuRow icon={<IClock size={20}/>} label="기본 미리 알림" right={<span style={{ fontSize: 13.5, color: 'var(--ink-500)', fontWeight: 600 }}>1시간 전</span>}/>
        </MenuGroup>

        <MenuGroup title="앱 설정">
          <MenuRow icon={<ISettings size={20}/>} label="화면 / 테마" right={<span style={{ fontSize: 13.5, color: 'var(--ink-500)', fontWeight: 600 }}>라이트</span>}/>
          <MenuRow icon={<IUser size={20}/>} label="계정 정보 수정"/>
          <MenuRow icon={<ILink size={20}/>} label="고객센터"/>
        </MenuGroup>

        <button style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', height: 48, marginTop: 8,
          color: 'var(--ink-500)', fontSize: 14, fontWeight: 600,
          background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <ILogout size={18}/> 로그아웃
        </button>
      </div>
      <TabBar active="me"/>
    </div>
  );
}
