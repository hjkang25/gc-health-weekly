'use client';
import { useState, useEffect } from 'react';
import type { PageData } from '../lib/fetchHealthData';

const FONT_LINK = 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=Space+Mono:wght@400;700&display=swap';
const SANS = "'Noto Sans KR', sans-serif";
const MONO = "'Space Mono', monospace";

const TAGS_20S = [
  '피부 트러블', '수면 부족', '다이어트 강박',
  '번아웃', '탈모 시작', '소화 문제',
  '눈 피로', '불안·우울', '허리 통증',
];

const SUBJECTS = [
  { id: 'skin',     icon: '✨', name: '피부·외모',  score: 58, grade: 'D+', comment: '피부 트러블 검색 급등. 수분 공급부터 시작하세요.' },
  { id: 'diet',     icon: '🥗', name: '다이어트',    score: 82, grade: 'B',  comment: '다이어트 관심도 상위권. 요요 주의 필요해요.' },
  { id: 'sleep',    icon: '😴', name: '수면',        score: 41, grade: 'F',  comment: '불면증 검색 급증. 갓생의 치명적 구멍이에요.' },
  { id: 'mental',   icon: '🧠', name: '멘탈',        score: 63, grade: 'C',  comment: '우울감 검색 꾸준히 유지. 혼자 버티지 마세요.' },
  { id: 'exercise', icon: '💪', name: '운동',        score: 88, grade: 'B+', comment: '헬스·운동 관심 1위. 이번 주 가장 잘하는 과목.' },
];

const AI_COMMENT_FALLBACK = '이번 주 20대 검색 1위는 피부 트러블이에요. 다이어트·운동 관심은 높은데 수면 점수가 바닥이에요. 갓생을 살고 싶은데 몸이 안 따라오는 거예요.';
const EXPERT_COMMENT = '수면 부족이 피부 트러블과 우울감을 동시에 악화시킵니다. 이번 주 20대 데이터에서 세 지표가 동시에 상위권에 진입한 것은 생활 리듬 붕괴의 전형적인 신호입니다.';

const TREND_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  up:   { label: '▲ 급등', color: '#E4002B', bg: '#fce8eb' },
  new:  { label: 'NEW',    color: '#059669',  bg: '#ecfdf5' },
  down: { label: '▼',      color: '#6366f1',  bg: '#eef2ff' },
  same: { label: '—',      color: '#9ca3af',  bg: '#f8f7ff' },
};

function gradeStyle(grade: string) {
  if (grade.startsWith('A')) return { color: '#059669', bg: '#ecfdf5' };
  if (grade.startsWith('B')) return { color: '#2563eb', bg: '#eff6ff' };
  if (grade.startsWith('C')) return { color: '#d97706', bg: '#fffbeb' };
  return { color: '#E4002B', bg: '#fef2f2' };
}

function SectionLabel({ text, source }: { text: string; source?: string }) {
  return (
    <div style={{ borderBottom: '2px solid #5b21b6', paddingBottom: 10, marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800, color: '#1e1b4b' }}>{text}</span>
      {source && <span style={{ fontFamily: MONO, fontSize: 9, color: '#9ca3af', letterSpacing: 1 }}>{source}</span>}
    </div>
  );
}

