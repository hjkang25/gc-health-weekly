export interface WeeklyData {
  weekLabel: string;
  publishDate: string;
  impactHeadline: string;
  impactSub: string;
  impactEmoji: string;
  keywords: Keyword[];
  news: NewsItem[];
  nextWeekPreview: NextWeekPreview;
}

export interface Keyword {
  rank: number;
  name: string;
  changePercent: number; // positive = up, negative = down
  insight: string;
  bodySensation: string; // 체감 표현
  tag: string;
  color: string;
}

export interface NewsItem {
  id: number;
  category: string;
  title: string;
  summary: string;
  source: string;
  readTime: string;
  emoji: string;
}

export interface NextWeekPreview {
  teaser: string;
  topics: string[];
}

export const weeklyData: WeeklyData = {
  weekLabel: "2026년 3월 1주차",
  publishDate: "2026.03.02",
  impactHeadline: "야근 후 '치킨+맥주'는 혈압을 하루치 올린다",
  impactSub:
    "이번 주 직장인 건강 데이터 분석 결과, 야근 뒤 음주+고지방식 조합이 다음날 오전 혈압을 평균 18mmHg 상승시키는 것으로 나타났습니다.",
  impactEmoji: "⚡",
  keywords: [
    {
      rank: 1,
      name: "수면 부채",
      changePercent: 47,
      insight:
        "평일 평균 수면 5.8시간. 주말에 몰아자도 '수면 부채'는 해소되지 않습니다. 인지기능 저하는 이미 진행 중.",
      bodySensation: "오후 2시, 눈이 저절로 감기는 그 느낌",
      tag: "수면",
      color: "indigo",
    },
    {
      rank: 2,
      name: "번아웃 증후군",
      changePercent: 31,
      insight:
        "월요일 아침 출근 전 심박수가 주말 대비 평균 12bpm 높습니다. 몸이 먼저 스트레스를 감지합니다.",
      bodySensation: "일요일 저녁, 가슴이 무거워지는 그 감각",
      tag: "멘탈",
      color: "orange",
    },
    {
      rank: 3,
      name: "허리 통증",
      changePercent: 28,
      insight:
        "하루 7시간 이상 앉아있으면 요추 디스크 압력이 서있을 때의 3배. 1시간마다 5분 걷기가 해답입니다.",
      bodySensation: "퇴근 무렵, 허리가 아파 의자에서 일어서기 힘든 느낌",
      tag: "근골격",
      color: "amber",
    },
    {
      rank: 4,
      name: "소화불량",
      changePercent: 19,
      insight:
        "점심 15분 만에 해결하는 직장인의 59%. 빠른 식사는 과식·소화불량을 부르고, 복부 팽만으로 오후 집중력을 떨어뜨립니다.",
      bodySensation: "점심 후 더부룩함, 오후 내내 속이 불편한 느낌",
      tag: "소화",
      color: "green",
    },
    {
      rank: 5,
      name: "안구 건조증",
      changePercent: 15,
      insight:
        "모니터 응시 시 눈 깜빡임이 정상의 1/3 수준으로 줄어듭니다. 20-20-20 규칙(20분마다 20초간 6m 거리 바라보기)을 적용해보세요.",
      bodySensation: "오후 늦게 눈이 뻑뻑하고 화면이 흐려지는 느낌",
      tag: "눈건강",
      color: "blue",
    },
  ],
  news: [
    {
      id: 1,
      category: "연구",
      title: "하루 10분 계단 오르기, 심혈관 건강에 달리기만큼 효과적",
      summary:
        "서울대병원 연구팀, 직장인 2,400명 추적 조사 결과 발표. 점심 후 10분 계단 오르기가 30분 유산소 운동에 버금가는 심폐 개선 효과.",
      source: "대한의학회지",
      readTime: "2분",
      emoji: "🏃",
    },
    {
      id: 2,
      category: "트렌드",
      title: "MZ직장인 '런치 워크' 열풍, 점심시간 걷기 모임 3배 급증",
      summary:
        "카카오맵 데이터 분석 결과, 점심 시간대 공원·하천 인근 직장가 유동인구 전년 대비 278% 증가. 건강과 네트워킹 동시 충족.",
      source: "조선일보",
      readTime: "1분",
      emoji: "🌿",
    },
    {
      id: 3,
      category: "경고",
      title: "에너지드링크+진통제 병용, 30·40대 위장 출혈 위험 2.7배",
      summary:
        "야근·두통에 에너지드링크와 이부프로펜을 함께 복용하는 직장인 증가. 전문가들 '위점막 손상 위험 심각' 경고.",
      source: "헬스조선",
      readTime: "3분",
      emoji: "⚠️",
    },
  ],
  nextWeekPreview: {
    teaser: "다음 주 미리보기",
    topics: [
      "커피 하루 몇 잔이 직장인 최적? 카페인 개인화 가이드",
      "재택 vs 출근, 어떤 환경이 혈압에 더 좋을까",
      "봄철 미세먼지 급증 — 마스크 착용 기준과 공기청정기 효과",
    ],
  },
};
