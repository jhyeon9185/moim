import { useState } from 'react';
import { AppHeader, IconButton, TabBar, Button, BottomSheet, TextField } from '../components/MoimUI.jsx';
import { IBack, ISettings, IPlus, IClock, IPin } from '../components/Icons.jsx';
import { MonthCalendar } from '../components/Calendar.jsx';
import { MOCK_EVENTS, TODAY } from '../data/mock.js';

function ScheduleItem({ e }) {
  return (
    <div style={{
      display: 'flex', gap: 12,
      background: 'var(--surface)', border: '1px solid var(--paper-200)',
      borderRadius: 'var(--r-md)', padding: '12px 14px',
    }}>
      <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 4, background: `var(--tag-${e.color})` }}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.015em', marginBottom: 4 }}>{e.title}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12.5, color: 'var(--ink-500)', fontWeight: 500 }}>
          {e.time && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><IClock size={13}/> {e.time}</span>}
          {e.loc && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><IPin size={13}/> {e.loc}</span>}
        </div>
      </div>
    </div>
  );
}

function AddScheduleSheet({ onClose }) {
  return (
    <BottomSheet open onClose={onClose}>
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 4 }}>새 일정 추가</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-500)', fontWeight: 500 }}>우리 가족 · 5월 12일</p>
      </div>
      <div style={{ marginTop: 16 }}>
        <TextField label="무슨 모임인가요?" value="어버이날 가족 식사" placeholder="예: 어버이날 식사"/>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--ink-700)', marginBottom: 6, paddingLeft: 4 }}>카테고리</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[
              ['mustard', '기념일', true],
              ['sage', '모임/외식', false],
              ['coral', '약속', false],
              ['plum', '생일', false],
              ['sky', '여행', false],
              ['rose', '가족', false],
            ].map(([c, l, a]) => (
              <button key={l} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '8px 13px', borderRadius: 'var(--r-pill)',
                background: a ? `var(--tag-${c}-bg)` : 'var(--surface-sunken)',
                border: a ? `1.5px solid var(--tag-${c})` : '1.5px solid transparent',
                color: a ? `var(--tag-${c})` : 'var(--ink-500)',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: `var(--tag-${c})` }}/>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}><TextField label="날짜" value="2026. 05. 12"/></div>
          <div style={{ flex: 1 }}><TextField label="시간 (선택)" value="오후 6:30"/></div>
        </div>
        <TextField label="장소 (선택)" value="" placeholder="예: 한정식 모란각" icon={<IPin size={18}/>}/>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--ink-700)', marginBottom: 6, paddingLeft: 4 }}>알림</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {['1시간 전', '3시간 전', '하루 전', '꺼짐'].map((l, i) => (
              <button key={l} style={{
                flex: 1, height: 40, borderRadius: 'var(--r-sm)',
                background: i === 2 ? 'var(--ink-900)' : 'var(--surface-sunken)',
                color: i === 2 ? 'var(--paper-50)' : 'var(--ink-500)',
                fontSize: 12.5, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              }}>{l}</button>
            ))}
          </div>
        </div>
        <Button variant="primary" size="lg" full>일정 추가하기</Button>
        <div style={{ height: 8 }}/>
        <Button variant="ghost" size="md" full onClick={onClose}>취소</Button>
      </div>
    </BottomSheet>
  );
}

export default function GroupCalendarScreen({ withTabBar = true, sheetOpen = false }) {
  const [sel, setSel] = useState({ y: 2026, m: 5, d: 12 });
  const [showSheet, setShowSheet] = useState(sheetOpen);
  const dateKey = `${sel.y}-${String(sel.m).padStart(2,'0')}-${String(sel.d).padStart(2,'0')}`;
  const dayEvents = MOCK_EVENTS[dateKey] || [];

  return (
    <div className="moim paper-grain" style={{
      width: '100%', height: '100%', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      background: 'var(--paper-50)', position: 'relative',
    }}>
      <AppHeader title="우리 가족" subtitle="멤버 5명"
        left={<IconButton Icon={IBack}/>}
        right={<IconButton Icon={ISettings}/>}/>

      <div style={{ padding: '4px 16px 14px', display: 'flex', gap: 6 }}>
        {[
          { id: 'sched', label: '일정', active: true },
          { id: 'mem', label: '멤버' },
          { id: 'set', label: '관리' },
        ].map(t => (
          <button key={t.id} style={{
            flex: 1, height: 36, borderRadius: 'var(--r-pill)',
            background: t.active ? 'var(--ink-900)' : 'var(--paper-100)',
            color: t.active ? 'var(--paper-50)' : 'var(--ink-500)',
            fontSize: 13.5, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 220px' }}>
        <MonthCalendar year={sel.y} month={sel.m} today={TODAY} events={MOCK_EVENTS} selected={sel} onSelect={setSel}/>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
          {[
            ['mustard', '기념일'], ['sage', '모임/외식'], ['coral', '약속'],
            ['sky', '여행/외부'], ['plum', '생일'], ['rose', '가족'],
          ].map(([c, l]) => (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-500)', fontWeight: 600 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: `var(--tag-${c})` }}/>
              {l}
            </div>
          ))}
        </div>
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0,
        bottom: withTabBar ? 60 : 0,
        background: 'var(--surface-raised)',
        borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
        boxShadow: '0 -8px 24px rgba(80,60,30,0.12)',
        padding: '12px 20px 24px', maxHeight: '52%', overflowY: 'auto', zIndex: 10,
      }}>
        <div style={{ width: 40, height: 4, background: 'var(--paper-300)', borderRadius: 999, margin: '0 auto 10px' }}/>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 700 }}>2026년 5월 12일 화요일</div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>오늘의 일정 {dayEvents.length}</div>
          </div>
          <button onClick={() => setShowSheet(true)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'var(--clay)', color: '#fff',
            height: 38, padding: '0 14px',
            borderRadius: 'var(--r-pill)',
            fontSize: 13.5, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <IPlus size={16}/> 일정 추가
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {dayEvents.map((e, i) => <ScheduleItem key={i} e={e}/>)}
        </div>
      </div>

      {showSheet && <AddScheduleSheet onClose={() => setShowSheet(false)}/>}
      {withTabBar && <TabBar active="home" hasNotif/>}
    </div>
  );
}
