import { IChevL, IChevR } from './Icons.jsx';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function MonthCalendar({ year, month, today, events = {}, selected, onSelect = () => {}, onPrev = () => {}, onNext = () => {}, compact = false }) {
  const first = new Date(year, month - 1, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevDays = new Date(year, month - 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push({ d: prevDays - startDow + 1 + i, muted: true, m: month - 1 });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ d, muted: false, m: month });
  while (cells.length < 42) cells.push({ d: cells.length - daysInMonth - startDow + 1, muted: true, m: month + 1 });

  const cellH = compact ? 48 : 60;

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 4px 14px' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-500)', letterSpacing: '0.02em' }}>{year}</div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1 }}>{month}월</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={onPrev} style={{ width: 36, height: 36, borderRadius: 'var(--r-sm)', background: 'var(--surface)', border: '1px solid var(--paper-200)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-700)', cursor: 'pointer' }}><IChevL size={18}/></button>
          <button onClick={onNext} style={{ width: 36, height: 36, borderRadius: 'var(--r-sm)', background: 'var(--surface)', border: '1px solid var(--paper-200)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-700)', cursor: 'pointer' }}><IChevR size={18}/></button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
        {WEEKDAYS.map((w, i) => (
          <div key={w} style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: i === 0 ? 'var(--clay)' : i === 6 ? 'var(--tag-sky)' : 'var(--ink-500)', paddingBottom: 6 }}>{w}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0, background: 'var(--surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--paper-200)', overflow: 'hidden' }}>
        {cells.map((c, i) => {
          const dow = i % 7;
          const isToday = !c.muted && c.d === today.d && month === today.m && year === today.y;
          const dateKey = `${year}-${String(c.m).padStart(2,'0')}-${String(c.d).padStart(2,'0')}`;
          const dayEvents = !c.muted ? (events[dateKey] || []) : [];
          const isSelected = !c.muted && selected && selected.d === c.d && selected.m === month;
          return (
            <button key={i} onClick={() => !c.muted && onSelect({ y: year, m: month, d: c.d })}
              style={{
                height: cellH, padding: '6px 4px 4px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                borderRight: dow !== 6 ? '1px solid var(--paper-200)' : 'none',
                borderBottom: i < 35 ? '1px solid var(--paper-200)' : 'none',
                background: isSelected ? 'var(--paper-100)' : 'transparent',
                opacity: c.muted ? 0.3 : 1,
                cursor: c.muted ? 'default' : 'pointer',
                position: 'relative', border: 'none', fontFamily: 'inherit',
              }}>
              {isToday ? (
                <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--clay)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>{c.d}</span>
              ) : (
                <span style={{ fontSize: 14, fontWeight: 600, color: dow === 0 ? 'var(--clay)' : dow === 6 ? 'var(--tag-sky)' : 'var(--ink-900)', height: 26, display: 'flex', alignItems: 'center' }}>{c.d}</span>
              )}
              <div style={{ display: 'flex', gap: 3, height: 6 }}>
                {dayEvents.slice(0, 3).map((e, k) => (
                  <span key={k} style={{ width: 6, height: 6, borderRadius: '50%', background: `var(--tag-${e.color || 'coral'})` }}/>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
