import Link from "next/link";

const sidebarItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Analytics", href: "/dashboard/analytics" },
  { label: "Policies", href: "/dashboard/policies" },
  { label: "Expenses", href: "/dashboard/expenses" },
  { label: "AI Insights", href: "/dashboard/insights" },
  { label: "Settings", href: "/dashboard/settings" },
];

const kpiCards = [
  { label: "Monthly Spend", value: "\u20A9248.4M", change: "+12%" },
  { label: "Active Policies", value: "\u20A9248.4M", change: "+12%" },
  { label: "Risk Alerts", value: "\u20A9248.4M", change: "+12%" },
];

const activities = [
  "\uC815\uCC45 \uC704\uBC18 \uACB0\uC81C\uAC00 \uAC10\uC9C0\uB418\uC5C8\uC2B5\uB2C8\uB2E4",
  "AWS \uBE44\uC6A9\uC774 15% \uC99D\uAC00\uD588\uC2B5\uB2C8\uB2E4",
  "\uC0C8\uB85C\uC6B4 SaaS \uAD6C\uB3C5\uC774 \uCD94\uAC00\uB418\uC5C8\uC2B5\uB2C8\uB2E4",
  "AI \uCD5C\uC801\uD654 \uB9AC\uD3EC\uD2B8\uAC00 \uC0DD\uC131\uB418\uC5C8\uC2B5\uB2C8\uB2E4",
];

const insights = [
  "\uD074\uB77C\uC6B0\uB4DC SaaS \uAD6C\uB3C5 3\uAC74 \uBC1C\uACAC",
  "AWS \uBE44\uC6A9 18% \uC99D\uAC00",
  "\uBBF8\uC0AC\uC6A9 \uB77C\uC774\uC120\uC2A4 \uAC10\uC9C0",
];

type DashboardShowcaseProps = {
  activeHref?: string;
};

function MonthlySpendChart() {
  return (
    <svg
      className="mt-8 h-64 w-full overflow-visible"
      fill="none"
      viewBox="0 0 760 260"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="monthlyArea" x1="0" x2="0" y1="0" y2="1">
          <stop stopColor="#8290a2" stopOpacity="0.22" />
          <stop offset="1" stopColor="#8290a2" stopOpacity="0" />
        </linearGradient>
        <filter
          id="monthlyGlow"
          x="-15%"
          y="-25%"
          width="130%"
          height="150%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M38 205 L142 182 L248 190 L356 150 L468 128 L582 92 L712 52 L712 232 L38 232 Z"
        fill="url(#monthlyArea)"
      />
      <path
        d="M38 205 L142 182 L248 190 L356 150 L468 128 L582 92 L712 52"
        stroke="#93a3b8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <circle
        cx="712"
        cy="52"
        r="4.5"
        fill="#aab8ca"
        filter="url(#monthlyGlow)"
      />
      <path d="M38 232 H712" stroke="#ffffff" strokeOpacity="0.08" />
    </svg>
  );
}

export function DashboardShowcase({
  activeHref = "/dashboard",
}: DashboardShowcaseProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-[#f8f8df]">
      <section className="mx-auto flex min-h-screen w-full max-w-[1320px] flex-col px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
        <div className="max-w-[760px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
            Dashboard
          </p>
          <h1 className="mt-8 text-[42px] font-black leading-[1.25] tracking-normal text-[#ffffdf] sm:text-[58px] lg:text-[66px]">
            복잡한 금융 운영을
            <br />
            하나의 화면에서 관리하세요
          </h1>
          <p className="mt-7 max-w-[620px] text-base font-medium leading-8 text-zinc-400 sm:text-lg">
            결제 내역, 정책 위반, 실시간 비용 분석,
            <br className="hidden sm:block" />
            AI 인사이트를 하나의 대시보드에서 확인할 수 있습니다.
          </p>
        </div>

        <div className="mt-12 grid min-h-[660px] overflow-hidden rounded-[28px] border border-white/10 bg-[#08090b] shadow-2xl shadow-black/60 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="border-b border-white/10 bg-[#0d1015] p-6 lg:border-b-0 lg:border-r">
            <Link
              href="/"
              className="block text-xl font-bold tracking-normal text-[#fbfbdc]"
            >
              Aegis-Fi
            </Link>
            <nav className="mt-10 grid gap-2">
              {sidebarItems.map((item) => {
                const active = item.href === activeHref;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-[#1b2230] text-[#fbfbdc]"
                        : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <div className="space-y-5 p-5 sm:p-7 lg:p-8">
            <div className="grid gap-4 md:grid-cols-3">
              {kpiCards.map((card) => (
                <article
                  key={card.label}
                  className="rounded-[18px] border border-white/10 bg-[#141821] p-5 shadow-xl shadow-black/30"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-4 text-3xl font-black leading-none text-[#fbfbdc]">
                    {card.value}
                  </p>
                  <p className="mt-4 text-sm font-bold text-[#8290a5]">
                    {card.change}
                  </p>
                </article>
              ))}
            </div>

            <article className="overflow-hidden rounded-[22px] border border-white/10 bg-[#111720] p-6 shadow-2xl shadow-black/40">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black tracking-normal text-[#fbfbdc]">
                    Monthly Spend Analytics
                  </h2>
                  <p className="mt-2 text-sm font-medium text-zinc-500">
                    AI-powered monthly expense trend
                  </p>
                </div>
                <span className="rounded-full bg-[#202837] px-4 py-2 text-xs font-bold text-[#93a3b8]">
                  +18.2%
                </span>
              </div>
              <MonthlySpendChart />
            </article>

            <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
              <article className="rounded-[22px] border border-white/10 bg-[#101319] p-6 shadow-2xl shadow-black/30">
                <h2 className="text-xl font-black tracking-normal text-[#fbfbdc]">
                  실시간 활동
                </h2>
                <ul className="mt-6 grid gap-4">
                  {activities.map((activity) => (
                    <li
                      key={activity}
                      className="flex items-center gap-3 text-sm font-medium text-zinc-400"
                    >
                      <span className="size-2 rounded-full bg-[#8290a5] shadow-[0_0_12px_rgba(130,144,165,0.75)]" />
                      {activity}
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rounded-[22px] border border-white/10 bg-[#151a24] p-6 shadow-2xl shadow-black/30">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8290a5]">
                  AI Insights
                </p>
                <h2 className="mt-4 text-xl font-black leading-snug tracking-normal text-[#fbfbdc]">
                  이번 달 비용 이상 패턴이 감지되었습니다
                </h2>
                <ul className="mt-6 grid gap-3">
                  {insights.map((insight) => (
                    <li
                      key={insight}
                      className="rounded-[12px] border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-zinc-400"
                    >
                      {insight}
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
