'use client';
import { useState, useEffect } from 'react';

const FONT_LINK = 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=Space+Mono:wght@400;700&display=swap';
const SANS = "'Noto Sans KR', sans-serif";
const MONO = "'Space Mono', monospace";

const C = {
  bg: '#ffffff', surface: '#f7f8f7', primary: '#007A33',
  accent: '#002B49', red: '#E4002B', positive: '#2d6a4f',
  muted: '#8a9e8d', border: '#d8e4da', text: '#111a13', textSub: '#4a5e4e',
};

const KEYWORDS = [
  { rank: 1, kw: '기침·가슴통증', trend: 'up',   related: ['폐렴 초기증상', '기침 오래가는 이유'] },
  { rank: 2, kw: '공황장애',      trend: 'up',   related: ['공황장애 치료', '공황발작'] },
  { rank: 3, kw: '유산균',        trend: 'same', related: ['유산균 효능', '장 건강'] },
  { rank: 4, kw: '혈압',          trend: 'up',   related: ['혈압 정상범위', '고혈압 증상'] },
  { rank: 5, kw: '두통',          trend: 'down', related: ['두통 원인', '편두통'] },
  { rank: 6, kw: '우울증',        trend: 'new',  related: ['우울증 치료', '우울증 증상'] },
  { rank: 7, kw: '당뇨',          trend: 'up',   related: ['당뇨 초기증상', '혈당'] },
  { rank: 8, kw: '다이어트',      trend: 'down', related: ['간헐적 단식'] },
];

const NAVER_CATEGORIES = [
  { label: '영양·건강기능식품', ratio: 42.8 },
  { label: '운동·헬스',         ratio: 20.6 },
  { label: '건강검진',          ratio: 15.9 },
  { label: '다이어트',          ratio: 11.0 },
  { label: '정신건강',          ratio: 9.7  },
];

const TAGS_3040 = [
  '번아웃', '수면부족', '거북목', '만성피로',
  '소화불량', '탈모', '공황·불안', '허리통증',
  '눈 피로', '과음 후유증',
];

const AI_COMMENT = '환절기인데 기침·가슴통증보다 공황장애 검색이 더 빠르게 올라오고 있습니다. 3월 인사이동 시즌, 몸보다 마음이 먼저 신호를 보내고 있는 거예요.';
const EXPERT_COMMENT = '공황장애와 우울증이 동시에 상위권에 진입한 것은 계절적 요인과 직장 스트레스가 복합적으로 작용한 결과입니다. 심리적 소진(Burn-out)이 신체 증상보다 먼저 나타나는 3040의 특성이 이번 주 데이터에서도 확인됩니다.';

const TREND_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  up:   { label: '▲ 급등', color: '#E4002B', bg: '#fce8eb' },
  new:  { label: 'NEW',    color: '#2d6a4f', bg: '#e6f4ed' },
  down: { label: '▼',      color: '#5f5fcf', bg: '#eeeeff' },
  same: { label: '—',      color: '#8a9e8d', bg: '#f7f8f7' },
};

const fmt = (n: number) => `${n >= 0 ? '+' : '-'}${Math.abs(n).toLocaleString()}원`;

function SectionLabel({ text, source }: { text: string; source?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #007A33', paddingBottom: 10, marginBottom: 18 }}>
      <span style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 15, fontWeight: 800, color: '#111a13' }}>{text}</span>
      {source && <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#8a9e8d', letterSpacing: 1 }}>{source}</span>}
    </div>
  );
}

