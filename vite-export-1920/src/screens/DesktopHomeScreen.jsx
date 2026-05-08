import { Avatar } from '../components/MoimUI.jsx';
import { IHome, ICalendar, IBell, IUser, IPlus, ISearch, IClock, IPin, ISettings } from '../components/Icons.jsx';
import { IllusLogo, IllusCalendar } from '../components/Illustrations.jsx';
import { MonthCalendar } from '../components/Calendar.jsx';

function DRailItem({ day, dow, color, title, sub }) {
  return (
    <div style={{
      display: 'flex', gap: 12, alignItems: 'flex-start',
      padding: '10px 6px', borderRadius: 'var(--r-sm)', cursor: 'pointer',
    }}>
      <div style={{
        width: 42, padding: '6px 0', borderRadius: 'var(--r-sm)',
        background: `var(--tag-${color}-bg)`,
        textAlign: 'center', flexShrink: 0,
      }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: `var(--tag-${color})`, lineHeight: 1, letterSpacing: '-0.02em' }}>{day}</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: `var(--tag-${color})`, opacity: 0.8, marginTop: 2 }}>{dow}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 500, marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

export default function DesktopHomeScreen() {
  return (
    <div className="moim paper-grain" style={{
      width: '100%', height: '100%', overflow: 'hidden',
      display: 'grid', gridTemplateColumns: '280px 1fr 420px',
      background: 'var(--paper-50)', fontFamily: 'var(--font-sans)',
    }}>
      <aside style={{
        background: 'var(--surface)', borderRight: '1px solid var(--paper-200)',
        padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px 22px' }}>
          <IllusLogo size={42}/>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.025em' }}>모임</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-500)', fontWeight: 600 }}>가족과 모이는 시간</div>
          </div>
        </div>
        {[
          ['홈', IHome, true],
          ['전체 캘린더', ICalendar, false],
          ['알림', IBell, false, true],
          ['마이페이지', IUser, false],
        ].map(([l, I, a, dot]) => (
          <button key={l} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', borderRadius: 'var(--r-md)',
            background: a ? 'var(--clay-100)' : 'transparent',
            color: a ? 'var(--clay)' : 'var(--ink-700)',
            fontSize: 14.5, fontWeight: a ? 700 : 600,
            position: 'relative', textAlign: 'left',
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <I size={20}/>
            <span style={{ flex: 1 }}>{l}</span>
            {dot && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--clay)' }}/>}
          </button>
        ))}
        <div style={{ height: 1, background: 'var(--paper-200)', margin: '14px 4px' }}/>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-500)', padding: '6px 14px 4px', letterSpacing: '0.06em' }}>내 모임</div>
        {[
          ['우리 가족', 'clay', '🏠'],
          ['동기 모임', 'sage', '🌿'],
          ['독서 모임', 'sky', '📖'],
        ].map(([n, c, e]) => (
          <button key={n} style={{
            display: 'flex', alignItems: 'center', gap: 11,
            padding: '9px 14px', borderRadius: 'var(--r-md)',
            color: 'var(--ink-700)', fontSize: 13.5, fontWeight: 600,
            textAlign: 'left', background: 'transparent',
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <span style={{
              width: 30, height: 30, borderRadius: 'var(--r-sm)',
              background: `var(--tag-${c}-bg)`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
            }}>{e}</span>
            {n}
          </button>
        ))}
        <button style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 14px', borderRadius: 'var(--r-md)',
          color: 'var(--ink-500)', fontSize: 13, fontWeight: 600,
          background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <IPlus size={16}/> 새 모임 만들기
        </button>
        <div style={{ flex: 1, minHeight: 24 }}/>
        <div style={{
          background: 'var(--paper-100)', padding: '12px 14px', borderRadius: 'var(--r-md)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Avatar name="윤서연" size={38} color="var(--wood)"/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>윤서연</div>
            <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>seoyeon@moim.kr</div>
          </div>
          <ISettings size={18}/>
        </div>
      </aside>

      <main style={{ overflow: 'auto', padding: '36px 56px 56px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-500)', fontWeight: 700 }}>2026년 5월 9일 토요일</div>
            <h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 6 }}>안녕하세요, 윤서연님 👋</h1>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--surface)', border: '1px solid var(--paper-200)',
              borderRadius: 'var(--r-pill)', padding: '0 18px', height: 44,
              color: 'var(--ink-500)', minWidth: 320,
            }}>
              <ISearch size={18}/>
              <span style={{ fontSize: 14, fontWeight: 500 }}>일정, 모임, 멤버 검색…</span>
              <span style={{ marginLeft: 'auto', padding: '2px 7px', borderRadius: 4, background: 'var(--paper-100)', fontSize: 11, fontWeight: 700, color: 'var(--ink-500)' }}>⌘ K</span>
            </div>
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 44, padding: '0 18px', borderRadius: 'var(--r-pill)',
              background: 'var(--clay)', color: '#fff',
              fontSize: 14, fontWeight: 700,
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <IPlus size={16}/> 일정 추가
            </button>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, var(--clay) 0%, #B85838 100%)',
          color: '#fff', borderRadius: 'var(--r-xl)', padding: 36,
          marginBottom: 28, position: 'relative', overflow: 'hidden',
          boxShadow: 'var(--shadow-2)',
          display: 'flex', alignItems: 'center', gap: 32,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.85, marginBottom: 8, letterSpacing: '0.02em' }}>오늘의 일정 · 1건</div>
            <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 12 }}>수민 어린이집 학부모회</div>
            <div style={{ display: 'flex', gap: 22, fontSize: 15, opacity: 0.95 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IClock size={16}/> 오후 2:00 — 4:00</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IPin size={16}/> 서초 어린이집 · 2층 회의실</span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button style={{ padding: '12px 20px', borderRadius: 'var(--r-pill)', background: '#fff', color: 'var(--clay)', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>자세히 보기</button>
              <button style={{ padding: '12px 20px', borderRadius: 'var(--r-pill)', background: 'rgba(255,255,255,0.18)', color: '#fff', backdropFilter: 'blur(4px)', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>지도 열기</button>
              <button style={{ padding: '12px 20px', borderRadius: 'var(--r-pill)', background: 'transparent', color: '#fff', fontSize: 14, fontWeight: 700, border: '1.5px solid rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'inherit' }}>멤버에게 알림</button>
            </div>
          </div>
          <div style={{ opacity: 0.9, flexShrink: 0 }}>
            <IllusCalendar size={180}/>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
          {[
            { num: '3', l: '참여 모임', c: 'clay', sub: '+1 이번 달' },
            { num: '12', l: '이번 달 일정', c: 'sage', sub: '5개 다가옴' },
            { num: '47', l: '함께한 순간', c: 'mustard', sub: '평균 월 4회' },
            { num: '28', l: '연결된 가족', c: 'rose', sub: '3개 모임 통합' },
          ].map(s => (
            <div key={s.l} style={{
              background: 'var(--surface)', border: '1px solid var(--paper-200)',
              borderRadius: 'var(--r-lg)', padding: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--ink-500)', fontWeight: 600, marginBottom: 6 }}>{s.l}</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: `var(--tag-${s.c})`, letterSpacing: '-0.02em', lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-500)', fontWeight: 600, marginTop: 6 }}>{s.sub}</div>
              </div>
              <div style={{
                width: 52, height: 52, borderRadius: 'var(--r-md)',
                background: `var(--tag-${s.c}-bg)`,
                color: `var(--tag-${s.c})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <ICalendar size={24} stroke={2}/>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>내 모임</h2>
              <button style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 13, fontWeight: 700, color: 'var(--clay)',
                background: 'var(--clay-100)', padding: '8px 14px', borderRadius: 'var(--r-pill)',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <IPlus size={14}/> 새 모임 만들기
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { name: '우리 가족', c: 'clay', e: '🏠', m: 5, next: '5월 12일 어버이날 식사', members: ['윤', '진', '수', '민', '지'] },
                { name: '동기 모임', c: 'sage', e: '🌿', m: 8, next: '5월 18일 캠핑 1박', members: ['김', '이', '박', '최', '정', '강', '조', '윤'] },
                { name: '독서 모임', c: 'sky', e: '📖', m: 6, next: '5월 22일 정모', members: ['김', '이', '박', '최', '정', '강'] },
                { name: '동네 친구', c: 'mustard', e: '🏘', m: 4, next: '6월 1일 모임', members: ['박', '최', '정', '강'] },
              ].map(g => (
                <div key={g.name} style={{
                  background: 'var(--surface)', border: '1px solid var(--paper-200)',
                  borderRadius: 'var(--r-lg)', padding: 20, boxShadow: 'var(--shadow-1)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 'var(--r-md)',
                      background: `var(--tag-${g.c}-bg)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                    }}>{g.e}</div>
                    <div style={{ display: 'flex' }}>
                      {g.members.slice(0, 4).map((mn, i) => (
                        <div key={i} style={{
                          width: 26, height: 26, borderRadius: '50%',
                          background: i % 2 ? 'var(--wood)' : 'var(--clay)',
                          color: '#fff', fontSize: 11, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '2px solid var(--surface)', marginLeft: i ? -7 : 0,
                        }}>{mn}</div>
                      ))}
                      {g.m > 4 && (
                        <div style={{
                          width: 26, height: 26, borderRadius: '50%',
                          background: 'var(--paper-200)', color: 'var(--ink-700)',
                          fontSize: 10, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '2px solid var(--surface)', marginLeft: -7,
                        }}>+{g.m - 4}</div>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.015em', marginBottom: 4 }}>{g.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-500)', marginBottom: 12 }}>멤버 {g.m}명</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-700)', fontWeight: 600,
                    padding: '10px 12px', background: 'var(--paper-100)', borderRadius: 'var(--r-sm)',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <IClock size={13}/> {g.next}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 14 }}>최근 활동</h2>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--paper-200)',
              borderRadius: 'var(--r-lg)', padding: '6px 0', boxShadow: 'var(--shadow-1)',
            }}>
              {[
                { who: '민준', what: '동기 캠핑 일정을 추가했어요', when: '2시간 전', c: 'sage' },
                { who: '수민', what: '우리 가족 모임에 참여했어요', when: '월요일', c: 'clay' },
                { who: '엄마', what: '어버이날 식사 장소를 변경', when: '월요일', c: 'mustard' },
                { who: '독서모임', what: '정모 일정이 22일→25일 변경', when: '일요일', c: 'sky' },
                { who: '아빠', what: '생신 1주일 전 알림', when: '3일 전', c: 'plum' },
              ].map((a, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 11, alignItems: 'flex-start',
                  padding: '12px 16px', borderTop: i ? '1px solid var(--paper-200)' : 'none',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: `var(--tag-${a.c}-bg)`,
                    color: `var(--tag-${a.c})`,
                    fontSize: 13, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>{a.who.slice(0, 1)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, lineHeight: 1.45 }}>
                      <span style={{ fontWeight: 700 }}>{a.who}</span>
                      <span style={{ color: 'var(--ink-700)' }}>님이 {a.what}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-500)', fontWeight: 500, marginTop: 2 }}>{a.when}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <aside style={{
        borderLeft: '1px solid var(--paper-200)',
        background: 'var(--surface)',
        padding: '36px 26px', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em' }}>이번 달 일정</h3>
          <button style={{ fontSize: 12.5, color: 'var(--clay)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>전체 보기</button>
        </div>
        <div style={{ marginBottom: 26 }}>
          <MonthCalendar
            year={2026} month={5} today={{ y:2026, m:5, d:9 }}
            events={{
              '2026-05-09': [{ color: 'coral' }],
              '2026-05-12': [{ color: 'mustard' }, { color: 'sage' }],
              '2026-05-15': [{ color: 'sky' }],
              '2026-05-18': [{ color: 'sage' }],
              '2026-05-22': [{ color: 'sky' }],
              '2026-05-25': [{ color: 'plum' }],
              '2026-05-30': [{ color: 'rose' }],
            }}
            selected={null}
            compact
          />
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-500)', fontWeight: 700, padding: '0 4px 8px', letterSpacing: '0.04em' }}>다가오는 일정</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <DRailItem day="12" dow="화" color="mustard" title="어버이날 가족 식사" sub="우리 가족 · 18:30"/>
          <DRailItem day="15" dow="금" color="sky" title="스승의날 카드" sub="개인"/>
          <DRailItem day="18" dow="월" color="sage" title="동기 캠핑" sub="동기 모임 · 1박 2일"/>
          <DRailItem day="22" dow="금" color="sky" title="독서 정모" sub="독서 모임 · 19:30"/>
          <DRailItem day="25" dow="월" color="plum" title="아빠 생신" sub="우리 가족"/>
          <DRailItem day="30" dow="토" color="rose" title="주말 나들이" sub="우리 가족 · 미정"/>
        </div>
      </aside>
    </div>
  );
}
