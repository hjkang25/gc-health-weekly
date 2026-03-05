'use client';
import { useState, useEffect, useMemo } from 'react';
import type { PageData } from '../lib/fetchHealthData';

const SANS = "'Noto Sans KR', sans-serif";

const C = {
  primary:   '#B8860B',
  secondary: '#DAA520',
  bright:    '#FFD700',
  deepBlue:  '#002B49',
  red:       '#E4002B',
  mildG:     '#43B02A',
  bg:        '#faf8f3',
  border:    '#e8e0d0',
  lightBg:   '#f5f0e8',
  white:     '#ffffff',
  text:      '#111827',
  textSub:   '#6b7280',
};

const TAGS_5060 = [
  '근감소증', '혈압 상승', '혈당 스파이크',
  '골밀도 저하', '인지 저하', '내장 지방',
  '수면 장애', '관절 통증', '만성 피로',
];

const EXPERT_COMMENT =
  '근감소와 혈당 불안정은 서로를 악화시키는 악순환 구조입니다. 5060대에서 이 두 지표가 동반 악화되면 심혈관 위험과 인지 저하가 급속도로 진행됩니다. 지금 바로 개입이 필요합니다.';

const TREND: Record<string, { label: string; color: string; bg: string }> = {
  up:   { label: '▲ 급등', color: C.red,    bg: '#fce8eb' },
  new:  { label: 'NEW',    color: C.mildG,   bg: '#edfce8' },
  down: { label: '▼',      color: '#0072CE', bg: '#e8f1fc' },
  same: { label: '—',      color: '#9ca3af', bg: '#f3f4f6' },
};

interface AssetConfig {
  id: string;
  name: string;
  sub: string;
  icon: string;
  type: 'safe' | 'risk';
  unit: string;
  placeholder: string;
  kwTerms: string[];
  top3Score: number;
  top8Score: number;
  notFoundScore: number;
  valueToScore: (val: number) => number;
}

const ASSET_CONFIGS: AssetConfig[] = [
  {
    id: 'muscle', name: '근육량', sub: '근력 유지의 기초', icon: '💪', type: 'safe',
    unit: 'kg', placeholder: '예: 22.5 (kg)',
    kwTerms: ['근감소증'],
    top3Score: 38, top8Score: 45, notFoundScore: 55,
    valueToScore: v => v >= 25 ? 80 : v >= 20 ? 65 : v >= 15 ? 50 : 35,
  },
  {
    id: 'bone', name: '골밀도', sub: '골절 예방 핵심', icon: '🦴', type: 'safe',
    unit: '', placeholder: '예: -0.8 (T-score)',
    kwTerms: ['골다공증'],
    top3Score: 42, top8Score: 52, notFoundScore: 60,
    valueToScore: v => v >= 0 ? 80 : v >= -1 ? 65 : v >= -2 ? 50 : 35,
  },
  {
    id: 'cog', name: '인지기능', sub: '뇌 건강 자산', icon: '🧠', type: 'safe',
    unit: '점', placeholder: '예: 70 (자가평가 1-100)',
    kwTerms: ['치매'],
    top3Score: 55, top8Score: 65, notFoundScore: 70,
    valueToScore: v => v >= 80 ? 85 : v >= 60 ? 70 : v >= 40 ? 55 : 35,
  },
  {
    id: 'bp', name: '혈압', sub: '심혈관 위험', icon: '💗', type: 'risk',
    unit: 'mmHg', placeholder: '예: 130 (수축기)',
    kwTerms: ['혈압'],
    top3Score: 75, top8Score: 65, notFoundScore: 50,
    valueToScore: v => v >= 160 ? 85 : v >= 140 ? 72 : v >= 130 ? 58 : v >= 120 ? 42 : 28,
  },
  {
    id: 'bs', name: '혈당', sub: '당뇨·대사 위험', icon: '🩸', type: 'risk',
    unit: 'mg/dL', placeholder: '예: 110 (공복혈당)',
    kwTerms: ['당뇨', '혈당'],
    top3Score: 78, top8Score: 68, notFoundScore: 55,
    valueToScore: v => v >= 200 ? 85 : v >= 126 ? 72 : v >= 100 ? 55 : 32,
  },
  {
    id: 'vf', name: '내장지방', sub: '복합 만성질환 트리거', icon: '⚠️', type: 'risk',
    unit: '레벨', placeholder: '예: 10 (레벨 1-20)',
    kwTerms: ['비만', '지방'],
    top3Score: 65, top8Score: 65, notFoundScore: 55,
    valueToScore: v => v >= 15 ? 85 : v >= 10 ? 70 : v >= 7 ? 55 : 35,
  },
];

