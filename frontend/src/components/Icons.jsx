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
export const IUsers = (p) => <IconBase {...p}><circle cx="9" cy="8" r="3.5"/><path d="M2 21 Q2 15 9 15 Q16 15 16 21"/><circle cx="17" cy="8" r="2.5"/><path d="M20 21 Q22 21 22 18.5 Q22 15.5 17 15.5"/></IconBase>;

// design.dev icons
export const IDesignHouse = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 50.6 45.33" fill={color}>
    <path d="m49.6,23.21L28.14,1.19c-1.56-1.59-4.12-1.59-5.68,0L1,23.21c-2.16,2.22-.59,5.95,2.51,5.95h3.53v14.19c0,1.09.89,1.98,1.97,1.98h8.02c1.09,0,1.97-.89,1.97-1.98v-12.13c0-1.14.93-2.06,2.06-2.06h8.48c1.14,0,2.06.92,2.06,2.06v12.13c0,1.09.88,1.98,1.97,1.98h8.02c1.08,0,1.97-.89,1.97-1.97v-14.2h3.53c3.1,0,4.67-3.73,2.51-5.95Zm-29.57-10.66l-7.54,7.81c-.29.3-.68.45-1.08.45-.37,0-.75-.14-1.04-.42-.59-.57-.61-1.52-.04-2.12l7.54-7.81c.57-.59,1.52-.61,2.12-.04.59.58.61,1.53.04,2.13Zm4-4.13l-.87.86c-.29.29-.67.44-1.06.44s-.76-.15-1.06-.44c-.58-.59-.58-1.53,0-2.12l.87-.87c.59-.58,1.54-.58,2.12,0,.59.59.59,1.54,0,2.13Z"/>
  </svg>
);

export const IDesignClock = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 46.76 47.68" fill={color}>
    <path d="m22.92,0c-4.8,0-9.42,1.42-13.38,4.1-.4.27-.79.56-1.17.86l3.73,2.64c3.2-2.15,6.94-3.28,10.82-3.28,10.76,0,19.52,8.76,19.52,19.53,0,1.28-.12,2.56-.36,3.81-.24,1.17.53,2.3,1.7,2.53.14.03.28.04.42.04,1.01,0,1.91-.71,2.11-1.74.3-1.52.45-3.08.45-4.64C46.76,10.7,36.07,0,22.92,0Z"/>
    <path d="m2.51,17.65l10.84-2.96c.7-.19,1.06-.84.99-1.46-.03-.36-.21-.72-.56-.97l-4.01-2.84-3.59-2.55-3.81-2.7-.22-.16C1.21,3.35-.08,4.07,0,5.22l.79,11.21c.06.85.89,1.44,1.72,1.22Z"/>
  </svg>
);

export const IDesignMail = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 46.41 37.1" fill={color}>
    <path d="m40.44,0H5.97C2.68,0,0,2.68,0,5.97v25.15c0,3.29,2.68,5.97,5.97,5.97h30.73v-3.24H6.32l17-13.34,19.93,15.64v.02c2.02-1.12,3.17-2.96,3.17-5.05V5.97c0-3.29-2.68-5.97-5.97-5.97Zm-.36,3.24l-16.77,13.16L6.54,3.24h33.54ZM3.4,32.02c-.1-.28-.16-.58-.16-.9V5.97c0-.37.08-.72.21-1.04l17.24,13.53L3.4,32.02ZM43.01,5.07c.1.29.17.59.17.91v25.15c0,.28-.05.53-.14.75l-17.1-13.42,17.07-13.39Z"/>
  </svg>
);

