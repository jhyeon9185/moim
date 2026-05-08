import { IHome, ICalendar, IBell, IUser, IChevR } from './Icons.jsx';

export function Avatar({ name = '', src = null, size = 40, color = 'var(--clay)', ring = false }) {
  const initial = name ? name.slice(0, 1) : '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: src ? `url(${src}) center/cover` : color,
      color: '#fff', fontWeight: 700, fontSize: size * 0.42,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      boxShadow: ring ? '0 0 0 3px var(--surface), 0 0 0 5px var(--clay-100)' : 'none',
    }}>{!src && initial}</div>
  );
}

export function Tag({ children, color = 'clay', size = 'sm' }) {
  const map = {
    clay: ['var(--tag-coral-bg)', 'var(--tag-coral)'],
    sage: ['var(--tag-sage-bg)', 'var(--tag-sage)'],
    mustard: ['var(--tag-mustard-bg)', 'var(--tag-mustard)'],
    plum: ['var(--tag-plum-bg)', 'var(--tag-plum)'],
    sky: ['var(--tag-sky-bg)', 'var(--tag-sky)'],
    rose: ['var(--tag-rose-bg)', 'var(--tag-rose)'],
    neutral: ['var(--paper-200)', 'var(--ink-700)'],
  };
  const [bg, fg] = map[color] || map.clay;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: bg, color: fg,
      padding: size === 'sm' ? '3px 9px' : '5px 12px',
      borderRadius: 'var(--r-pill)',
      fontSize: size === 'sm' ? 11.5 : 13, fontWeight: 700,
      letterSpacing: '-0.01em', whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

export function Button({ variant = 'primary', size = 'md', icon = null, full = false, children, onClick, style = {}, disabled = false }) {
  const sizes = { sm: { h: 36, fs: 14, px: 14, r: 'var(--r-sm)' }, md: { h: 48, fs: 15.5, px: 18, r: 'var(--r-md)' }, lg: { h: 56, fs: 16.5, px: 20, r: 'var(--r-md)' } };
  const s = sizes[size];
  const variants = {
    primary: { bg: 'var(--clay)', fg: '#fff', bd: 'transparent' },
    secondary: { bg: 'var(--surface)', fg: 'var(--ink-900)', bd: 'var(--paper-300)' },
    ghost: { bg: 'transparent', fg: 'var(--ink-700)', bd: 'transparent' },
    danger: { bg: 'transparent', fg: 'var(--danger)', bd: 'transparent' },
    wood: { bg: 'var(--wood)', fg: '#fff', bd: 'transparent' },
  };
  const v = variants[variant] || variants.primary;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      height: s.h, padding: `0 ${s.px}px`, borderRadius: s.r,
      background: v.bg, color: v.fg, border: `1.5px solid ${v.bd}`,
      fontSize: s.fs, fontWeight: 700, letterSpacing: '-0.015em',
      width: full ? '100%' : 'auto', opacity: disabled ? 0.45 : 1,
      cursor: 'pointer', fontFamily: 'inherit',
      ...style,
    }}>{icon}{children}</button>
  );
}

export function TabBar({ active = 'home', onChange = () => {}, hasNotif = false, safeBottom = 24 }) {
  const tabs = [
    { id: 'home', label: '홈', Icon: IHome },
    { id: 'calendar', label: '캘린더', Icon: ICalendar },
    { id: 'notif', label: '알림', Icon: IBell, dot: hasNotif },
    { id: 'me', label: '마이', Icon: IUser },
  ];
  return (
    <nav style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      paddingBottom: safeBottom,
      background: 'color-mix(in srgb, var(--surface) 92%, transparent)',
      backdropFilter: 'blur(20px) saturate(1.4)',
      WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
      borderTop: '1px solid var(--paper-200)',
      zIndex: 50,
    }}>
      <div style={{ display: 'flex', height: 60 }}>
        {tabs.map(t => {
          const isActive = active === t.id;
          return (
            <button key={t.id} onClick={() => onChange(t.id)} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 3,
              color: isActive ? 'var(--clay)' : 'var(--ink-500)',
              position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit',
            }}>
              <div style={{ position: 'relative' }}>
                <t.Icon size={24} stroke={isActive ? 2.2 : 1.8}/>
                {t.dot && <span style={{
                  position: 'absolute', top: -1, right: -2,
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--clay)', border: '2px solid var(--surface)',
                }}/>}
              </div>
              <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500 }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function AppHeader({ title, left = null, right = null, subtitle = null, transparent = false }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 16px 12px', minHeight: 52,
      background: transparent ? 'transparent' : 'var(--paper-50)',
      position: 'relative', zIndex: 10,
    }}>
      <div style={{ width: 40, display: 'flex', justifyContent: 'flex-start' }}>{left}</div>
      <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        {subtitle && <div style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600 }}>{subtitle}</div>}
        <h1 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</h1>
      </div>
      <div style={{ width: 40, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </header>
  );
}

export function IconButton({ Icon, onClick, size = 40, iconSize = 22, tone = 'ink' }) {
  const c = tone === 'clay' ? 'var(--clay)' : tone === 'danger' ? 'var(--danger)' : 'var(--ink-700)';
  return (
    <button onClick={onClick} style={{
      width: size, height: size, borderRadius: '50%',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: c, background: 'none', border: 'none', cursor: 'pointer',
    }}><Icon size={iconSize}/></button>
  );
}

export function Section({ title, action = null, children, style = {} }) {
  return (
    <section style={{ marginBottom: 24, ...style }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px 10px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-700)', letterSpacing: '-0.01em', margin: 0 }}>{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function BottomSheet({ open = true, onClose = () => {}, children, height = 'auto', anchored = true }) {
  if (!open) return null;
  return (
    <div style={{
      position: anchored ? 'absolute' : 'fixed',
      inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(40, 30, 20, 0.45)', backdropFilter: 'blur(2px)' }}/>
      <div style={{
        position: 'relative', background: 'var(--surface-raised)',
        borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
        boxShadow: 'var(--shadow-3)', padding: '10px 20px 24px',
        maxHeight: '85%', overflowY: 'auto',
        height: height === 'auto' ? 'auto' : height,
      }}>
        <div style={{ width: 40, height: 4, background: 'var(--paper-300)', borderRadius: 999, margin: '0 auto 12px' }}/>
        {children}
      </div>
    </div>
  );
}

export function TextField({ label, value, onChange = () => {}, placeholder = '', icon = null, type = 'text', helper = null }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--ink-700)', marginBottom: 6, paddingLeft: 4 }}>{label}</label>}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--surface-sunken)',
        border: '1.5px solid transparent', borderRadius: 'var(--r-md)',
        padding: '0 14px', height: 52,
      }}>
        {icon && <span style={{ color: 'var(--ink-500)' }}>{icon}</span>}
        <input
          type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontSize: 16, fontWeight: 500, color: 'var(--ink-900)',
            letterSpacing: '-0.01em', fontFamily: 'inherit',
          }}
        />
      </div>
      {helper && <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 6, paddingLeft: 4 }}>{helper}</div>}
    </div>
  );
}

export function Card({ children, padding = 16, raised = false, style = {}, onClick = null }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--surface)', border: '1px solid var(--paper-200)',
      borderRadius: 'var(--r-lg)', padding,
      boxShadow: raised ? 'var(--shadow-2)' : 'var(--shadow-1)',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}>{children}</div>
  );
}
