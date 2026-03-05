'use client';
import { useState, useEffect } from 'react';
import type { PageData } from '../lib/fetchHealthData';

const SANS = "'Noto Sans KR', sans-serif";

const C = {
  primary:     '#007A33',
  deepBlue:    '#002B49',
  yellow:      '#FFC845',
  brightGreen: '#97D700',
  red:         '#E4002B',
  mildBlue:    '#0072CE',
  mildGreen:   '#43B02A',
  bg:          '#f2f4f3',
  white:       '#ffffff',
  text:        '#111827',
  textSub:     '#6b7280',
  border:      '#e5e7eb',
};

const TAGS_3040 = [
  '만성 피로', '수면 부채', '혈압 불안',
  '소화 장애', '허리 통증', '눈 피로',
  '번아웃', '혈당 걱정', '두통',
];

const AI_COMMENT =
  '이번 주 검색 1위는 기침·가슴통증입니다. 3월 인사이동 시즌이 시작됐고, 2위엔 우울증과 불면증이 함께 올라왔습니다. 따로 검색하지 않고 붙여서 검색한다는 건 이미 둘이 동시에 오고 있다는 뜻입니다.';

const EXPERT_COMMENT =
  '수면 1.2시간 감소와 공황장애 검색 급등은 밀접한 상관관계가 있습니다. 3월 초 직장인의 심리적 소진(Burn-out)이 데이터로 증명된 셈입니다.';

const RECEIPT_ITEMS = [
  { emoji: '😰', label: '공황·불안 급등 청구',   amount: -12000 },
  { emoji: '😴', label: '수면 부채 누적 이자',    amount: -9500  },
  { emoji: '🫀', label: '혈압·당뇨 방치 연체료',  amount: -9000  },
  { emoji: '🌡️', label: '환절기 면역 하락',       amount: -8000  },
];

const TREND: Record<string, { label: string; color: string; bg: string }> = {
  up:   { label: '▲ 급등', color: C.red,       bg: '#fce8eb' },
  new:  { label: 'NEW',    color: C.mildGreen,  bg: '#edfce8' },
  down: { label: '▼',      color: C.mildBlue,   bg: '#e8f3fc' },
  same: { label: '—',      color: '#9ca3af',    bg: '#f3f4f6' },
};

function fmt(n: number) {
  return `${n >= 0 ? '+' : ''}${n.toLocaleString()}원`;
}