export const IDesignBox = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 48.61 42.53" fill={color}>
    <path d="m41.27,0H7.34C3.29,0,0,3.29,0,7.34v27.85c0,4.05,3.29,7.34,7.34,7.34h33.93v-3H7.34c-2.39,0-4.34-1.95-4.34-4.34V7.34c0-2.39,1.95-4.34,4.34-4.34h33.93c2.39,0,4.34,1.95,4.34,4.34v27.85h3V7.34c0-4.05-3.29-7.34-7.34-7.34Z"/>
    <path d="m11.2,8.15c-1.76,0-3.18,1.43-3.18,3.18v6.63c0,.83.67,1.5,1.5,1.5s1.5-.67,1.5-1.5v-6.63c0-.1.08-.18.18-.18h7.45c.83,0,1.5-.67,1.5-1.5s-.67-1.5-1.5-1.5h-7.45Z"/>
  </svg>
);

export const IDesignWave = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 45.61 47.27" fill={color}>
    <path d="m44.42,13.22c-1.16-.71-2.7-.33-3.41.83l-4.51,7.39-.03.07c-.88,1.45-2.47,1.22-2.28-.33l.03-.17,2.34-15.11c.22-1.48-.79-2.86-2.26-3.08-1.48-.26-2.85.78-3.08,2.25l-2.19,14.16c-.34,1.26-2.11,1.01-2.12-.34V2.7c0-1.49-1.21-2.7-2.7-2.7s-2.7,1.21-2.7,2.7v15.53c-.06.66-.57,1.11-1.15,1.11-.49,0-1.03-.33-1.37-1.17l-4.87-13.07c-.52-1.4-2.09-2.1-3.47-1.59-1.4.53-2.11,2.08-1.59,3.47l4.98,13.37c.66,2.83,1.16,5.55-.06,6.94-1.63,1.85-3.84.41-4.04.22l-5.45-4.78c-1.13-.99-2.83-.87-3.81.25-.99,1.12-.88,2.83.25,3.81l7.78,6.83c.5.43.92.92,1.28,1.47,1.24,1.92,3.54,5.47,3.9,6.13,2,3.65,5.93,6.05,10.33,6.05,5.62,0,10.45-3.91,11.51-9.32l2.6-9.03c.33-1.17.83-2.3,1.47-3.34l5.45-8.94c.71-1.17.34-2.7-.83-3.42Zm-21.61,28.63c-.08,0-.16,0-.23-.02-5.35-1.01-6.14-5.93-6.17-6.14-.1-.68.37-1.32,1.05-1.42.68-.11,1.32.37,1.42,1.05.03.16.61,3.38,4.16,4.05.68.13,1.12.79,1,1.46-.12.6-.64,1.02-1.23,1.02Z"/>
  </svg>
);

export const IDesignPin = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 45.1 54.48" fill={color}>
    <path d="m1.62,0C.73,0,0,.73,0,1.62v51.24c0,.89.73,1.62,1.62,1.62s1.62-.73,1.62-1.62V1.62c0-.89-.73-1.62-1.62-1.62Z"/>
    <path d="m9.25,23.59h18.79c1.53,0,2.77-1.24,2.77-2.77v-11.95c0-1.53-1.24-2.77-2.77-2.77H9.25c-1.53,0-2.77,1.24-2.77,2.77v11.95c0,1.53,1.24,2.77,2.77,2.77Zm-.29-12.99c0-1.21.98-2.19,2.19-2.19h2.7c.55,0,1,.44,1,1s-.45,1-1,1h-2.7c-.11,0-.19.08-.19.19v3.5c0,.55-.45,1-1,1s-1-.45-1-1v-3.5Z"/>
    <path d="m42.08,30.34H9.5c-1.67,0-3.02,1.35-3.02,3.02v8.99c0,1.66,1.35,3.01,3.02,3.01h32.58c1.67,0,3.02-1.35,3.02-3.01v-8.99c0-1.67-1.35-3.02-3.02-3.02Zm-28.49,4.3h-2.69c-.11,0-.2.08-.2.19v3.5c0,.55-.45,1-1,1s-1-.45-1-1v-3.5c0-1.21.99-2.19,2.2-2.19h2.69c.55,0,1,.44,1,1s-.45,1-1,1Z"/>
  </svg>
);