interface RebalanceAction {
  id: string;
  label: string;
  bonus: number;
  gcProduct?: string;
}
interface RebalanceItem {
  id: string;
  icon: string;
  name: string;
  assetId: string;
  comment: string;
  actions: RebalanceAction[];
}

const REBALANCE_ITEMS: RebalanceItem[] = [
  {
    id: 'muscle', icon: '💪', name: '근육량 리밸런싱', assetId: 'muscle',
    comment: '근감소증은 5060대 건강 손실의 가장 큰 원인입니다. 저항운동과 단백질 섭취가 핵심입니다.',
    actions: [
      { id: 'mu_1', label: '주 3회 저항운동 20분',      bonus: 10 },
      { id: 'mu_2', label: '매끼 단백질 30g 이상 섭취', bonus: 8 },
      { id: 'mu_3', label: '류신 단백질 보충제 활용',   bonus: 6, gcProduct: 'GC웰피스 류신 단백질' },
    ],
  },
  {
    id: 'blood', icon: '🩸', name: '혈당 리밸런싱', assetId: 'bs',
    comment: '식후 혈당 스파이크가 인지 저하와 심혈관 질환의 근본 원인입니다. 식후 걷기가 가장 강력한 처방입니다.',
    actions: [
      { id: 'bl_1', label: '식후 10분 걷기 습관화',   bonus: 10 },
      { id: 'bl_2', label: '정제탄수화물 줄이기',      bonus: 8 },
      { id: 'bl_3', label: '혈당 관리 기능성 섭취',    bonus: 6, gcProduct: 'GC녹십자 혈당케어 포뮬러' },
    ],
  },
  {
    id: 'cog', icon: '🧠', name: '인지기능 리밸런싱', assetId: 'cog',
    comment: '인지 저하 예방은 50대부터 시작해야 합니다. 두뇌 자극과 오메가3가 필수입니다.',
    actions: [
      { id: 'cg_1', label: '하루 30분 독서·학습',    bonus: 10 },
      { id: 'cg_2', label: '오메가3·비타민D 복용',   bonus: 8 },
      { id: 'cg_3', label: '브레인케어 영양제 활용', bonus: 6, gcProduct: 'GC녹십자 브레인케어 DHA' },
    ],
  },
];

function computeKwScore(asset: AssetConfig, keywords: { rank: number; kw: string }[]): number {
  for (const kw of keywords) {
    if (kw.rank > 8) continue;
    if (asset.kwTerms.some(term => kw.kw.includes(term))) {
      return kw.rank <= 3 ? asset.top3Score : asset.top8Score;
    }
  }
  return asset.notFoundScore;
}

function gradeFromScore(s: number) {
  if (s >= 80) return { grade: 'A', color: C.mildG,   bg: '#f0fdf4' };
  if (s >= 65) return { grade: 'B', color: '#0072CE', bg: '#eff6ff' };
  if (s >= 50) return { grade: 'C', color: C.primary, bg: '#fefce8' };
  return              { grade: 'D', color: C.red,     bg: '#fef2f2' };
}