export default function HealthReceipt({ data }: { data: PageData }) {
  const [loaded,      setLoaded]      = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [checked,     setChecked]     = useState<Record<string, boolean>>({});
  const [expanded,    setExpanded]    = useState<string | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap';
    document.head.appendChild(link);

    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18 + 6;
      if (p >= 100) { p = 100; clearInterval(iv); }
      setProgress(Math.min(p, 100));
    }, 70);

    const timer = setTimeout(() => setLoaded(true), 1900);

    return () => {
      clearInterval(iv);
      clearTimeout(timer);
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);

  const toggle      = (kw: string) => setChecked(p => ({ ...p, [kw]: !p[kw] }));
  const checkedKws  = data.keywords.filter(k => checked[k.kw]);
  const myTotal     = checkedKws.reduce((s, k) => s - (11 - k.rank) * 1000, 0);
  const hasChecked  = checkedKws.length > 0;

  const kwSet       = new Set(data.keywords.map(k => k.kw));
  const isHighlight = (tag: string) =>
    [...kwSet].some(k => tag.includes(k.slice(0, 2)) || k.includes(tag.slice(0, 2)));

  const top4 = data.keywords.slice(0, 4);

  /* ── Loading screen ── */
  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', background: C.deepBlue, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: SANS }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 5, marginBottom: 28 }}>GC HEALTH WEEKLY</div>
        <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 6 }}>건강 영수증</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 48 }}>3040 직장인 주간 건강 리포트</div>
        <div style={{ width: 240, height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${C.primary}, ${C.brightGreen})`, borderRadius: 3, transition: 'width 0.08s linear' }} />
        </div>
        <div style={{ marginTop: 14, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>데이터 로딩 중...</div>
      </div>
    );
  }

  /* ── Main render ── */
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: SANS, color: C.text }}>
      <style>{`@keyframes gcFadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>

      {/* Nav */}
      <nav style={{ background: C.white, position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 8px rgba(0,0,0,0.08)', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: C.primary, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 11, fontWeight: 900 }}>GC</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: C.deepBlue }}>Health Weekly</span>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            {['주간리포트', '3040 직장인', '건강트렌드'].map(t => (
              <span key={t} style={{ fontSize: 13, color: C.textSub, fontWeight: 500, cursor: 'pointer' }}>{t}</span>
            ))}
          </div>
          <span style={{ fontSize: 12, color: C.textSub }}>{data.date}</span>
        </div>
      </nav>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 48px 80px', animation: 'gcFadeIn 0.4s ease' }}>

        {/* Title + editor comment */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.primary, background: '#f0faf4', borderRadius: 5, padding: '4px 12px' }}>3040 직장인</span>
            <span style={{ fontSize: 11, color: C.textSub, background: '#f3f4f6', borderRadius: 5, padding: '4px 12px' }}>{data.week}</span>
            <span style={{ fontSize: 11, color: C.textSub, background: '#f3f4f6', borderRadius: 5, padding: '4px 12px' }}>{data.vol}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 900, color: C.deepBlue, margin: '0 0 8px', lineHeight: 1.1, letterSpacing: '-1px' }}>
            건강 <span style={{ color: C.primary }}>영수증</span>
          </h1>
          <p style={{ fontSize: 16, color: C.textSub, margin: '0 0 24px' }}>이번 주 당신의 몸은 적자입니까?</p>
          <div style={{ background: C.white, borderLeft: `4px solid ${C.primary}`, borderRadius: '0 14px 14px 0', padding: '18px 22px', maxWidth: 680, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 10, color: C.brightGreen, letterSpacing: 3, marginBottom: 10, fontWeight: 700 }}>EDITOR</div>
            <p style={{ fontSize: 15, color: C.text, lineHeight: 1.95, margin: 0 }}>{AI_COMMENT}</p>
          </div>
        </div>

        {/* 3 stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
          {[
            { label: '이번 주 실검 1위',  value: data.keywords[0]?.kw || data.topKeyword, sub: '3040 직장인 검색', bg: C.primary,  dark: false },
            { label: '네이버 관심 1위',   value: data.naverCategories[0]?.label ?? '건강검진', sub: `${data.naverCategories[0]?.ratio ?? 0}% 관심도`, bg: C.deepBlue, dark: false },
            { label: '병원 키워드 빈도',  value: '+53%',                                  sub: '뉴스 급등',      bg: C.yellow,   dark: true  },
          ].map((card, i) => (
            <div key={i} style={{ background: card.bg, borderRadius: 16, padding: '28px 28px 22px' }}>
              <div style={{ fontSize: 11, color: card.dark ? C.deepBlue : 'rgba(255,255,255,0.6)', letterSpacing: 0.5, marginBottom: 12, fontWeight: 500 }}>{card.label}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: card.dark ? C.deepBlue : '#fff', lineHeight: 1.1, marginBottom: 8 }}>{card.value}</div>
              <div style={{ fontSize: 12, color: card.dark ? C.deepBlue : 'rgba(255,255,255,0.55)' }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* 2-col: TOP8 + right panel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 16 }}>

          {/* LEFT: TOP8 */}
          <div style={{ background: C.white, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <div style={{ padding: '24px 28px 16px', borderBottom: `2px solid ${C.primary}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 800 }}>이번 주 검색 TOP8</span>
              <span style={{ fontSize: 10, color: C.textSub, letterSpacing: 1 }}>실시간</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '38px 28px 1fr 80px 84px 28px', gap: 8, padding: '9px 28px', background: '#f9fafb', borderBottom: `1px solid ${C.border}` }}>
              {['', 'NO', '키워드', '트렌드', '청구액', ''].map((h, i) => (
                <span key={i} style={{ fontSize: 10, color: C.textSub, fontWeight: 700, textAlign: i >= 3 ? 'right' : 'left' }}>{h}</span>
              ))}
            </div>
            {data.keywords.map(item => {
              const tr    = TREND[item.trend] ?? TREND.same;
              const isExp = expanded === item.kw;
              return (
                <div key={item.kw} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <div
                    style={{ display: 'grid', gridTemplateColumns: '38px 28px 1fr 80px 84px 28px', gap: 8, alignItems: 'center', padding: '14px 28px', cursor: 'pointer', background: checked[item.kw] ? '#f0faf4' : 'transparent', transition: 'background 0.15s' }}
                    onClick={() => toggle(item.kw)}
                  >
                    <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${checked[item.kw] ? C.primary : C.border}`, background: checked[item.kw] ? C.primary : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                      {checked[item.kw] && <span style={{ color: '#fff', fontSize: 11, fontWeight: 900 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: item.rank <= 3 ? C.primary : '#d1d5db' }}>{String(item.rank).padStart(2, '0')}</span>
                    <span style={{ fontSize: 17, fontWeight: checked[item.kw] ? 700 : 400, color: checked[item.kw] ? C.text : '#374151' }}>{item.kw}</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: tr.color, background: tr.bg, borderRadius: 4, padding: '3px 8px' }}>{tr.label}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.deepBlue, textAlign: 'right' }}>{fmt(-(11 - item.rank) * 1000)}</span>
                    <button
                      onClick={e => { e.stopPropagation(); setExpanded(isExp ? null : item.kw); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: C.textSub, padding: 0, transform: isExp ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                    >⌄</button>
                  </div>
                  {isExp && (
                    <div style={{ padding: '10px 28px 14px 98px', display: 'flex', flexWrap: 'wrap', gap: 6, background: '#f9fafb' }}>
                      <span style={{ fontSize: 10, color: C.textSub, alignSelf: 'center', marginRight: 4 }}>같이 검색</span>
                      {item.related.length > 0
                        ? item.related.map(r => (
                            <span key={r} style={{ fontSize: 12, color: '#374151', background: C.white, border: `1px solid ${C.border}`, borderRadius: 20, padding: '4px 12px' }}>{r}</span>
                          ))
                        : <span style={{ fontSize: 12, color: '#9ca3af' }}>관련 검색어 없음</span>
                      }
                    </div>
                  )}
                </div>
              );
            })}
            {data.keywords.length === 0 && (
              <div style={{ padding: '48px 0', textAlign: 'center', fontSize: 14, color: '#9ca3af' }}>데이터 로딩 중...</div>
            )}
          </div>

          {/* RIGHT: naver bars + expert */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: C.white, borderRadius: 16, padding: '24px 28px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                <span style={{ fontSize: 16, fontWeight: 800 }}>건강 관심사</span>
                <span style={{ fontSize: 10, color: C.textSub, letterSpacing: 1 }}>네이버</span>
              </div>
              {data.naverCategories.map((c, i) => (
                <div key={c.label} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                    <span style={{ fontSize: 13, color: i === 0 ? C.text : C.textSub, fontWeight: i === 0 ? 700 : 400 }}>{c.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? C.primary : C.textSub }}>{c.ratio}%</span>
                  </div>
                  <div style={{ height: 7, background: '#f3f4f6', borderRadius: 4 }}>
                    <div style={{ height: '100%', width: `${Math.min(c.ratio, 100)}%`, background: i === 0 ? C.primary : `${C.mildGreen}88`, borderRadius: 4, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
              {data.naverCategories.length === 0 && (
                <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>데이터 로딩 중...</div>
              )}
            </div>

            <div style={{ background: C.deepBlue, borderRadius: 16, padding: '24px 28px', flex: 1, boxShadow: '0 1px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: 10, color: C.brightGreen, letterSpacing: 3, marginBottom: 14, fontWeight: 700 }}>GC 지씨케어 전문의</div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 1.95, margin: '0 0 20px' }}>{EXPERT_COMMENT}</p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.09)', paddingTop: 14 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', letterSpacing: 1 }}>항우울제·수면유도제 처방 전주 대비 <strong style={{ color: 'rgba(255,255,255,0.55)' }}>+18%</strong> 동반 상승</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div style={{ background: C.white, borderRadius: 16, padding: '28px', marginBottom: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>3040이 늘 겪는 것들</div>
          <p style={{ fontSize: 13, color: C.textSub, lineHeight: 1.6, margin: '0 0 18px' }}>
            이번 주 실검과 겹치는 항목은 <span style={{ color: C.primary, fontWeight: 700 }}>녹색</span>으로 표시됩니다.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TAGS_3040.map(tag => {
              const hi = isHighlight(tag);
              return (
                <span key={tag} style={{ fontSize: 13, fontWeight: hi ? 700 : 400, color: hi ? C.primary : C.textSub, background: hi ? '#f0faf4' : '#f9fafb', border: `1.5px solid ${hi ? C.primary : C.border}`, borderRadius: 24, padding: '7px 16px' }}>
                  {hi && '● '}{tag}
                </span>
              );
            })}
          </div>
        </div>

        {/* Receipt section */}
        <div style={{ background: C.white, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', borderBottom: `2px solid ${C.primary}` }}>
            <div style={{ padding: '22px 28px' }}>
              <div style={{ fontSize: 10, color: C.textSub, letterSpacing: 2, marginBottom: 6 }}>건강 영수증 · HEALTH RECEIPT</div>
              <div style={{ fontSize: 17, fontWeight: 800 }}>이번 주 나의 건강 청구서</div>
            </div>
            <div style={{ background: C.deepBlue, padding: '22px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>대한민국 직장인 평균</div>
              <div style={{ fontSize: 34, fontWeight: 900, color: C.yellow }}>-38,500원</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

            {/* LEFT: my receipt */}
            <div style={{ padding: '28px', borderRight: `1px solid ${C.border}` }}>
              <button
                onClick={() => setReceiptOpen(p => !p)}
                style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', paddingBottom: 14, borderBottom: `1px dashed ${C.border}`, marginBottom: 20 }}
              >
                <span style={{ fontSize: 11, color: C.textSub, letterSpacing: 1 }}>국민 평균 청구 내역 {receiptOpen ? '▲' : '▼'}</span>
              </button>

              {receiptOpen && (
                <div style={{ marginBottom: 20 }}>
                  {RECEIPT_ITEMS.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px dashed ${C.border}` }}>
                      <span style={{ fontSize: 13, color: C.textSub }}>{item.emoji} {item.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.red }}>{fmt(item.amount)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ fontSize: 10, color: C.textSub, letterSpacing: 2, marginBottom: 18 }}>나의 영수증 — 상단 키워드 체크 시 반영</div>

              {hasChecked ? (
                <>
                  {checkedKws.map(item => (
                    <div key={item.kw} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: `1px dashed ${C.border}` }}>
                      <span style={{ fontSize: 14, color: C.text }}>{item.kw}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.red }}>{fmt(-(11 - item.rank) * 1000)}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, paddingTop: 22, borderTop: `2px solid ${C.primary}` }}>
                    <span style={{ fontSize: 12, color: C.textSub }}>나의 총액</span>
                    <span style={{ fontSize: 48, fontWeight: 900, color: C.deepBlue, letterSpacing: '-1px' }}>{fmt(myTotal)}</span>
                  </div>
                </>
              ) : (
                <div style={{ padding: '36px 0', textAlign: 'center', fontSize: 14, color: '#d1d5db', lineHeight: 1.8 }}>
                  상단 키워드를 체크하면<br />나의 영수증이 완성됩니다
                </div>
              )}
            </div>

            {/* RIGHT: TOP4 alert */}
            <div style={{ padding: '28px' }}>
              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 20 }}>이번 주 TOP4 건강 경보</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(top4.length > 0 ? top4 : [
                  { rank: 1, kw: '기침 가슴통증',  trend: 'up',   related: [] },
                  { rank: 2, kw: '우울증과불면증', trend: 'same', related: [] },
                  { rank: 3, kw: '당뇨 식단',      trend: 'new',  related: [] },
                  { rank: 4, kw: '수면무호흡증',   trend: 'new',  related: [] },
                ]).map((item, i) => {
                  const rankColors = [C.red, C.mildBlue, C.primary, C.mildGreen];
                  const notes = [
                    '3월 환절기 호흡기 집중 주의',
                    '병행 검색 → 동반 발현 신호',
                    '식이 관리 관심 급등',
                    '중년 남성 집중 발생',
                  ];
                  return (
                    <div key={item.rank} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '16px', background: '#f9fafb', borderRadius: 12, border: `1px solid ${C.border}` }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: rankColors[i] ?? C.primary, color: '#fff', fontSize: 14, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.rank}</div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>{item.kw}</div>
                        <div style={{ fontSize: 12, color: C.textSub, lineHeight: 1.5 }}>{notes[i]}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: C.deepBlue, borderRadius: 14, padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>GC HEALTH WEEKLY · {data.week}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>DATA: v1 · v3 · Claude AI</span>
        </div>
      </main>
    </div>
  );
}
