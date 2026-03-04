'use client';
import { useState, useEffect } from 'react';
import type { PageData } from '../lib/fetchHealthData';

const FONT_LINK = 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=Space+Mono:wght@400;700&display=swap';
const SANS = "'Noto Sans KR', sans-serif";
const MONO = "'Space Mono', monospace";

const C = {
  bg: '#ffffff', surface: '#f7f8f7', primary: '#007A33',
  accent: '#002B49', accentDark: '#002B49', positive: '#2d6a4f',
  muted: '#8a9e8d', border: '#d8e4da', text: '#111a13', textSub: '#4a5e4e',
};

const STATIC = {
  aiComment: "이번 주 검색 1위는 공황장애입니다. 3월 인사이동 시즌이 시작됐고, 2위엔 우울증과 불면증이 함께 올라왔습니다. 따로 검색하지 않고 붙여서 검색한다는 건 이미 둘이 동시에 오고 있다는 뜻입니다. 반면 '건강' 키워드는 지난주보다 20% 줄었습니다. 아플 때만 검색한다는 얘기예요.",
  receiptItems: [
    { emoji: '😰', label: '공황·불안 급등 청구',   amount: -12000 },
    { emoji: '😴', label: '수면 부채 누적 이자',    amount: -9500  },
    { emoji: '🫀', label: '혈압·당뇨 방치 연체료',  amount: -9000  },
    { emoji: '🌡️', label: '환절기 면역 하락',       amount: -8000  },
  ],
};

const fmt = (n: number) => `${n >= 0 ? '+' : '-'}${Math.abs(n).toLocaleString()}원`;

const TREND: Record<string, { label: string; color: string; bg: string }> = {
  up:   { label: '▲ 급등', color: C.accentDark, bg: '#e6eef4' },
  new:  { label: 'NEW',    color: C.positive,    bg: '#e6f4ed' },
  down: { label: '▼',      color: '#5f5fcf',     bg: '#eeeeff' },
  same: { label: '—',      color: C.muted,       bg: C.surface },
};

function SectionTitle({ label, source }: { label: string; source?: string }) {
  return (
    <div style={{ borderBottom: `2px solid ${C.primary}`, paddingBottom: 10, marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: C.text }}>{label}</span>
      {source && <span style={{ fontFamily: MONO, fontSize: 9, color: C.muted, letterSpacing: 1 }}>{source}</span>}
    </div>
  );
}

