'use client';
import { useState, useEffect, useMemo } from 'react';
import type { PageData } from '../lib/fetchHealthData';

const SANS = "'Noto Sans KR', sans-serif";

const C = {
  primary:     '#0072CE',
  secondary:   '#00A9E0',
  deepBlue:    '#002B49',
  yellow:      '#FFC845',
  mildGreen:   '#43B02A',
  red:         '#E4002B',
  bg:          '#f0f4f8',
  white:       '#ffffff',
  text:        '#111827',
  textSub:     '#6b7280',
  border:      '#e5e7eb',
};

const TAGS_20S = [
  '피부 트러블', '수면 부족', '다이어트 강박',
  '번아웃', '탈모 시작', '소화 문제',
  '눈 피로', '불안·우울', '허리 통증',
];

const AI_COMMENT = '이번 주 20대 검색 1위는 피부 트러블이에요. 다이어트·운동 관심은 높은데 수면 점수가 바닥이에요. 갓생을 살고 싶은데 몸이 안 따라오는 거예요.';
const EXPERT_COMMENT = '수면 부족이 피부 트러블과 우울감을 동시에 악화시킵니다. 이번 주 20대 데이터에서 세 지표가 동시에 상위권에 진입한 것은 생활 리듬 붕괴의 전형적인 신호입니다.';

const NATIONAL_AVG_GPA = 56;

interface Action {
  id: string;
  label: string;
  bonus: number;
  gcProduct?: string;
}
interface Subject {
  id: string;
  icon: string;
  name: string;
  avg: number;
  comment: string;
  actions: Action[];
}

const SUBJECTS: Subject[] = [
  {
    id: 'skin', icon: '✨', name: '피부·외모', avg: 48,
    comment: '피부 트러블 검색 급등. 수분 공급부터 시작하세요.',
    actions: [
      { id: 'skin_1', label: '자외선차단제 매일 바르기',  bonus: 8 },
      { id: 'skin_2', label: '하루 1.5L 수분 섭취',      bonus: 7 },
      { id: 'skin_3', label: '세안 후 보습 루틴 지키기',  bonus: 6, gcProduct: 'GC녹십자 피부 수분 앰플' },
      { id: 'skin_4', label: '당류 섭취 줄이기',          bonus: 5 },
    ],
  },
  {
    id: 'diet', icon: '🥗', name: '다이어트', avg: 62,
    comment: '다이어트 관심도 상위권. 요요 주의가 필요해요.',
    actions: [
      { id: 'diet_1', label: '아침 식사 거르지 않기',    bonus: 8 },
      { id: 'diet_2', label: '식사 20분 천천히 먹기',    bonus: 7 },
      { id: 'diet_3', label: '단백질 보충제 섭취',       bonus: 6, gcProduct: 'GC웰피스 단백질 쉐이크' },
      { id: 'diet_4', label: '야식 11시 이후 금지',      bonus: 5 },
    ],
  },
  {
    id: 'sleep', icon: '😴', name: '수면', avg: 41,
    comment: '불면증 검색 급증. 갓생의 치명적 구멍이에요.',
    actions: [
      { id: 'sleep_1', label: '취침 1시간 전 스마트폰 끄기', bonus: 10 },
      { id: 'sleep_2', label: '7시간 이상 수면 확보',        bonus: 10 },
      { id: 'sleep_3', label: '수면 보조제 활용',            bonus: 6, gcProduct: 'GC녹십자 멜라토닌 수면건강' },
      { id: 'sleep_4', label: '일정한 기상 시간 유지',       bonus: 8 },
    ],
  },
  {
    id: 'mental', icon: '🧠', name: '멘탈', avg: 55,
    comment: '우울감 검색 꾸준히 유지. 혼자 버티지 마세요.',
    actions: [
      { id: 'mental_1', label: '하루 10분 명상·호흡',    bonus: 8 },
      { id: 'mental_2', label: '감사일기 3줄 쓰기',      bonus: 7 },
      { id: 'mental_3', label: '오메가3 꾸준히 섭취',    bonus: 5, gcProduct: 'GC녹십자 오메가3' },
      { id: 'mental_4', label: '주 1회 자연 속 걷기',    bonus: 8 },
    ],
  },
  {
    id: 'exercise', icon: '💪', name: '운동', avg: 74,
    comment: '헬스·운동 관심 1위. 이번 주 가장 잘하는 과목.',
    actions: [
      { id: 'ex_1', label: '주 3회 이상 유산소 운동', bonus: 10 },
      { id: 'ex_2', label: '하루 8천보 걷기',         bonus: 8 },
      { id: 'ex_3', label: '근력 운동 주 2회',        bonus: 8 },
      { id: 'ex_4', label: '운동 후 단백질 보충',     bonus: 6, gcProduct: 'GC웰피스 BCAA' },
    ],
  },
];

