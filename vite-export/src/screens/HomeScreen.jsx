import { Avatar, Tag, IconButton, TabBar, Section } from '../components/MoimUI.jsx';
import { ISearch, IPlus, IClock, IChevR } from '../components/Icons.jsx';
import { IllusCalendar } from '../components/Illustrations.jsx';
import { MOCK_USER, MOCK_GROUPS } from '../data/mock.js';

function GroupCard({ g }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: 'var(--surface)', border: '1px solid var(--paper-200)',
      borderRadius: 'var(--r-lg)', padding: '14px 16px', boxShadow: 'var(--shadow-1)',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 'var(--r-md)',
        background: `var(--tag-${g.color}-bg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
      }}>{g.emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-0.015em', marginBottom: 2 }}>{g.name}</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-500)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          멤버 {g.members}명 · {g.upcoming}
        </div>
      </div>
      <div style={{ color: 'var(--ink-300)' }}><IChevR size={20}/></div>
    </div>
  );
}

function UpcomingItem({ date, color, title, group, time }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: 'var(--surface)', border: '1px solid var(--paper-200)',
      borderRadius: 'var(--r-md)', padding: '12px 14px',
    }}>
      <div style={{
        width: 48, padding: '8px 0', borderRadius: 'var(--r-sm)',
        background: `var(--tag-${color}-bg)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 19, fontWeight: 800, color: `var(--tag-${color})`, lineHeight: 1, letterSpacing: '-0.02em' }}>{date.d}</div>
        <div style={{ fontSize: 10, color: `var(--tag-${color})`, fontWeight: 700, opacity: 0.8 }}>5월 {date.dow}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.015em', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 500 }}>{group} · {time}</div>
      </div>
    </div>
  );
}

export default function HomeScreen({ withTabBar = true }) {
  return (
    <div className="moim paper-grain" style={{
      width: '100%', height: '100%', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', background: 'var(--paper-50)',
    }}>
      <div style={{ padding: '20px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={MOCK_USER.name} size={44} color="var(--wood)" ring/>
          <div>
            <div style={{ fontSize: 13, color: 'var(--ink-500)', fontWeight: 600 }}>안녕하세요</div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 6 }}>
              {MOCK_USER.name}님
              <Tag color="clay" size="sm">관리자</Tag>
            </div>
          </div>
        </div>
        <IconButton Icon={ISearch} iconSize={22}/>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px 96px' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--clay) 0%, #B85838 100%)',
          color: '#fff', borderRadius: 'var(--r-xl)', padding: 20,
          marginBottom: 20, boxShadow: 'var(--shadow-2)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: -10, top: -10, opacity: 0.2 }}>
            <IllusCalendar size={130}/>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.85, marginBottom: 4 }}>오늘 · 5월 9일 (토)</div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>수민 어린이집 학부모회</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, opacity: 0.9 }}>
            <IClock size={14}/> 오후 2:00 · 서초 어린이집
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            <button style={{
              padding: '8px 14px', borderRadius: 'var(--r-pill)',
              background: 'rgba(255,255,255,0.2)', color: '#fff',
              fontSize: 13, fontWeight: 700, backdropFilter: 'blur(4px)',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            }}>자세히 보기</button>
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--tag-mustard-bg)',
          borderRadius: 'var(--r-md)', padding: '12px 14px', marginBottom: 20,
        }}>
          <Tag color="mustard" size="sm">공지</Tag>
          <div style={{ fontSize: 13, color: 'var(--ink-700)', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            가정의 달 5월, 새 알림 기능이 추가되었어요
          </div>
        </div>

        <Section title={`내 모임 ${MOCK_GROUPS.length}`}
          action={
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-700)', padding: '4px 8px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>참가하기</button>
              <button style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                fontSize: 13, fontWeight: 700, color: 'var(--clay)',
                background: 'var(--clay-100)',
                padding: '6px 10px', borderRadius: 'var(--r-pill)',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <IPlus size={14}/> 만들기
              </button>
            </div>
          }>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MOCK_GROUPS.map(g => <GroupCard key={g.id} g={g}/>)}
          </div>
        </Section>

        <Section title="다가오는 일정">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <UpcomingItem date={{ d: 12, dow: '화' }} color="mustard" title="어버이날 가족 식사" group="우리 가족" time="오후 6:30"/>
            <UpcomingItem date={{ d: 18, dow: '월' }} color="sage" title="동기 캠핑 1박" group="동기 모임" time="1박 2일"/>
            <UpcomingItem date={{ d: 22, dow: '금' }} color="sky" title="독서 모임 정모" group="독서 모임" time="저녁 7:30"/>
          </div>
        </Section>
      </div>

      {withTabBar && <TabBar active="home" hasNotif/>}
    </div>
  );
}
