import Link from "next/link";
import { weeklyData } from "./data";

const colorMap: Record<
  string,
  { bg: string; border: string; text: string; bar: string; badge: string }
> = {
  indigo: {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-700",
    bar: "bg-indigo-500",
    badge: "bg-indigo-100 text-indigo-700",
  },
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    bar: "bg-orange-500",
    badge: "bg-orange-100 text-orange-700",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    bar: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700",
  },
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    bar: "bg-green-500",
    badge: "bg-green-100 text-green-700",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    bar: "bg-blue-500",
    badge: "bg-blue-100 text-blue-700",
  },
};

export default function Page3040() {
  const data = weeklyData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-green-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-gray-400 hover:text-green-600 transition-colors p-1"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-green flex items-center justify-center">
                <span className="text-white font-bold text-xs">GC</span>
              </div>
              <div>
                <span className="font-bold text-sm text-gray-900">
                  GC Health Weekly
                </span>
                <span className="text-gray-400 mx-1 text-sm">·</span>
                <span className="text-xs text-green-600 font-semibold">
                  3040 직장인
                </span>
              </div>
            </div>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full hidden sm:block">
            {data.weekLabel}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Section 1: 이번 주 임팩트 */}
        <section className="animate-fade-in">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full mb-3">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            이번 주 직장인 건강 임팩트
          </div>

          <div className="bg-gradient-to-br from-green-700 to-green-500 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
            <div className="text-4xl mb-3">{data.impactEmoji}</div>
            <h1 className="text-xl sm:text-2xl font-black leading-tight mb-3">
              &ldquo;{data.impactHeadline}&rdquo;
            </h1>
            <p className="text-green-100 text-sm sm:text-base leading-relaxed">
              {data.impactSub}
            </p>
            <div className="mt-4 pt-4 border-t border-green-400/40 flex items-center gap-2 text-xs text-green-200">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {data.publishDate} 발행 · {data.weekLabel}
            </div>
          </div>
        </section>

        {/* Section 2: 급상승 키워드 TOP 5 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full mb-2">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                    clipRule="evenodd"
                  />
                </svg>
                급상승 키워드
              </div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900">
                이번 주 직장인 검색 TOP 5
              </h2>
            </div>
            <span className="text-xs text-gray-400">전주 대비</span>
          </div>

          <div className="space-y-3">
            {data.keywords.map((kw) => {
              const colors = colorMap[kw.color];
              const barWidth = Math.min(kw.changePercent * 1.5, 100);
              return (
                <div
                  key={kw.rank}
                  className={`rounded-xl border ${colors.border} ${colors.bg} p-4`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-gray-200 w-6 text-center leading-none">
                        {kw.rank}
                      </span>
                      <div>
                        <span className="font-bold text-gray-900 text-base">
                          {kw.name}
                        </span>
                        <span
                          className={`ml-2 text-xs px-1.5 py-0.5 rounded ${colors.badge} font-semibold`}
                        >
                          #{kw.tag}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-3 h-3 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm font-black text-red-600">
                        +{kw.changePercent}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 bg-white/70 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full ${colors.bar} rounded-full transition-all duration-700`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>

                  {/* Body sensation */}
                  <div className="text-xs text-gray-500 italic">
                    💬 &ldquo;{kw.bodySensation}&rdquo;
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3: 키워드별 체감 인사이트 */}
        <section>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full mb-3">
            🔍 키워드별 체감 인사이트
          </div>
          <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-4">
            내 몸에 와닿는 해설
          </h2>

          <div className="space-y-4">
            {data.keywords.map((kw) => {
              const colors = colorMap[kw.color];
              return (
                <div
                  key={kw.rank}
                  className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm card-hover"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg ${colors.bg} ${colors.border} border flex items-center justify-center text-sm font-black ${colors.text} flex-shrink-0`}
                    >
                      {kw.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-bold text-gray-900">
                          {kw.name}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${colors.badge} font-semibold`}
                        >
                          #{kw.tag}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {kw.insight}
                      </p>
                      <div
                        className={`mt-3 text-xs ${colors.text} ${colors.bg} rounded-lg px-3 py-2 border ${colors.border}`}
                      >
                        <span className="font-semibold">체감 포인트:</span>{" "}
                        {kw.bodySensation}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 4: 주목 뉴스 */}
        <section>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full mb-3">
            📰 직장인 주목 뉴스
          </div>
          <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-4">
            이번 주 꼭 읽어야 할 뉴스 3
          </h2>

          <div className="space-y-4">
            {data.news.map((item, idx) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm card-hover"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">{item.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        {item.source}
                      </span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">
                        읽기 {item.readTime}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                </div>
                <div className="mt-3 ml-10 sm:ml-14 text-xs text-gray-400 flex items-center gap-1">
                  <span className="w-5 h-px bg-gray-200 block"></span>
                  뉴스 {idx + 1}/{data.news.length}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: 다음 주 예고 */}
        <section className="pb-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">👀</span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {data.nextWeekPreview.teaser}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black mb-4 text-gray-100">
              다음 주 GC Health Weekly 예고
            </h2>
            <ul className="space-y-3">
              {data.nextWeekPreview.topics.map((topic, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-400 text-xs font-bold">
                      {i + 1}
                    </span>
                  </div>
                  <span className="text-sm text-gray-300 leading-relaxed">
                    {topic}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-500">
                매주 월요일 오전 발행 · 구독하면 가장 먼저 받아볼 수 있어요
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs mb-2">
            본 콘텐츠는 건강 정보 제공을 목적으로 하며, 의학적 진단·치료를
            대체하지 않습니다.
          </p>
          <p className="text-xs text-gray-600">
            © 2026 GC Health Weekly. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