const TREND: Record<string, { label: string; color: string; bg: string }> = {
  up:   { label: '▲ 급등', color: C.red,       bg: '#fce8eb' },
  new:  { label: 'NEW',    color: C.mildGreen,  bg: '#edfce8' },
  down: { label: '▼',      color: C.primary,    bg: '#e8f1fc' },
  same: { label: '—',      color: '#9ca3af',    bg: '#f3f4f6' },
};

function gradeFromScore(s: number) {
  if (s >= 90) return { grade: 'A+', color: '#059669', bg: '#ecfdf5' };
  if (s >= 80) return { grade: 'A',  color: '#059669', bg: '#ecfdf5' };
  if (s >= 70) return { grade: 'B+', color: C.primary, bg: '#eff6ff' };
  if (s >= 60) return { grade: 'B',  color: C.primary, bg: '#eff6ff' };
  if (s >= 50) return { grade: 'C',  color: '#d97706', bg: '#fffbeb' };
  if (s >= 40) return { grade: 'D',  color: C.red,     bg: '#fef2f2' };
  return              { grade: 'F',  color: C.red,     bg: '#fef2f2' };
}

export default function DashboardClient({ data }: { data: PageData }) {
  const [loaded,    setLoaded]    = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [kwChecked, setKwChecked] = useState<Record<string, boolean>>({});
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [actions,   setActions]   = useState<Record<string, boolean>>({});

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

  const subjectScores = useMemo(() =>
    SUBJECTS.map(sub => {
      const bonus = sub.actions
        .filter(a => actions[a.id])
        .reduce((s, a) => s + a.bonus, 0);
      return { ...sub, score: Math.min(100, sub.avg + bonus) };
    }),
    [actions]
  );

  const myGpa    = Math.round(subjectScores.reduce((s, sub) => s + sub.score, 0) / SUBJECTS.length);
  const gpaVsAvg = myGpa - NATIONAL_AVG_GPA;
  const weakest  = [...subjectScores].sort((a, b) => a.score - b.score)[0];

  const kwSet       = new Set(data.keywords.map(k => k.kw));
  const isHighlight = (tag: string) =>
    [...kwSet].some(k => tag.includes(k.slice(0, 2)) || k.includes(tag.slice(0, 2)));

  /* ── Loading screen ── */
  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', background: C.deepBlue, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: SANS }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 5, marginBottom: 28 }}>GC HEALTH WEEKLY</div>
        <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 6 }}>갓생 성적표</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 48 }}>20대 주간 건강 리포트</div>
        <div style={{ width: 240, height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${C.primary}, ${C.secondary})`, borderRadius: 3, transition: 'width 0.08s linear' }} />
        </div>
        <div style={{ marginTop: 14, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>데이터 로딩 중...</div>
      </div>
    );
  }

  const { grade: myGrade, color: myGradeColor, bg: myGradeBg } = gradeFromScore(myGpa);

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
            {['주간리포트', '20대', '건강트렌드'].map(t => (
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
            <span style={{ fontSize: 11, fontWeight: 700, color: C.primary, background: '#eff6ff', borderRadius: 5, padding: '4px 12px' }}>20대</span>
            <span style={{ fontSize: 11, color: C.textSub, background: '#f3f4f6', borderRadius: 5, padding: '4px 12px' }}>{data.week}</span>
            <span style={{ fontSize: 11, color: C.textSub, background: '#f3f4f6', borderRadius: 5, padding: '4px 12px' }}>{data.vol}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 900, color: C.deepBlue, margin: '0 0 8px', lineHeight: 1.1, letterSpacing: '-1px' }}>
            갓생 건강 <span style={{ color: C.primary }}>성적표</span>
          </h1>
          <p style={{ fontSize: 16, color: C.textSub, margin: '0 0 24px' }}>데이터로 읽는 20대의 한 주</p>
          <div style={{ background: C.white, borderLeft: `4px solid ${C.primary}`, borderRadius: '0 14px 14px 0', padding: '18px 22px', maxWidth: 680, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 10, color: C.primary, letterSpacing: 3, marginBottom: 10, fontWeight: 700 }}>EDITOR</div>
            <p style={{ fontSize: 15, color: C.text, lineHeight: 1.95, margin: 0 }}>{AI_COMMENT}</p>
          </div>
        </div>

        {/* 3 stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
          {[
            { label: '이번 주 실검 1위',    value: data.keywords[0]?.kw || data.topKeyword, sub: '20대 건강 검색 TOP',   bg: C.primary,  dark: false },
            { label: '네이버 관심 1위',      value: data.naverCategories[0]?.label ?? '건강검진', sub: `${data.naverCategories[0]?.ratio ?? 0}% 관심도`, bg: C.deepBlue, dark: false },
            { label: '20대 평균 수면',       value: '5.8h',                                 sub: '권장치 -1.2h',          bg: C.yellow,   dark: true  },
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
              <span style={{ fontSize: 16, fontWeight: 800 }}>이번 주 건강 검색 TOP8</span>
              <span style={{ fontSize: 10, color: C.textSub, letterSpacing: 1 }}>실시간</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '38px 28px 1fr 80px 28px', gap: 8, padding: '9px 28px', background: '#f9fafb', borderBottom: `1px solid ${C.border}` }}>
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
                    style={{ display: 'grid', gridTemplateColumns: '38px 28px 1fr 80px 28px', gap: 8, alignItems: 'center', padding: '14px 28px', cursor: 'pointer', background: kwChecked[item.kw] ? '#f0f7ff' : 'transparent', transition: 'background 0.15s' }}
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
                    <div style={{ height: '100%', width: `${Math.min(c.ratio, 100)}%`, background: i === 0 ? C.primary : `${C.secondary}88`, borderRadius: 4, transition: 'width 0.6s ease' }} />
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
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>20대가 늘 겪는 것들</div>
          <p style={{ fontSize: 13, color: C.textSub, lineHeight: 1.6, margin: '0 0 18px' }}>
            이번 주 실검과 겹치는 항목은 <span style={{ color: C.primary, fontWeight: 700 }}>파란색</span>으로 표시됩니다.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TAGS_20S.map(tag => {
              const hi = isHighlight(tag);
              return (
                <span key={tag} style={{ fontSize: 13, fontWeight: hi ? 700 : 400, color: hi ? C.primary : C.textSub, background: hi ? '#eff6ff' : '#f9fafb', border: `1.5px solid ${hi ? C.primary : C.border}`, borderRadius: 24, padding: '7px 16px' }}>
                  {hi && '● '}{tag}
                </span>
              );
            })}
          </div>
        </div>

        {/* Scorecard */}
        <div style={{ background: C.white, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', borderBottom: `2px solid ${C.primary}` }}>
            <div style={{ padding: '22px 28px' }}>
              <div style={{ fontSize: 10, color: C.textSub, letterSpacing: 2, marginBottom: 6 }}>갓생 성적표 · HEALTH REPORT CARD</div>
              <div style={{ fontSize: 17, fontWeight: 800 }}>이번 주 나의 갓생 성적표</div>
            </div>
            <div style={{ background: C.deepBlue, padding: '22px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>이번 주 건강 적신호</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                {data.keywords.slice(0, 3).map(k => k.kw).join(' · ') || '데이터 로딩 중'}
              </div>
            </div>
          </div>

          <div style={{ padding: '28px' }}>
            {/* GPA summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
              <div style={{ background: myGradeBg, borderRadius: 14, padding: '22px', border: `2px solid ${myGradeColor}22` }}>
                <div style={{ fontSize: 11, color: C.textSub, marginBottom: 12, fontWeight: 500 }}>나의 GPA</div>
                <div style={{ fontSize: 48, fontWeight: 900, color: myGradeColor, lineHeight: 1, marginBottom: 6 }}>{myGpa}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: myGradeColor, background: '#fff', borderRadius: 6, padding: '3px 10px' }}>{myGrade}</span>
                  <span style={{ fontSize: 11, color: C.textSub }}>
                    {myGpa >= 80 ? '🎉 갓생 인증!' : myGpa >= 60 ? '😐 절반의 갓생' : '🚨 갓생 위기'}
                  </span>
                </div>
              </div>
              <div style={{ background: gpaVsAvg >= 0 ? '#f0fdf4' : '#fef2f2', borderRadius: 14, padding: '22px', border: `2px solid ${gpaVsAvg >= 0 ? C.mildGreen : C.red}22` }}>
                <div style={{ fontSize: 11, color: C.textSub, marginBottom: 12, fontWeight: 500 }}>전국 평균 대비</div>
                <div style={{ fontSize: 48, fontWeight: 900, color: gpaVsAvg >= 0 ? C.mildGreen : C.red, lineHeight: 1, marginBottom: 6 }}>
                  {gpaVsAvg >= 0 ? '+' : ''}{gpaVsAvg}
                </div>
                <div style={{ fontSize: 12, color: C.textSub }}>전국 평균 {NATIONAL_AVG_GPA}점</div>
              </div>
              <div style={{ background: '#fff7ed', borderRadius: 14, padding: '22px', border: '2px solid #fed7aa' }}>
                <div style={{ fontSize: 11, color: C.textSub, marginBottom: 12, fontWeight: 500 }}>가장 약한 과목</div>
                <div style={{ fontSize: 34, fontWeight: 900, color: '#ea580c', lineHeight: 1.1, marginBottom: 6 }}>
                  {weakest.icon} {weakest.name}
                </div>
                <div style={{ fontSize: 12, color: '#ea580c', fontWeight: 500 }}>{weakest.score}점 — 집중 관리 필요</div>
              </div>
            </div>

            {/* 5 subjects */}
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>과목별 상세 성적 및 실천 체크리스트</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {subjectScores.map(sub => {
                const { grade, color: gc, bg: gbg } = gradeFromScore(sub.score);
                const isExp        = expanded === sub.id;
                const checkedCount = sub.actions.filter(a => actions[a.id]).length;
                return (
                  <div key={sub.id} style={{ border: `1.5px solid ${isExp ? C.primary : C.border}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', cursor: 'pointer', background: isExp ? '#f0f7ff' : C.white }}
                      onClick={() => setExpanded(isExp ? null : sub.id)}
                    >
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{sub.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{sub.name}</span>
                          {checkedCount > 0 && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: C.primary, background: '#eff6ff', borderRadius: 10, padding: '2px 8px' }}>+{checkedCount}개 실천</span>
                          )}
                        </div>
                        <div style={{ height: 7, background: '#f3f4f6', borderRadius: 4 }}>
                          <div style={{ height: '100%', width: `${sub.score}%`, background: gc, borderRadius: 4, transition: 'width 0.4s ease' }} />
                        </div>
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 800, color: C.text, width: 38, textAlign: 'right', flexShrink: 0 }}>{sub.score}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: gc, background: gbg, borderRadius: 6, padding: '3px 10px', flexShrink: 0, minWidth: 36, textAlign: 'center' }}>{grade}</span>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: C.textSub, padding: 0, transform: isExp ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>⌄</button>
                    </div>
                    {isExp && (
                      <div style={{ borderTop: `1px solid ${C.border}`, background: '#f9fafb' }}>
                        <div style={{ padding: '14px 20px 10px', fontSize: 13, color: '#374151', lineHeight: 1.7, borderBottom: `1px dashed ${C.border}` }}>
                          {sub.comment}
                        </div>
                        <div style={{ padding: '14px 20px 18px' }}>
                          <div style={{ fontSize: 11, color: C.textSub, letterSpacing: 1, marginBottom: 12, fontWeight: 700 }}>실천하면 점수가 올라요</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {sub.actions.map(action => {
                              const checked = !!actions[action.id];
                              return (
                                <div
                                  key={action.id}
                                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: checked ? '#eff6ff' : C.white, borderRadius: 10, border: `1.5px solid ${checked ? C.primary : C.border}`, cursor: 'pointer', transition: 'all 0.15s' }}
                                  onClick={() => toggleAction(action.id)}
                                >
                                  <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${checked ? C.primary : C.border}`, background: checked ? C.primary : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                                    {checked && <span style={{ color: '#fff', fontSize: 11, fontWeight: 900 }}>✓</span>}
                                  </div>
                                  <span style={{ fontSize: 14, flex: 1, color: checked ? C.text : '#374151', fontWeight: checked ? 700 : 400 }}>{action.label}</span>
                                  {action.gcProduct && (
                                    <span style={{ fontSize: 10, fontWeight: 700, color: C.primary, background: '#eff6ff', border: `1px solid ${C.primary}33`, borderRadius: 6, padding: '3px 8px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                      GC 추천 →
                                    </span>
                                  )}
                                  <span style={{ fontSize: 11, fontWeight: 700, color: checked ? C.mildGreen : C.textSub, background: checked ? '#f0fdf4' : '#f3f4f6', borderRadius: 6, padding: '3px 8px', flexShrink: 0 }}>
                                    +{action.bonus}점
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          {sub.actions.some(a => a.gcProduct) && (
                            <div style={{ marginTop: 12, padding: '10px 14px', background: '#eff6ff', borderRadius: 8, borderLeft: `3px solid ${C.primary}` }}>
                              <div style={{ fontSize: 10, color: C.primary, fontWeight: 700, marginBottom: 4 }}>GC 지씨케어 추천 제품</div>
                              {sub.actions.filter(a => a.gcProduct).map(a => (
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

            {/* GPA total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 24, borderTop: `2px solid ${C.primary}` }}>
              <div>
                <div style={{ fontSize: 12, color: C.textSub, marginBottom: 4 }}>나의 종합 GPA</div>
                <div style={{ fontSize: 13, color: myGradeColor, fontWeight: 500 }}>
                  {myGpa >= 80 ? '🎉 갓생 인증! 이 루틴 유지하세요.' : myGpa >= 60 ? '😐 절반의 갓생. 수면부터 챙기세요.' : '🚨 갓생 위기. 딱 하나만 고쳐볼까요?'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 48, fontWeight: 900, color: myGradeColor, letterSpacing: '-1px' }}>{myGpa}</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: myGradeColor, marginLeft: 4 }}>{myGrade}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: C.deepBlue, borderRadius: 14, padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>갓생 건강 성적표 · {data.week}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>DATA: v1 · v3 · Claude AI</span>
        </div>
      </main>
    </div>
  );
}