export default function HealthReceipt({ data }: { data: PageData }) {
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [aiComment, setAiComment] = useState(STATIC.aiComment);
  const [commentLoading, setCommentLoading] = useState(true);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONT_LINK;
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  useEffect(() => {
    const kws = data.keywords.map(k => k.kw);
    if (!kws.length) { setCommentLoading(false); return; }
    fetch('/api/generate-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords: kws, target: '3040' }),
    })
      .then(r => r.json())
      .then(d => { if (d.comment) setAiComment(d.comment); })
      .catch(() => {})
      .finally(() => setCommentLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (kw: string) => setChecked(p => ({ ...p, [kw]: !p[kw] }));
  const hasChecked = Object.values(checked).some(Boolean);
  const myTotal = data.keywords.filter(k => checked[k.kw]).reduce((s, k) => s - (10 - k.rank + 1) * 1000, 0);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: SANS, color: C.text }}>
      <header style={{ background: C.primary }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 28px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: 2 }}>{data.date}</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['주간리포트', '3040직장인', '건강트렌드'].map(t => (
              <span key={t} style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 1 }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '32px 28px 26px' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 5, marginBottom: 12 }}>GC HEALTH WEEKLY</div>
          <h1 style={{ fontFamily: SANS, fontWeight: 900, fontSize: 'clamp(40px, 6vw, 66px)', color: '#fff', margin: '0 0 12px', letterSpacing: '-1px', lineHeight: 1 }}>건강 영수증</h1>
          <div style={{ width: 40, height: 2, background: C.accent, margin: '0 auto 12px' }} />
          <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.55)' }}>
            이번 주 당신의 몸은 적자입니까? · {data.week} · {data.vol}
          </div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.18)', padding: '16px 28px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: '#fff', background: C.accent, borderRadius: 3, padding: '3px 7px', flexShrink: 0, marginTop: 2, letterSpacing: 1 }}>EDITOR</span>
          <p style={{ fontFamily: SANS, fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.85, margin: 0, opacity: commentLoading ? 0.5 : 1, transition: 'opacity 0.4s' }}>
            {aiComment}
            {commentLoading && <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.4)', marginLeft: 8 }}>AI 생성 중...</span>}
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 780, margin: '0 auto', padding: '24px 20px 80px' }}>
        {/* 핵심 숫자 4개 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, marginBottom: 24 }}>
          {[
            { num: '#1',    label: data.topKeyword || '공황장애', sub: '이번 주 실검 1위', hi: true  },
            { num: '+53%',  label: '병원 키워드',                 sub: '뉴스 빈도 급등',   hi: false },
            { num: '5.8h',  label: '3040 평균수면',               sub: '권장치 -1.2h',     hi: false },
            { num: `${data.naverCategories[0]?.ratio ?? 42.8}%`, label: data.naverCategories[0]?.label ?? '영양제 관심도', sub: '네이버 1위', hi: false },
          ].map((s, i) => (
            <div key={i} style={{ background: s.hi ? C.accent : C.surface, padding: '18px 16px', borderBottom: `3px solid ${s.hi ? '#001a2e' : C.border}` }}>
              <div style={{ fontFamily: MONO, fontSize: 24, fontWeight: 700, color: s.hi ? '#fff' : C.primary, marginBottom: 5, lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: s.hi ? 'rgba(255,255,255,0.9)' : C.text, marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: s.hi ? 'rgba(255,255,255,0.55)' : C.muted }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* 전문가 코멘트 */}
        <div style={{ background: '#f0f7f3', borderLeft: '4px solid #007A33', padding: '16px 20px', marginBottom: 24 }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: '#007A33', letterSpacing: 2, marginBottom: 8 }}>
            GC 지씨케어 전문 의료진 코멘트
          </div>
          <p style={{ fontFamily: SANS, fontSize: 14, color: '#111a13', lineHeight: 1.85, margin: 0 }}>
            수면 시간 1.2시간 감소와 공황장애 검색량 급등은 밀접한 상관관계가 있습니다. 신학기·분기 초 업무 부담이 겹치는 3월 초, 직장인들의 심리적 소진(Burn-out)이 데이터로 증명된 셈입니다.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 2, marginBottom: 2 }}>
          {/* 좌: 검색 TOP8 */}
          <div style={{ background: C.surface, padding: '24px' }}>
            <SectionTitle label="이번 주 검색 TOP8" source="v3 실시간" />
            {data.keywords.map((item) => {
              const tr = TREND[item.trend];
              const isExp = expanded === item.kw;
              return (
                <div key={item.kw} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0', cursor: 'pointer' }} onClick={() => toggle(item.kw)}>
                    <div style={{ width: 20, height: 20, borderRadius: 4, flexShrink: 0, background: checked[item.kw] ? C.primary : 'transparent', border: `2px solid ${checked[item.kw] ? C.primary : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                      {checked[item.kw] && <span style={{ color: '#fff', fontSize: 11, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                    </div>
                    <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: item.rank <= 3 ? C.accentDark : C.border, width: 22, flexShrink: 0 }}>{String(item.rank).padStart(2, '0')}</span>
                    <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: checked[item.kw] ? 700 : 400, color: checked[item.kw] ? C.text : C.textSub, flex: 1 }}>{item.kw}</span>
                    <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: tr.color, background: tr.bg, borderRadius: 3, padding: '2px 6px', flexShrink: 0 }}>{tr.label}</span>
                    <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: checked[item.kw] ? C.accentDark : C.border, width: 68, textAlign: 'right', flexShrink: 0 }}>{fmt(-(10 - item.rank + 1) * 1000)}</span>
                    <button onClick={(e) => { e.stopPropagation(); setExpanded(isExp ? null : item.kw); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.border, fontSize: 12, padding: 0, flexShrink: 0, transform: isExp ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}>⌄</button>
                  </div>
                  {isExp && item.related.length > 0 && (
                    <div style={{ padding: '8px 0 12px 52px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: MONO, fontSize: 9, color: C.muted, marginRight: 4, alignSelf: 'center' }}>같이 검색</span>
                      {item.related.map(r => (
                        <span key={r} style={{ fontFamily: SANS, fontSize: 11, color: C.textSub, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: '3px 8px' }}>{r}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 우: 네이버 관심사 + 이번 주 딱 하나 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ background: C.surface, padding: '24px', flex: '0 0 auto' }}>
              <SectionTitle label="건강 관심사" source="v1 네이버" />
              {data.naverCategories.map((c, i) => (
                <div key={c.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontFamily: SANS, fontSize: 12, color: C.textSub }}>{c.label}</span>
                    <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: i === 0 ? C.positive : C.muted }}>{c.ratio}%</span>
                  </div>
                  <div style={{ height: 5, background: C.border, borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${c.ratio}%`, background: i === 0 ? C.positive : C.muted + '55', borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: C.primary, padding: '22px 20px', flex: 1 }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 14 }}>이번 주 딱 하나</div>
              <p style={{ fontFamily: SANS, fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1.35, margin: '0 0 12px' }}>오늘 점심,<br />밖에서 먹기</p>
              <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, margin: 0 }}>식후 10분 걷기 = 코르티솔 23% 감소.<br />밥 먹으면서 화면 보지 않는 것만으로도 뇌가 쉽니다.</p>
              <div style={{ marginTop: 14, background: 'rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 14px' }}>
                <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, marginBottom: 4 }}>UBIST 실시간 처방 데이터</div>
                <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.7 }}>
                  항우울제·수면유도제 처방 전주 대비 <strong style={{ color: '#fff' }}>+18% 동반 상승</strong> 중
                </p>
              </div>
              <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12, fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.22)', letterSpacing: 1 }}>다음 주 데이터로 업데이트됩니다</div>
            </div>
          </div>
        </div>

        {/* 건강 영수증 */}
        <div style={{ background: C.surface, marginTop: 2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', borderBottom: `2px solid ${C.primary}` }}>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 6 }}>건강 영수증 · HEALTH RECEIPT</div>
              <div style={{ fontFamily: SANS, fontSize: 17, fontWeight: 700, color: C.text }}>이번 주 나의 건강 청구서</div>
            </div>
            <div style={{ background: C.accent, padding: '20px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'right' }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>대한민국 직장인 평균</div>
              <div style={{ fontFamily: MONO, fontSize: 26, fontWeight: 700, color: '#fff' }}>-38,500원</div>
            </div>
          </div>
          <div style={{ padding: '24px' }}>
            <button onClick={() => setReceiptOpen(!receiptOpen)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 12px', display: 'flex', justifyContent: 'space-between', borderBottom: `1px dashed ${C.border}`, marginBottom: 16 }}>
              <span style={{ fontFamily: MONO, fontSize: 10, color: C.muted, letterSpacing: 1 }}>국민 평균 청구 내역 {receiptOpen ? '▲ 접기' : '▼ 펼치기'}</span>
            </button>
            {receiptOpen && (
              <div style={{ marginBottom: 16 }}>
                {STATIC.receiptItems.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px dashed ${C.border}` }}>
                    <span style={{ fontFamily: SANS, fontSize: 13, color: C.textSub }}>{item.emoji} {item.label}</span>
                    <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: C.accentDark }}>{fmt(item.amount)}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ fontFamily: MONO, fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 14 }}>나의 영수증 — 상단 키워드 체크 시 반영</div>
            {hasChecked ? (
              <>
                {data.keywords.filter(k => checked[k.kw]).map(item => (
                  <div key={item.kw} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px dashed ${C.border}` }}>
                    <span style={{ fontFamily: SANS, fontSize: 13, color: C.text }}>{item.kw}</span>
                    <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: C.accentDark }}>{fmt(-(10 - item.rank + 1) * 1000)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: `2px solid ${C.primary}` }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted }}>나의 총액</span>
                  <span style={{ fontFamily: MONO, fontSize: 32, fontWeight: 700, color: C.accentDark }}>{fmt(myTotal)}</span>
                </div>
              </>
            ) : (
              <div style={{ padding: '28px 0', textAlign: 'center', fontFamily: SANS, fontSize: 13, color: C.border, lineHeight: 1.7 }}>
                상단 키워드를 체크하면<br />나의 영수증이 완성됩니다
              </div>
            )}
          </div>
        </div>

        <div style={{ background: C.primary, padding: '14px 24px', display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
          <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>GC HEALTH WEEKLY · {data.week}</span>
          <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>DATA: v1 · v3 · Claude AI</span>
        </div>
      </main>
    </div>
  );
}