export default function DashboardClient({ data }: { data: PageData }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [scoreOpen, setScoreOpen] = useState(false);
  const [aiComment, setAiComment] = useState(AI_COMMENT_FALLBACK);
  const [commentLoading, setCommentLoading] = useState(true);

  useEffect(() => {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = FONT_LINK;
    document.head.appendChild(l);
    return () => { document.head.removeChild(l); };
  }, []);

  useEffect(() => {
    const kws = data.keywords.map(k => k.kw);
    if (!kws.length) { setCommentLoading(false); return; }
    fetch('/api/generate-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords: kws, target: '20s' }),
    })
      .then(r => r.json())
      .then(d => { if (d.comment) setAiComment(d.comment); })
      .catch(() => {})
      .finally(() => setCommentLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (kw: string) => setChecked(p => ({ ...p, [kw]: !p[kw] }));
  const hasChecked = Object.values(checked).some(Boolean);
  const checkedSubjects = SUBJECTS.filter(s => checked[s.id]);
  const myGpa = checkedSubjects.length > 0
    ? (checkedSubjects.reduce((s, sub) => s + sub.score, 0) / checkedSubjects.length).toFixed(1)
    : null;
  const kwSet = new Set(data.keywords.map(k => k.kw.replace(/·.*/, '')));
  const isHighlight = (tag: string) => [...kwSet].some(k => tag.includes(k) || k.includes(tag.replace(/·.*/, '')));

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: SANS, color: '#1e1b4b' }}>
      <header style={{ background: '#5b21b6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 28px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
          <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 2 }}>{data.date}</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['주간리포트', '20대', '건강트렌드'].map(t => (
              <span key={t} style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '32px 28px 24px' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 5, marginBottom: 12 }}>GC HEALTH WEEKLY</div>
          <h1 style={{ fontFamily: SANS, fontWeight: 900, fontSize: 'clamp(36px, 5vw, 58px)', color: '#fff', margin: '0 0 10px', letterSpacing: '-1px', lineHeight: 1 }}>
            갓생 건강 성적표
          </h1>
          <div style={{ width: 36, height: 2, background: '#a78bfa', margin: '0 auto 12px' }} />
          <div style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
            데이터로 읽는 20대의 한 주 · {data.week} · {data.vol}
          </div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px 28px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: '#5b21b6', background: '#fff', borderRadius: 3, padding: '3px 7px', flexShrink: 0, marginTop: 2 }}>EDITOR</span>
          <p style={{ fontFamily: SANS, fontSize: 14, color: '#ffffff', lineHeight: 1.85, margin: 0, opacity: commentLoading ? 0.5 : 1, transition: 'opacity 0.4s' }}>
            {aiComment}
            {commentLoading && <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.5)', marginLeft: 8 }}>AI 생성 중...</span>}
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '24px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 2, marginBottom: 2 }}>
          {/* Left: keyword list */}
          <div style={{ background: '#f8f7ff', padding: '24px' }}>
            <SectionLabel text="이번 주 건강 검색 TOP8" source="v3 실시간" />
            {data.keywords.map((item) => {
              const tr = TREND_CONFIG[item.trend];
              const isExp = expanded === item.kw;
              return (
                <div key={item.kw} style={{ borderBottom: '1px solid #ede9fe' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0', cursor: 'pointer' }} onClick={() => toggle(item.kw)}>
                    <div style={{ width: 20, height: 20, borderRadius: 4, flexShrink: 0, background: checked[item.kw] ? '#5b21b6' : 'transparent', border: `2px solid ${checked[item.kw] ? '#5b21b6' : '#ede9fe'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                      {checked[item.kw] && <span style={{ color: '#fff', fontSize: 11, fontWeight: 900 }}>✓</span>}
                    </div>
                    <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: item.rank <= 3 ? '#7c3aed' : '#ede9fe', width: 22, flexShrink: 0 }}>{String(item.rank).padStart(2, '0')}</span>
                    <span style={{ fontSize: 14, fontWeight: checked[item.kw] ? 700 : 400, color: checked[item.kw] ? '#1e1b4b' : '#6b7280', flex: 1 }}>{item.kw}</span>
                    <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: tr.color, background: tr.bg, borderRadius: 3, padding: '2px 6px', flexShrink: 0 }}>{tr.label}</span>
                    <button onClick={(e) => { e.stopPropagation(); setExpanded(isExp ? null : item.kw); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ede9fe', fontSize: 12, padding: 0, flexShrink: 0, transform: isExp ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}>⌄</button>
                  </div>
                  {isExp && (
                    <div style={{ padding: '6px 0 12px 52px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: MONO, fontSize: 9, color: '#9ca3af', alignSelf: 'center', marginRight: 2 }}>같이 검색</span>
                      {item.related.length > 0 ? item.related.map(r => (
                        <span key={r} style={{ fontSize: 11, color: '#6b7280', background: '#fff', border: '1px solid #ede9fe', borderRadius: 4, padding: '3px 8px' }}>{r}</span>
                      )) : <span style={{ fontSize: 11, color: '#9ca3af' }}>관련 검색어 없음</span>}
                    </div>
                  )}
                </div>
              );
            })}
            {data.keywords.length === 0 && (
              <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>데이터를 불러오는 중...</div>
            )}
          </div>

          {/* Right: naver categories + expert comment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ background: '#f8f7ff', padding: '24px', flex: '0 0 auto' }}>
              <SectionLabel text="건강 관심사" source="v1 네이버" />
              {data.naverCategories.map((c, i) => (
                <div key={c.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>{c.label}</span>
                    <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: i === 0 ? '#7c3aed' : '#9ca3af' }}>{c.ratio}</span>
                  </div>
                  <div style={{ height: 5, background: '#ede9fe', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${Math.min(c.ratio, 100)}%`, background: i === 0 ? '#7c3aed' : '#a78bfa88', borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: '#5b21b6', padding: '22px 20px', flex: 1 }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: '#a78bfa', letterSpacing: 2, marginBottom: 12 }}>GC 지씨케어 전문의 코멘트</div>
              <p style={{ fontSize: 13, color: '#ffffff', lineHeight: 1.85, margin: '0 0 16px', fontWeight: 400 }}>{EXPERT_COMMENT}</p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 12, fontFamily: MONO, fontSize: 9, color: '#a78bfa', letterSpacing: 1 }}>
                내부 데이터 연동 시 UBIST 처방 통계 추가 예정
              </div>
            </div>
          </div>
        </div>

        {/* Tags section */}
        <div style={{ background: '#f8f7ff', padding: '24px', marginBottom: 2 }}>
          <SectionLabel text="20대가 늘 겪는 것들" />
          <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, margin: '0 0 16px' }}>
            이번 주 실검과 겹치는 항목은 <span style={{ color: '#7c3aed', fontWeight: 700 }}>보라색</span>으로 표시됩니다.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TAGS_20S.map(tag => {
              const hi = isHighlight(tag);
              return (
                <span key={tag} style={{ fontSize: 13, fontWeight: hi ? 700 : 400, color: hi ? '#7c3aed' : '#6b7280', background: hi ? '#ede9fe' : '#fff', border: `1.5px solid ${hi ? '#7c3aed' : '#ede9fe'}`, borderRadius: 20, padding: '6px 14px' }}>
                  {hi && <span style={{ marginRight: 4 }}>●</span>}{tag}
                </span>
              );
            })}
          </div>
        </div>

        {/* Score section */}
        <div style={{ background: '#f8f7ff' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', borderBottom: '2px solid #5b21b6' }}>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: '#9ca3af', letterSpacing: 2, marginBottom: 6 }}>갓생 성적표 · HEALTH REPORT CARD</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#1e1b4b' }}>이번 주 나의 갓생 성적표</div>
            </div>
            <div style={{ background: '#7c3aed', padding: '20px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'right' }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>이번 주 건강 적신호</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>
                {data.keywords.slice(0, 3).map(k => k.kw).join(' · ')}
              </div>
            </div>
          </div>
          <div style={{ padding: '24px' }}>
            <button onClick={() => setScoreOpen(!scoreOpen)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #ede9fe', marginBottom: 16 }}>
              <span style={{ fontFamily: MONO, fontSize: 10, color: '#9ca3af', letterSpacing: 1 }}>
                과목별 성적 {scoreOpen ? '▲ 접기' : '▼ 펼치기'}
              </span>
            </button>
            {scoreOpen && (
              <div style={{ marginBottom: 16 }}>
                {SUBJECTS.map((sub, i) => {
                  const gs = gradeStyle(sub.grade);
                  const isExp = expanded === sub.id;
                  return (
                    <div key={sub.id} style={{ borderBottom: i < SUBJECTS.length - 1 ? '1px dashed #ede9fe' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', cursor: 'pointer' }} onClick={() => setExpanded(isExp ? null : sub.id)}>
                        <span style={{ fontSize: 16, flexShrink: 0 }}>{sub.icon}</span>
                        <span style={{ fontSize: 13, color: '#6b7280', flex: 1 }}>{sub.name}</span>
                        <div style={{ height: 4, width: 80, background: '#ede9fe', borderRadius: 2, flexShrink: 0 }}>
                          <div style={{ height: '100%', width: `${sub.score}%`, background: gs.color, borderRadius: 2 }} />
                        </div>
                        <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: '#1e1b4b', width: 28, textAlign: 'right', flexShrink: 0 }}>{sub.score}</span>
                        <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: gs.color, background: gs.bg, borderRadius: 4, padding: '2px 7px', flexShrink: 0 }}>{sub.grade}</span>
                      </div>
                      {isExp && (
                        <div style={{ background: gs.bg, borderLeft: `3px solid ${gs.color}`, margin: '0 0 10px 26px', padding: '10px 14px', borderRadius: '0 8px 8px 0' }}>
                          <p style={{ fontSize: 12, color: '#1e1b4b', lineHeight: 1.75, margin: 0 }}>{sub.comment}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ fontFamily: MONO, fontSize: 9, color: '#9ca3af', letterSpacing: 2, marginBottom: 14 }}>나의 갓생 점수 — 과목 체크 시 반영</div>
            {hasChecked && myGpa ? (
              <>
                {checkedSubjects.map(sub => {
                  const gs = gradeStyle(sub.grade);
                  return (
                    <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px dashed #ede9fe' }}>
                      <span style={{ fontSize: 13, color: '#1e1b4b' }}>{sub.icon} {sub.name}</span>
                      <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: gs.color, background: gs.bg, borderRadius: 4, padding: '2px 8px' }}>{sub.grade}</span>
                    </div>
                  );
                })}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '2px solid #5b21b6' }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: '#9ca3af' }}>나의 GPA</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: MONO, fontSize: 32, fontWeight: 700, color: '#7c3aed' }}>{myGpa}</span>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>
                      {parseFloat(myGpa) >= 80 ? '🎉 갓생 인증! 이 루틴 유지하세요.'
                        : parseFloat(myGpa) >= 60 ? '😐 절반의 갓생. 수면부터 챙기세요.'
                        : '🚨 갓생 위기. 딱 하나만 고쳐볼까요?'}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 13, color: '#ede9fe', lineHeight: 1.7 }}>
                과목을 체크하면<br />나의 갓생 점수가 계산됩니다
              </div>
            )}
          </div>
        </div>

        {/* Footer strip */}
        <div style={{ background: '#5b21b6', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
          <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>갓생 건강 성적표 · {data.week}</span>
          <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>DATA: v1 · v3 · Claude AI</span>
        </div>
      </main>
    </div>
  );
}