export default function DashboardClient({ data }: { data: PageData }) {
  const [loaded,       setLoaded]       = useState(false);
  const [progress,     setProgress]     = useState(0);
  const [kwChecked,    setKwChecked]    = useState<Record<string, boolean>>({});
  const [expanded,     setExpanded]     = useState<string | null>(null);
  const [actions,      setActions]      = useState<Record<string, boolean>>({});
  const [userInputs,   setUserInputs]   = useState<Record<string, string>>({});
  const [editingAsset, setEditingAsset] = useState<string | null>(null);

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

  const toggleKw     = (kw: string) => setKwChecked(p => ({ ...p, [kw]: !p[kw] }));
  const toggleAction = (id: string) => setActions(p => ({ ...p, [id]: !p[id] }));

  // Keyword-based scores + user input override
  const assetScores = useMemo(() =>
    ASSET_CONFIGS.map(asset => {
      const kwScore  = computeKwScore(asset, data.keywords);
      const rawInput = userInputs[asset.id]?.trim() ?? '';
      const val      = parseFloat(rawInput);
      const hasUserInput = rawInput !== '' && !isNaN(val);
      const score    = hasUserInput ? asset.valueToScore(val) : kwScore;
      return { ...asset, kwScore, score, hasUserInput };
    }),
    [data.keywords, userInputs]
  );

  // Rebalance base derived from live asset scores
  const rebalanceScores = useMemo(() =>
    REBALANCE_ITEMS.map(item => {
      const asset = assetScores.find(a => a.id === item.assetId)!;
      const base  = asset.type === 'safe' ? asset.score : 100 - asset.score;
      const bonus = item.actions.filter(a => actions[a.id]).reduce((s, a) => s + a.bonus, 0);
      return { ...item, base, score: Math.min(100, base + bonus) };
    }),
    [assetScores, actions]
  );

  // Portfolio score: all 6 asset health scores averaged (rebalance items use boosted score)
  const portfolioScore = useMemo(() => {
    const healthScores = assetScores.map(asset => {
      const rebalItem = rebalanceScores.find(r => r.assetId === asset.id);
      if (rebalItem) return rebalItem.score;
      return asset.type === 'safe' ? asset.score : 100 - asset.score;
    });
    return Math.round(healthScores.reduce((s, h) => s + h, 0) / healthScores.length);
  }, [assetScores, rebalanceScores]);

  const kwSet       = new Set(data.keywords.map(k => k.kw));
  const isHighlight = (tag: string) =>
    [...kwSet].some(k => tag.includes(k.slice(0, 2)) || k.includes(tag.slice(0, 2)));

  const safeAssets = assetScores.filter(a => a.type === 'safe');
  const riskAssets = assetScores.filter(a => a.type === 'risk');

  const aiComment = `이번 주 5060 검색 1위는 ${data.keywords[0]?.kw ?? '—'}입니다. ${data.keywords[1]?.kw ?? '—'}과 함께 방어적 투자 패턴이 뚜렷하게 나타나고 있습니다. 지금이 리밸런싱의 골든타임입니다.`;

  /* ── Loading screen ── */
  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', background: C.deepBlue, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: SANS }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 5, marginBottom: 28 }}>GC HEALTH WEEKLY</div>
        <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 6 }}>건강 리밸런싱 포트폴리오</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 48 }}>5060 액티브 시니어 주간 건강 리포트</div>
        <div style={{ width: 240, height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${C.primary}, ${C.bright})`, borderRadius: 3, transition: 'width 0.08s linear' }} />
        </div>
        <div style={{ marginTop: 14, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>데이터 로딩 중...</div>
      </div>
    );
  }

  const { grade: pfGrade, color: pfColor } = gradeFromScore(portfolioScore);

  /* ── Main render ── */
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: SANS, color: C.text }}>
      <style>{`@keyframes gcFadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>

      {/* Nav */}
      <nav style={{ background: C.white, position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 8px rgba(0,0,0,0.08)', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: `linear-gradient(135deg, ${C.primary}, ${C.bright})`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: C.deepBlue, fontSize: 11, fontWeight: 900 }}>GC</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: C.deepBlue }}>Health Weekly</span>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            {['주간리포트', '3040', '20대'].map(t => (
              <span key={t} style={{ fontSize: 13, color: C.textSub, fontWeight: 500, cursor: 'pointer' }}>{t}</span>
            ))}
            <span style={{ fontSize: 13, color: C.primary, fontWeight: 800, cursor: 'pointer', borderBottom: `2px solid ${C.primary}`, paddingBottom: 2 }}>5060</span>
          </div>
          <span style={{ fontSize: 12, color: C.textSub }}>{data.date}</span>
        </div>
      </nav>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 48px 80px', animation: 'gcFadeIn 0.4s ease' }}>

        {/* Title + editor comment */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.primary, background: C.lightBg, borderRadius: 5, padding: '4px 12px', border: `1px solid ${C.border}` }}>5060 액티브 시니어</span>
            <span style={{ fontSize: 11, color: C.textSub, background: '#f3f4f6', borderRadius: 5, padding: '4px 12px' }}>{data.week}</span>
            <span style={{ fontSize: 11, color: C.textSub, background: '#f3f4f6', borderRadius: 5, padding: '4px 12px' }}>{data.vol}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 900, color: C.deepBlue, margin: '0 0 8px', lineHeight: 1.1, letterSpacing: '-1px' }}>
            건강 리밸런싱 <span style={{ color: C.primary }}>포트폴리오</span>
          </h1>
          <p style={{ fontSize: 16, color: C.textSub, margin: '0 0 24px' }}>5060 액티브 시니어를 위한 건강 자산 관리 리포트</p>
          <div style={{ background: C.white, borderLeft: `4px solid ${C.primary}`, borderRadius: '0 14px 14px 0', padding: '18px 22px', maxWidth: 680, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 10, color: C.primary, letterSpacing: 3, marginBottom: 10, fontWeight: 700 }}>EDITOR</div>
            <p style={{ fontSize: 15, color: C.text, lineHeight: 1.95, margin: 0 }}>{aiComment}</p>
          </div>
        </div>

        {/* 3 stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
          {[
            { label: '이번 주 실검 1위',     value: data.topKeyword || data.keywords[0]?.kw, sub: '5060 건강 검색 TOP', bg: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, dark: false },
            { label: '네이버 건강 관심 1위', value: `${data.naverCategories[0]?.ratio ?? 0}%`, sub: data.naverCategories[0]?.label ?? '건강검진', bg: C.deepBlue, dark: false },
            { label: '5060 평균 수면',        value: '5.4h', sub: '권장치 -1.6h', bg: C.bright, dark: true },
          ].map((card, i) => (
            <div key={i} style={{ background: card.bg, borderRadius: 16, padding: '28px 28px 22px' }}>
              <div style={{ fontSize: 11, color: card.dark ? C.deepBlue : 'rgba(255,255,255,0.65)', letterSpacing: 0.5, marginBottom: 12, fontWeight: 500 }}>{card.label}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: card.dark ? C.deepBlue : '#fff', lineHeight: 1.1, marginBottom: 8 }}>{card.value}</div>
              <div style={{ fontSize: 12, color: card.dark ? '#6b5500' : 'rgba(255,255,255,0.55)' }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* 2-col: TOP8 + right panel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 16 }}>

          {/* LEFT: TOP8 */}
          <div style={{ background: C.white, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <div style={{ padding: '24px 28px 16px', borderBottom: `2px solid ${C.primary}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 800 }}>이번 주 건강 검색 TOP8</span>
              <span style={{ fontSize: 10, color: C.textSub, letterSpacing: 1 }}>실시간</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '38px 28px 1fr 80px 28px', gap: 8, padding: '9px 28px', background: C.lightBg, borderBottom: `1px solid ${C.border}` }}>
              {['', 'NO', '키워드', '트렌드', ''].map((h, i) => (
                <span key={i} style={{ fontSize: 10, color: C.textSub, fontWeight: 700, textAlign: i >= 3 ? 'right' : 'left' }}>{h}</span>
              ))}
            </div>
            {data.keywords.map(item => {
              const tr    = TREND[item.trend] ?? TREND.same;
              const isExp = expanded === item.kw;
              return (
                <div key={item.kw} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <div
                    style={{ display: 'grid', gridTemplateColumns: '38px 28px 1fr 80px 28px', gap: 8, alignItems: 'center', padding: '14px 28px', cursor: 'pointer', background: kwChecked[item.kw] ? C.lightBg : 'transparent', transition: 'background 0.15s' }}
                    onClick={() => toggleKw(item.kw)}
                  >
                    <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${kwChecked[item.kw] ? C.primary : C.border}`, background: kwChecked[item.kw] ? C.primary : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                      {kwChecked[item.kw] && <span style={{ color: '#fff', fontSize: 11, fontWeight: 900 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: item.rank <= 3 ? C.primary : '#d1d5db' }}>{String(item.rank).padStart(2, '0')}</span>
                    <span style={{ fontSize: 17, fontWeight: kwChecked[item.kw] ? 700 : 400, color: kwChecked[item.kw] ? C.text : '#374151' }}>{item.kw}</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: tr.color, background: tr.bg, borderRadius: 4, padding: '3px 8px' }}>{tr.label}</span>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setExpanded(isExp ? null : item.kw); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: C.textSub, padding: 0, transform: isExp ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                    >⌄</button>
                  </div>
                  {isExp && (
                    <div style={{ padding: '10px 28px 14px 98px', display: 'flex', flexWrap: 'wrap', gap: 6, background: C.lightBg }}>
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
                  <div style={{ height: 7, background: C.lightBg, borderRadius: 4 }}>
                    <div style={{ height: '100%', width: `${Math.min(c.ratio, 100)}%`, background: i === 0 ? `linear-gradient(90deg, ${C.primary}, ${C.secondary})` : `${C.secondary}88`, borderRadius: 4, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
              {data.naverCategories.length === 0 && (
                <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>데이터 로딩 중...</div>
              )}
            </div>

            <div style={{ background: C.deepBlue, borderRadius: 16, padding: '24px 28px', flex: 1, boxShadow: '0 1px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: 10, color: C.secondary, letterSpacing: 3, marginBottom: 14, fontWeight: 700 }}>GC 지씨케어 전문의</div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 1.95, margin: '0 0 20px' }}>{EXPERT_COMMENT}</p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.09)', paddingTop: 14 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', letterSpacing: 1 }}>내부 데이터 연동 시 UBIST 처방 통계 추가 예정</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div style={{ background: C.white, borderRadius: 16, padding: '28px', marginBottom: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>5060이 늘 겪는 것들</div>
          <p style={{ fontSize: 13, color: C.textSub, lineHeight: 1.6, margin: '0 0 18px' }}>
            이번 주 실검과 겹치는 항목은 <span style={{ color: C.primary, fontWeight: 700 }}>골드</span>로 표시됩니다.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TAGS_5060.map(tag => {
              const hi = isHighlight(tag);
              return (
                <span key={tag} style={{ fontSize: 13, fontWeight: hi ? 700 : 400, color: hi ? C.primary : C.textSub, background: hi ? C.lightBg : '#f9fafb', border: `1.5px solid ${hi ? C.primary : C.border}`, borderRadius: 24, padding: '7px 16px' }}>
                  {hi && '● '}{tag}
                </span>
              );
            })}
          </div>
        </div>

        {/* Portfolio section */}
        <div style={{ background: C.white, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>

          {/* Portfolio header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', borderBottom: `2px solid ${C.primary}` }}>
            <div style={{ padding: '22px 28px' }}>
              <div style={{ fontSize: 10, color: C.textSub, letterSpacing: 2, marginBottom: 6 }}>건강 리밸런싱 포트폴리오 · HEALTH REBALANCING PORTFOLIO</div>
              <div style={{ fontSize: 17, fontWeight: 800 }}>이번 주 나의 건강 자산 현황</div>
            </div>
            <div style={{ background: C.deepBlue, padding: '22px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>포트폴리오 건강 점수</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 40, fontWeight: 900, color: C.bright, letterSpacing: '-1px' }}>{portfolioScore}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: C.secondary }}>{pfGrade}</span>
              </div>
            </div>
          </div>

          <div style={{ padding: '28px' }}>

            {/* Safe / Risk 2-col */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

              {/* SAFE ASSETS */}
              <div style={{ background: '#f0fdf4', borderRadius: 14, padding: '20px', border: '1.5px solid #86efac' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: C.mildG, background: '#dcfce7', borderRadius: 6, padding: '4px 10px', letterSpacing: 1 }}>SAFE ASSETS</span>
                  <span style={{ fontSize: 11, color: C.textSub }}>건강 자산</span>
                </div>
                {safeAssets.map(asset => (
                  <div key={asset.id} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{asset.icon} {asset.name}</div>
                        <div style={{ fontSize: 11, color: C.textSub, marginTop: 2 }}>{asset.sub}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        {editingAsset === asset.id ? (
                          <input
                            autoFocus
                            type="text"
                            value={userInputs[asset.id] ?? ''}
                            placeholder={asset.placeholder}
                            onChange={e => setUserInputs(p => ({ ...p, [asset.id]: e.target.value }))}
                            onBlur={() => setEditingAsset(null)}
                            onKeyDown={e => { if (e.key === 'Enter') setEditingAsset(null); }}
                            style={{ width: 120, fontSize: 11, padding: '3px 8px', border: `1.5px solid ${C.mildG}`, borderRadius: 6, outline: 'none', fontFamily: SANS }}
                          />
                        ) : asset.hasUserInput ? (
                          <span
                            onClick={() => setEditingAsset(asset.id)}
                            title="클릭해서 수정"
                            style={{ fontSize: 10, fontWeight: 700, color: C.mildG, background: '#f0fdf4', border: `1px solid ${C.mildG}`, borderRadius: 6, padding: '3px 8px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                          >
                            실측값 {userInputs[asset.id]}{asset.unit}
                          </span>
                        ) : (
                          <span
                            onClick={() => setEditingAsset(asset.id)}
                            title="실측값 입력"
                            style={{ fontSize: 10, color: C.textSub, background: '#f3f4f6', border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 8px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                          >
                            추정값
                          </span>
                        )}
                        <span style={{ fontSize: 13, fontWeight: 800, color: C.mildG, minWidth: 24, textAlign: 'right' }}>{asset.score}</span>
                      </div>
                    </div>
                    <div style={{ height: 6, background: '#dcfce7', borderRadius: 3, marginTop: 8 }}>
                      <div style={{ height: '100%', width: `${asset.score}%`, background: C.mildG, borderRadius: 3, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* RISK ASSETS */}
              <div style={{ background: '#fef2f2', borderRadius: 14, padding: '20px', border: '1.5px solid #fca5a5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: C.red, background: '#fee2e2', borderRadius: 6, padding: '4px 10px', letterSpacing: 1 }}>RISK ASSETS</span>
                  <span style={{ fontSize: 11, color: C.textSub }}>리스크 자산</span>
                </div>
                {riskAssets.map(asset => (
                  <div key={asset.id} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{asset.icon} {asset.name}</div>
                        <div style={{ fontSize: 11, color: C.textSub, marginTop: 2 }}>{asset.sub}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        {editingAsset === asset.id ? (
                          <input
                            autoFocus
                            type="text"
                            value={userInputs[asset.id] ?? ''}
                            placeholder={asset.placeholder}
                            onChange={e => setUserInputs(p => ({ ...p, [asset.id]: e.target.value }))}
                            onBlur={() => setEditingAsset(null)}
                            onKeyDown={e => { if (e.key === 'Enter') setEditingAsset(null); }}
                            style={{ width: 120, fontSize: 11, padding: '3px 8px', border: `1.5px solid ${C.red}`, borderRadius: 6, outline: 'none', fontFamily: SANS }}
                          />
                        ) : asset.hasUserInput ? (
                          <span
                            onClick={() => setEditingAsset(asset.id)}
                            title="클릭해서 수정"
                            style={{ fontSize: 10, fontWeight: 700, color: C.red, background: '#fff0f0', border: `1px solid ${C.red}`, borderRadius: 6, padding: '3px 8px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                          >
                            실측값 {userInputs[asset.id]}{asset.unit}
                          </span>
                        ) : (
                          <span
                            onClick={() => setEditingAsset(asset.id)}
                            title="실측값 입력"
                            style={{ fontSize: 10, color: C.textSub, background: '#f3f4f6', border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 8px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                          >
                            추정값
                          </span>
                        )}
                        <span style={{ fontSize: 13, fontWeight: 800, color: C.red, minWidth: 24, textAlign: 'right' }}>{asset.score}</span>
                      </div>
                    </div>
                    <div style={{ height: 6, background: '#fee2e2', borderRadius: 3, marginTop: 8 }}>
                      <div style={{ height: '100%', width: `${asset.score}%`, background: C.red, borderRadius: 3, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio insight */}
            <div style={{ background: C.deepBlue, borderRadius: 14, padding: '20px 24px', marginBottom: 24 }}>
              <div style={{ fontSize: 10, color: C.secondary, letterSpacing: 3, marginBottom: 12, fontWeight: 700 }}>PORTFOLIO INSIGHT</div>
              <p style={{ fontSize: 14, color: C.bright, lineHeight: 1.9, margin: 0, fontWeight: 500 }}>
                이번 주 5060 데이터에서 <strong style={{ color: '#fff' }}>{data.keywords.slice(0, 2).map(k => k.kw).join('·')}</strong> 관련 검색이 동반 급등했습니다. 근감소와 혈당 불안정은 서로를 악화시킵니다. 지금 당장 <strong style={{ color: '#fff' }}>단백질 섭취</strong>와 <strong style={{ color: '#fff' }}>식후 걷기</strong> 두 가지만 실천하세요.
              </p>
            </div>

            {/* Rebalancing checklist */}
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>리밸런싱 실천 체크리스트</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rebalanceScores.map(item => {
                const { grade, color: gc, bg: gbg } = gradeFromScore(item.score);
                const isExp        = expanded === item.id;
                const checkedCount = item.actions.filter(a => actions[a.id]).length;
                return (
                  <div key={item.id} style={{ border: `1.5px solid ${isExp ? C.primary : C.border}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', cursor: 'pointer', background: isExp ? C.lightBg : C.white }}
                      onClick={() => setExpanded(isExp ? null : item.id)}
                    >
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{item.name}</span>
                          {checkedCount > 0 && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: C.primary, background: C.lightBg, borderRadius: 10, padding: '2px 8px', border: `1px solid ${C.border}` }}>+{checkedCount}개 실천</span>
                          )}
                        </div>
                        <div style={{ height: 7, background: C.lightBg, borderRadius: 4 }}>
                          <div style={{ height: '100%', width: `${item.score}%`, background: `linear-gradient(90deg, ${C.primary}, ${C.secondary})`, borderRadius: 4, transition: 'width 0.4s ease' }} />
                        </div>
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 800, color: C.text, width: 38, textAlign: 'right', flexShrink: 0 }}>{item.score}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: gc, background: gbg, borderRadius: 6, padding: '3px 10px', flexShrink: 0, minWidth: 28, textAlign: 'center' }}>{grade}</span>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: C.textSub, padding: 0, transform: isExp ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>⌄</button>
                    </div>
                    {isExp && (
                      <div style={{ borderTop: `1px solid ${C.border}`, background: C.lightBg }}>
                        <div style={{ padding: '14px 20px 10px', fontSize: 13, color: '#374151', lineHeight: 1.7, borderBottom: `1px dashed ${C.border}` }}>
                          {item.comment}
                        </div>
                        <div style={{ padding: '14px 20px 18px' }}>
                          <div style={{ fontSize: 11, color: C.textSub, letterSpacing: 1, marginBottom: 12, fontWeight: 700 }}>실천하면 점수가 올라요</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {item.actions.map(action => {
                              const checked = !!actions[action.id];
                              return (
                                <div
                                  key={action.id}
                                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: checked ? C.lightBg : C.white, borderRadius: 10, border: `1.5px solid ${checked ? C.primary : C.border}`, cursor: 'pointer', transition: 'all 0.15s' }}
                                  onClick={() => toggleAction(action.id)}
                                >
                                  <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${checked ? C.primary : C.border}`, background: checked ? C.primary : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                                    {checked && <span style={{ color: '#fff', fontSize: 11, fontWeight: 900 }}>✓</span>}
                                  </div>
                                  <span style={{ fontSize: 14, flex: 1, color: checked ? C.text : '#374151', fontWeight: checked ? 700 : 400 }}>{action.label}</span>
                                  {action.gcProduct && (
                                    <span style={{ fontSize: 10, fontWeight: 700, color: C.primary, background: C.lightBg, border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 8px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                      GC 추천 →
                                    </span>
                                  )}
                                  <span style={{ fontSize: 11, fontWeight: 700, color: checked ? C.mildG : C.textSub, background: checked ? '#f0fdf4' : '#f3f4f6', borderRadius: 6, padding: '3px 8px', flexShrink: 0 }}>
                                    +{action.bonus}점
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          {item.actions.some(a => a.gcProduct) && (
                            <div style={{ marginTop: 12, padding: '10px 14px', background: C.lightBg, borderRadius: 8, borderLeft: `3px solid ${C.primary}` }}>
                              <div style={{ fontSize: 10, color: C.primary, fontWeight: 700, marginBottom: 4 }}>GC 지씨케어 추천 제품</div>
                              {item.actions.filter(a => a.gcProduct).map(a => (
                                <div key={a.id} style={{ fontSize: 12, color: '#374151' }}>· {a.gcProduct}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Portfolio total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 24, borderTop: `2px solid ${C.primary}` }}>
              <div>
                <div style={{ fontSize: 12, color: C.textSub, marginBottom: 4 }}>포트폴리오 종합 건강 점수</div>
                <div style={{ fontSize: 13, color: pfColor, fontWeight: 500 }}>
                  {portfolioScore >= 80 ? '🏆 건강 포트폴리오 안정. 이 루틴을 유지하세요.' : portfolioScore >= 65 ? '📈 양호. 혈당·근육량 집중 관리 필요.' : portfolioScore >= 50 ? '⚠️ 주의. 리밸런싱 시작이 시급합니다.' : '🚨 위험. 지금 당장 3대 리스크를 잡으세요.'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 48, fontWeight: 900, color: pfColor, letterSpacing: '-1px' }}>{portfolioScore}</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: pfColor, marginLeft: 4 }}>{pfGrade}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: C.deepBlue, borderRadius: 14, padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>건강 리밸런싱 포트폴리오 · {data.week}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>DATA: v1 · v3 · Claude AI</span>
        </div>
      </main>
    </div>
  );
}
