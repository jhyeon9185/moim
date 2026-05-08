import { IconButton, TabBar } from '../components/MoimUI.jsx';
import { IPlus } from '../components/Icons.jsx';
import { MonthCalendar } from '../components/Calendar.jsx';
import { MOCK_EVENTS, TODAY } from '../data/mock.js';

function AgendaItem({ day, dow, badge, items }) {
  return (
    <div style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
      <div style={{ width: 44, flexShrink: 0, textAlign: 'center', paddingTop: 4 }}>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>{day}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-500)', marginTop: 2 }}>5월 {dow}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600, marginBottom: 6 }}>{badge}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((e, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10,
              background: 'var(--surface)', border: '1px solid var(--paper-200)',
              borderRadius: 'var(--r-md)', padding: '10px 12px',
            }}>
              <div style={{ width: 4, borderRadius: 4, background: `var(--tag-${e.color})`, alignSelf: 'stretch' }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>{e.title}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 500, marginTop: 1 }}>{e.meta} · {e.group}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GlobalCalendarScreen() {
  return (
    <div className="moim paper-grain" style={{
      width: '100%', height: '100%', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', background: 'var(--paper-50)',
    }}>
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 700 }}>전체 일정</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em' }}>2026년 5월</h1>
        </div>
        <IconButton Icon={IPlus} tone="clay"/>
      </div>

      <div style={{ padding: '12px 20px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {[
          ['전체', null, true],
          ['우리 가족', 'clay', false],
          ['동기 모임', 'sage', false],
          ['독서 모임', 'sky', false],
        ].map(([l, c, a]) => (
          <button key={l} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '7px 13px', borderRadius: 'var(--r-pill)',
            background: a ? 'var(--ink-900)' : 'var(--surface)',
            color: a ? 'var(--paper-50)' : 'var(--ink-700)',
            border: a ? 'none' : '1px solid var(--paper-200)',
            fontSize: 13, fontWeight: 700, flexShrink: 0, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {c && <span style={{ width: 8, height: 8, borderRadius: '50%', background: `var(--tag-${c})` }}/>}
            {l}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 96px' }}>
        <MonthCalendar year={2026} month={5} today={TODAY} events={MOCK_EVENTS} selected={null} onSelect={()=>{}} compact/>
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-700)', marginBottom: 10, paddingLeft: 4 }}>다가오는 일정</h2>
          <AgendaItem day="12" dow="화" badge="오늘로부터 3일 뒤" items={[
            { color: 'mustard', title: '어버이날 가족 식사', meta: '오후 6:30 · 한정식 모란각', group: '우리 가족' },
            { color: 'sage', title: '꽃다발 픽업', meta: '오후 5:00', group: '우리 가족' },
          ]}/>
          <AgendaItem day="15" dow="금" badge="6일 뒤" items={[
            { color: 'sky', title: '스승의날 카드 보내기', meta: '하루 종일', group: '개인' },
          ]}/>
          <AgendaItem day="18" dow="월" badge="9일 뒤" items={[
            { color: 'sage', title: '동기 캠핑 1박 2일', meta: '오전 10:00 · 가평', group: '동기 모임' },
          ]}/>
        </div>
      </div>
      <TabBar active="calendar" hasNotif/>
    </div>
  );
}