export default function Page() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  useEffect(() => {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = FONT_LINK;
    document.head.appendChild(l);
    return () => { document.head.removeChild(l); };
  }, []);

  const toggle = (kw: string) => setChecked(p => ({ ...p, [kw]: !p[kw] }));
  const hasChecked = Object.values(checked).some(Boolean);
  const myTotal = KEYWORDS.filter(k => checked[k.kw]).reduce((s, k) => s - (10 - k.rank + 1) * 1000, 0);
  const kwSet = new Set(KEYWORDS.map(k => k.kw.replace(/·.*/, '')));
  const isHighlight = (tag: string) => [...kwSet].some(k => tag.includes(k) || k.includes(tag.replace(/·.*/, '')));

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: "'Noto Sans KR', sans-serif", color: '#111a13' }}>
      <header style={{ background: '#007A33' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 28px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: 2 }}>2026.03.03</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['주간리포트', '3040직장인', '건강트렌드'].map(t => (
              <span key={t} style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '32px 28px 24px' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 5, marginBottom: 12 }}>GC HEALTH WEEKLY</div>
          <h1 style={{ fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 900, fontSize: 'clamp(38px, 6vw, 62px)', color: '#fff', margin: '0 0 10px', letterSpacing: '-1px', lineHeight: 1 }}>
            이번 주 3040 건강 신호
          </h1>
          <div style={{ width: 36, height: 2, background: 'rgba(255,255,255,0.4)', margin: '0 auto 12px' }} />
          <div style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
            데이터로 읽는 3040의 한 주 · 2026년 3월 1주차 · VOL.10
          </div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.18)', padding: '16px 28px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, fontWeight: 700, color: '#fff', background: '#002B49', borderRadius: 3, padding: '3px 7px', flexShrink: 0, marginTop: 2 }}>EDITOR</span>
          <p style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.85, margin: 0 }}>{AI_COMMENT}</p>
        </div>
      </header>

      <main style={{ maxWidth: 780, margin: '0 auto', padding: '24px 20px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 2, marginBottom: 2 }}>
          <div style={{ background: '#f7f8f7', padding: '24px' }}>
            <SectionLabel text="이번 주 건강 검색 TOP8" source="v3 실시간" />
            {KEYWORDS.map((item) => {
              const tr = TREND_CONFIG[item.trend];
              const isExp = expanded === item.kw;
              return (
                <div key={item.kw} style={{ borderBottom: '1px solid #d8e4da' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0', cursor: 'pointer' }} onClick={() => toggle(item.kw)}>
                    <div style={{ width: 20, height: 20, borderRadius: 4, flexShrink: 0, background: checked[item.kw] ? '#007A33' : 'transparent', border: `2px solid ${checked[item.kw] ? '#007A33' : '#d8e4da'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                      {checked[item.kw] && <span style={{ color: '#fff', fontSize: 11, fontWeight: 900 }}>✓</span>}
                    </div>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, color: item.rank <= 3 ? '#E4002B' : '#d8e4da', width: 22, flexShrink: 0 }}>{String(item.rank).padStart(2, '0')}</span>
                    <span style={{ fontSize: 14, fontWeight: checked[item.kw] ? 700 : 400, color: checked[item.kw] ? '#111a13' : '#4a5e4e', flex: 1 }}>{item.kw}</span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, fontWeight: 700, color: tr.color, background: tr.bg, borderRadius: 3, padding: '2px 6px', flexShrink: 0 }}>{tr.label}</span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: checked[item.kw] ? '#002B49' : '#d8e4da', width: 68, textAlign: 'right', flexShrink: 0 }}>{fmt(-(10 - item.rank + 1) * 1000)}</span>
                    <button onClick={(e) => { e.stopPropagation(); setExpanded(isExp ? null : item.kw); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d8e4da', fontSize: 12, padding: 0, flexShrink: 0, transform: isExp ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}>⌄</button>
                  </div>
                  {isExp && (
                    <div style={{ padding: '6px 0 12px 52px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#8a9e8d', alignSelf: 'center', marginRight: 2 }}>같이 검색</span>
                      {item.related.map(r => (
                        <span key={r} style={{ fontSize: 11, color: '#4a5e4e', background: '#ffffff', border: '1px solid #d8e4da', borderRadius: 4, padding: '3px 8px' }}>{r}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ background: '#f7f8f7', padding: '24px', flex: '0 0 auto' }}>
              <SectionLabel text="건강 관심사" source="v1 네이버" />
              {NAVER_CATEGORIES.map((c, i) => (
                <div key={c.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: '#4a5e4e' }}>{c.label}</span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: i === 0 ? '#2d6a4f' : '#8a9e8d' }}>{c.ratio}%</span>
                  </div>
                  <div style={{ height: 5, background: '#d8e4da', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${c.ratio}%`, background: i === 0 ? '#2d6a4f' : '#8a9e8d55', borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: '#002B49', padding: '22px 20px', flex: 1 }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 12 }}>GC 지씨케어 전문의 코멘트</div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.85, margin: '0 0 16px' }}>{EXPERT_COMMENT}</p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12, fontFamily: "'Space Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: 1 }}>
                내부 데이터 연동 시 UBIST 처방 통계 추가 예정
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: '#f7f8f7', padding: '24px', marginBottom: 2 }}>
          <SectionLabel text="3040 직장인이 늘 겪는 것들" />
          <p style={{ fontSize: 13, color: '#4a5e4e', lineHeight: 1.7, margin: '0 0 16px' }}>
            이번 주 실검과 겹치는 항목은 <span style={{ color: '#007A33', fontWeight: 700 }}>초록색</span>으로 표시됩니다.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TAGS_3040.map(tag => {
              const hi = isHighlight(tag);
              return (
                <span key={tag} style={{ fontSize: 13, fontWeight: hi ? 700 : 400, color: hi ? '#007A33' : '#4a5e4e', background: hi ? '#e6f4ed' : '#ffffff', border: `1.5px solid ${hi ? '#007A33' : '#d8e4da'}`, borderRadius: 20, padding: '6px 14px' }}>
                  {hi && <span style={{ marginRight: 4 }}>●</span>}{tag}
                </span>
              );
            })}
          </div>
        </div>

        <div style={{ background: '#f7f8f7' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', borderBottom: '2px solid #007A33' }}>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#8a9e8d', letterSpacing: 2, marginBottom: 6 }}>건강 영수증 · HEALTH RECEIPT</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#111a13' }}>이번 주 나의 건강 영수증</div>
            </div>
            <div style={{ background: '#007A33', padding: '20px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'right' }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>이번 주 건강 적신호</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{KEYWORDS.slice(0, 3).map(k => k.kw).join(' · ')}</div>
            </div>
          </div>
          <div style={{ padding: '24px' }}>
            <button onClick={() => setReceiptOpen(!receiptOpen)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #d8e4da', marginBottom: 16 }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#8a9e8d', letterSpacing: 1 }}>
                이번 주 건강 경보 TOP4 {receiptOpen ? '▲ 접기' : '▼ 펼치기'}
              </span>
            </button>
            {receiptOpen && (
              <div style={{ marginBottom: 16 }}>
                {KEYWORDS.slice(0, 4).map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px dashed #d8e4da' }}>
                    <span style={{ fontSize: 13, color: '#4a5e4e' }}>{['🔴', '🟠', '🟡', '🟢'][i]} {item.kw}</span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#8a9e8d' }}>{TREND_CONFIG[item.trend].label}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#8a9e8d', letterSpacing: 2, marginBottom: 14 }}>나의 영수증 — 상단 키워드 체크 시 반영</div>
            {hasChecked ? (
              <>
                {KEYWORDS.filter(k => checked[k.kw]).map(item => (
                  <div key={item.kw} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px dashed #d8e4da' }}>
                    <span style={{ fontSize: 13, color: '#111a13' }}>{item.kw}</span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, color: '#002B49' }}>{fmt(-(10 - item.rank + 1) * 1000)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '2px solid #007A33' }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#8a9e8d' }}>나의 총액</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 32, fontWeight: 700, color: '#002B49' }}>{fmt(myTotal)}</span>
                </div>
              </>
            ) : (
              <div style={{ padding: '28px 0', textAlign: 'center', fontSize: 13, color: '#d8e4da', lineHeight: 1.7 }}>
                상단 키워드를 체크하면<br />나의 영수증이 완성됩니다
              </div>
            )}
          </div>
        </div>

        <div style={{ background: '#007A33', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>이번 주 3040 건강 신호 · 2026년 3월 1주차</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>DATA: v1 · v3 · Claude AI</span>
        </div>
      </main>
    </div>
  );
}
