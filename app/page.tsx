import Link from "next/link";

const lifecycleGroups = [
  {
    id: "20s",
    label: "20대",
    sublabel: "활력 충전기",
    description: "사회 진입기의 건강 루틴과 번아웃 예방",
    icon: "🌱",
    color: "from-emerald-400 to-green-500",
    bgLight: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-700",
    available: false,
    href: "/20s",
  },
  {
    id: "3040",
    label: "3040대",
    sublabel: "직장인",
    description: "바쁜 직장인을 위한 핵심 건강 키워드와 주간 인사이트",
    icon: "💼",
    color: "from-green-500 to-green-600",
    bgLight: "bg-green-50",
    borderColor: "border-green-300",
    textColor: "text-green-700",
    available: true,
    href: "/3040",
  },
  {
    id: "5060",
    label: "5060대",
    sublabel: "액티브 시니어",
    description: "만성질환 예방과 활력 유지를 위한 건강 정보",
    icon: "🌿",
    color: "from-teal-400 to-teal-600",
    bgLight: "bg-teal-50",
    borderColor: "border-teal-200",
    textColor: "text-teal-700",
    available: false,
    href: "/5060",
  },
  {
    id: "70plus",
    label: "70대+",
    sublabel: "건강한 노년",
    description: "삶의 질을 높이는 시니어 맞춤 건강 케어",
    icon: "🏡",
    color: "from-cyan-400 to-cyan-600",
    bgLight: "bg-cyan-50",
    borderColor: "border-cyan-200",
    textColor: "text-cyan-700",
    available: false,
    href: "/70plus",
  },
];

export default function Home() {
  const currentWeek = getWeekLabel();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-green-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-green flex items-center justify-center">
              <span className="text-white font-bold text-sm">GC</span>
            </div>
            <span className="font-bold text-lg text-gray-900">
              GC Health Weekly
            </span>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {currentWeek}
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gradient-hero text-white py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-green-200">매주 업데이트</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black mb-4 leading-tight">
            당신의 나이에 맞는
            <br />
            <span className="text-green-400">건강 인사이트</span>
          </h1>
          <p className="text-base sm:text-lg text-green-100 max-w-2xl mx-auto leading-relaxed">
            생애주기별로 꼭 알아야 할 건강 트렌드를 매주 정리합니다.
            <br className="hidden sm:block" />
            내 나이에 맞는 카드를 선택하세요.
          </p>
        </div>
      </section>

      {/* Lifecycle Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            내 생애주기 선택
          </h2>
          <p className="text-gray-500 text-sm">
            해당 연령대를 클릭하면 이번 주 건강 리포트를 확인할 수 있어요
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {lifecycleGroups.map((group) =>
            group.available ? (
              <Link key={group.id} href={group.href} className="block group">
                <div
                  className={`relative rounded-2xl border-2 ${group.borderColor} ${group.bgLight} p-5 sm:p-6 h-full card-hover cursor-pointer`}
                >
                  {/* Available Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      NEW
                    </span>
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${group.color} flex items-center justify-center text-2xl sm:text-3xl mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}
                  >
                    {group.icon}
                  </div>

                  {/* Labels */}
                  <div className="mb-3">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${group.textColor} bg-white/60 px-2 py-0.5 rounded-full`}
                    >
                      {group.sublabel}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">
                    {group.label}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {group.description}
                  </p>

                  {/* Arrow */}
                  <div
                    className={`mt-4 flex items-center gap-1 text-sm font-semibold ${group.textColor} group-hover:gap-2 transition-all duration-200`}
                  >
                    리포트 보기
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ) : (
              <div key={group.id} className="block">
                <div
                  className={`relative rounded-2xl border-2 border-gray-200 bg-gray-50 p-5 sm:p-6 h-full opacity-70`}
                >
                  {/* Coming Soon Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-gray-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      준비 중
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gray-200 flex items-center justify-center text-2xl sm:text-3xl mb-4 grayscale">
                    {group.icon}
                  </div>

                  {/* Labels */}
                  <div className="mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 bg-white/60 px-2 py-0.5 rounded-full">
                      {group.sublabel}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-400 mb-2">
                    {group.label}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                    {group.description}
                  </p>

                  <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-gray-400">
                    곧 오픈 예정
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 mt-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded gradient-green flex items-center justify-center">
                <span className="text-white font-bold text-xs">GC</span>
              </div>
              <span className="font-semibold text-gray-300">
                GC Health Weekly
              </span>
            </div>
            <p className="text-xs text-center">
              본 콘텐츠는 건강 정보 제공을 목적으로 하며, 의학적 진단·치료를
              대체하지 않습니다.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800 text-center text-xs">
            © 2026 GC Health Weekly. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function getWeekLabel(): string {
  const now = new Date();
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
  );
  const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  const month = now.getMonth() + 1;
  const date = now.getDate();
  return `${year}년 ${month}월 ${date}일 · ${week}주차`;
}
