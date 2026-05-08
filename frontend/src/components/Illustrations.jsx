export const IllusHouse = ({ size = 64, accent = 'var(--clay)' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="32" fill="var(--clay-100)"/>
    <path d="M14 34 L32 18 L50 34 L50 48 Q50 50 48 50 L16 50 Q14 50 14 48 Z" fill={accent}/>
    <rect x="27" y="38" width="10" height="12" rx="1.5" fill="var(--surface)"/>
    <circle cx="34" cy="44" r="0.9" fill={accent}/>
    <path d="M11 35 L32 16 L53 35" stroke="var(--ink-900)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="40" y="22" width="4" height="8" rx="1" fill="var(--wood)"/>
  </svg>
);

export const IllusCalendar = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    <rect x="8" y="14" width="64" height="58" rx="10" fill="var(--surface)" stroke="var(--ink-900)" strokeWidth="2"/>
    <rect x="8" y="14" width="64" height="14" rx="10" fill="var(--clay)"/>
    <rect x="8" y="22" width="64" height="6" fill="var(--clay)"/>
    <rect x="20" y="8" width="4" height="14" rx="2" fill="var(--ink-900)"/>
    <rect x="56" y="8" width="4" height="14" rx="2" fill="var(--ink-900)"/>
    <circle cx="22" cy="44" r="3" fill="var(--tag-sage)"/>
    <circle cx="34" cy="44" r="3" fill="var(--paper-200)"/>
    <circle cx="46" cy="44" r="3" fill="var(--tag-mustard)"/>
    <circle cx="58" cy="44" r="3" fill="var(--paper-200)"/>
    <circle cx="22" cy="58" r="3" fill="var(--paper-200)"/>
    <circle cx="34" cy="58" r="3" fill="var(--tag-coral)"/>
    <circle cx="46" cy="58" r="3" fill="var(--paper-200)"/>
    <circle cx="58" cy="58" r="3" fill="var(--tag-sky)"/>
  </svg>
);

export const IllusLogo = ({ size = 88 }) => (
  <svg width={size} height={size} viewBox="0 0 88 88" fill="none">
    <rect x="2" y="2" width="84" height="84" rx="22" fill="var(--clay)"/>
    <rect x="2" y="2" width="84" height="84" rx="22" fill="url(#logo-grain)" opacity="0.15"/>
    <defs>
      <radialGradient id="logo-grain" cx="0.3" cy="0.2" r="0.9">
        <stop offset="0" stopColor="#fff" stopOpacity="0.4"/>
        <stop offset="1" stopColor="#000" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="32" cy="36" r="9" fill="var(--paper-50)"/>
    <path d="M18 66 Q18 50 32 50 Q40 50 43 56 L43 70 L18 70 Z" fill="var(--paper-50)"/>
    <circle cx="58" cy="34" r="10" fill="var(--paper-100)"/>
    <path d="M44 70 L44 56 Q47 48 58 48 Q72 48 72 66 L72 70 Z" fill="var(--paper-100)"/>
    <path d="M44 38 C42 34 36 35 38 40 C39 43 44 46 44 46 C44 46 49 43 50 40 C52 35 46 34 44 38 Z" fill="var(--clay-600)"/>
  </svg>
);
