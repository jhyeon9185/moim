// Icons.jsx — 모임 앱 라인 아이콘 세트 (24px)
const IconBase = ({ size = 24, children, fill = 'none', stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth={stroke}
    strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    {children}
  </svg>
);

export const IHome = (p) => <IconBase {...p}><path d="M3 11.5 L12 4 L21 11.5 V19.5 A1.5 1.5 0 0 1 19.5 21 H4.5 A1.5 1.5 0 0 1 3 19.5 Z"/><path d="M9.5 21 V14 H14.5 V21"/></IconBase>;
export const ICalendar = (p) => <IconBase {...p}><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 9.5 H20.5"/><path d="M8 3 V6.5"/><path d="M16 3 V6.5"/><circle cx="8" cy="14" r="0.6" fill="currentColor"/><circle cx="12" cy="14" r="0.6" fill="currentColor"/><circle cx="16" cy="14" r="0.6" fill="currentColor"/></IconBase>;
export const IBell = (p) => <IconBase {...p}><path d="M6 16 V11 A6 6 0 0 1 18 11 V16 L20 19 H4 Z"/><path d="M10 19 A2 2 0 0 0 14 19"/></IconBase>;
export const IUser = (p) => <IconBase {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21 Q4 14 12 14 Q20 14 20 21"/></IconBase>;
export const IPlus = (p) => <IconBase {...p}><path d="M12 5 V19"/><path d="M5 12 H19"/></IconBase>;
export const ISearch = (p) => <IconBase {...p}><circle cx="11" cy="11" r="6.5"/><path d="M16 16 L20 20"/></IconBase>;
export const IBack = (p) => <IconBase {...p}><path d="M15 5 L8 12 L15 19"/></IconBase>;
export const IChevR = (p) => <IconBase {...p}><path d="M9 5 L16 12 L9 19"/></IconBase>;
export const IChevL = (p) => <IconBase {...p}><path d="M15 5 L8 12 L15 19"/></IconBase>;
export const IChevD = (p) => <IconBase {...p}><path d="M5 9 L12 16 L19 9"/></IconBase>;
export const ISettings = (p) => <IconBase {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></IconBase>;
export const IPin = (p) => <IconBase {...p}><path d="M12 22 S5 14.5 5 10 a7 7 0 0 1 14 0 c0 4.5-7 12-7 12Z"/><circle cx="12" cy="10" r="2.5"/></IconBase>;
export const IClock = (p) => <IconBase {...p}><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5 V12 L15 14"/></IconBase>;
export const IPencil = (p) => <IconBase {...p}><path d="M16 4 L20 8 L8 20 H4 V16 Z"/><path d="M14 6 L18 10"/></IconBase>;
export const ITrash = (p) => <IconBase {...p}><path d="M5 7 H19"/><path d="M9 7 V4 H15 V7"/><path d="M6.5 7 L8 20 H16 L17.5 7"/></IconBase>;
export const ILink = (p) => <IconBase {...p}><path d="M10.5 13.5 a3 3 0 0 0 4.2 0 L18 10.2 a3 3 0 0 0-4.2-4.2 L13 6.8"/><path d="M13.5 10.5 a3 3 0 0 0-4.2 0 L6 13.8 a3 3 0 0 0 4.2 4.2 L11 17.2"/></IconBase>;
export const ICheck = (p) => <IconBase {...p}><path d="M5 12.5 L10 17.5 L19 7.5"/></IconBase>;
export const IX = (p) => <IconBase {...p}><path d="M6 6 L18 18"/><path d="M18 6 L6 18"/></IconBase>;
export const IKakao = (p) => <svg width={p?.size||24} height={p?.size||24} viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 3 7.7 3 11.6c0 2.5 1.7 4.7 4.3 5.9l-1 3.5c-.1.4.3.7.6.5l4.1-2.7c.3 0 .7.1 1 .1 5 0 9-3.2 9-7.1S17 4.5 12 4.5Z"/></svg>;
export const IGoogle = (p) => <svg width={p?.size||24} height={p?.size||24} viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2a9.7 9.7 0 0 0 3-7.3z"/><path fill="#34A853" d="M12 22a9.5 9.5 0 0 0 6.6-2.4l-3.2-2.5a6 6 0 0 1-9-3.1H3.1v2.5A10 10 0 0 0 12 22z"/><path fill="#FBBC04" d="M6.4 14a6 6 0 0 1 0-3.8V7.7H3.1a10 10 0 0 0 0 8.7L6.4 14z"/><path fill="#EA4335" d="M12 6.2a5.4 5.4 0 0 1 3.8 1.5l2.9-2.9A9.6 9.6 0 0 0 12 2 10 10 0 0 0 3.1 7.7l3.3 2.5A6 6 0 0 1 12 6.2z"/></svg>;
export const ILogout = (p) => <IconBase {...p}><path d="M14 4 H5 V20 H14"/><path d="M10 12 H21"/><path d="M17 8 L21 12 L17 16"/></IconBase>;
export const ICamera = (p) => <IconBase {...p}><path d="M3 7 H7 L9 4 H15 L17 7 H21 V19 H3 Z"/><circle cx="12" cy="13" r="4"/></IconBase>;
export const IDots = (p) => <IconBase {...p}><circle cx="6" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="18" cy="12" r="1.4" fill="currentColor"/></IconBase>;
