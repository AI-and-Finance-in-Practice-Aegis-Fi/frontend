import Link from "next/link";

const navItems = ["Resources", "Product", "Pricing", "Solutions"];

const sidebarItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Analytics", href: "/dashboard/analytics" },
  { label: "Policies", href: "/dashboard/policies" },
  { label: "Expenses", href: "/dashboard/expenses" },
  { label: "AI Insights", href: "/dashboard/insights" },
  { label: "Settings", href: "/dashboard/settings" },
];

const kpiCards = [
  { label: "월 지출", value: "8,240,000원", change: "+12%" },
  { label: "활성 구독", value: "128" },
  { label: "예상 절감액", value: "1,840,000원" },
  { label: "위험 알림", value: "7건" },
];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const serviceCosts = [
  { service: "AWS", cost: "142.3만원", share: "42%", change: "+18%" },
  { service: "Slack", cost: "32.2만원", share: "13%", change: "+4%" },
  { service: "Notion", cost: "20만원", share: "8%", change: "-2%" },
  { service: "Figma", cost: "15만원", share: "6%", change: "+1%" },
];

const aiResults = [
  "AWS 비용이 전월 대비 18% 증가했습니다.",
  "중복 SaaS 구독 3건이 발견되었습니다.",
  "연간 약 180만원 절감 가능합니다.",
  "현재 비용 구조는 안정적인 상태입니다.",
];

function MonthlyTrendChart() {
  return (
    <svg className="mt-8 h-72 w-full" fill="none" viewBox="0 0 920 300" aria-hidden="true">
      <path d="M26 58 H890" stroke="#ffffff" strokeOpacity="0.08" />
      <path d="M26 110 H890" stroke="#ffffff" strokeOpacity="0.08" />
      <path d="M26 162 H890" stroke="#ffffff" strokeOpacity="0.08" />
      <path d="M26 214 H890" stroke="#ffffff" strokeOpacity="0.08" />
      <polyline
        points="36,198 120,176 204,190 288,166 372,160 456,190 540,126 624,98 708,126 792,82 876,82"
        stroke="#91a2b8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      {months.map((month, index) => (
        <text
          key={month}
          x={36 + index * 76}
          y="272"
          fill="#8b93a1"
          fontSize="14"
          fontWeight="600"
          textAnchor={index === 0 ? "start" : index === months.length - 1 ? "end" : "middle"}
        >
          {month}
        </text>
      ))}
    </svg>
  );
}

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-[#050608] text-[#f8f8df]">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-4 sm:px-8 lg:px-12">
        <header className="flex h-14 items-center justify-between gap-6">
          <Link href="/" className="text-sm font-bold text-[#fbfbdc]">
            Aegis-Fi
          </Link>
          <nav className="hidden items-center gap-8 text-[11px] font-semibold text-zinc-500 md:flex">
            {navItems.map((item) => (
              <Link
                key={item}
                href={item === "Product" ? "/features" : item === "Solutions" ? "/monitoring" : "#"}
                className="transition hover:text-[#fbfbdc]"
              >
                {item}
              </Link>
            ))}
          </nav>
          <Link
            href="/features"
            className="rounded-full bg-[#8290a2] px-5 py-2.5 text-[11px] font-bold text-white transition hover:bg-[#95a3b6]"
          >
            Request Demo
          </Link>
        </header>

        <div className="grid gap-8 lg:grid-cols-[190px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-white/[0.06] bg-[#111722] p-5 lg:mt-24">
            <Link href="/" className="block text-lg font-bold text-[#fbfbdc]">
              Aegis-Fi
            </Link>
            <nav className="mt-8 grid gap-4 text-xs font-semibold text-zinc-500">
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition hover:text-[#fbfbdc] ${
                    item.href === "/dashboard/analytics" ? "text-[#fbfbdc]" : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          <section className="pb-12 pt-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
              Analytics
            </p>
            <h1 className="mt-5 text-[40px] font-black leading-[1.15] tracking-normal text-[#ffffdf] sm:text-[56px]">
              지출 데이터를
              <br />
              실시간으로 분석하세요
            </h1>
            <p className="mt-6 max-w-[760px] text-base font-medium leading-7 text-zinc-400">
              비용 추이, SaaS 사용 비용, 예산 대비 비용 점유율을 한눈에 파악할 수 있습니다.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {kpiCards.map((card) => (
                <article key={card.label} className="rounded-2xl border border-white/[0.08] bg-[#131a25] p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                    {card.label}
                  </p>
                  <p className="mt-3 text-2xl font-black text-[#fbfbdc]">{card.value}</p>
                  {card.change ? (
                    <p className="mt-2 text-xs font-bold text-[#8290a5]">{card.change}</p>
                  ) : null}
                </article>
              ))}
            </div>

            <article className="mt-8 rounded-2xl border border-white/[0.08] bg-[#131a25] p-6 shadow-2xl shadow-black/40">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-black text-[#fbfbdc]">월별 지출 추이</h2>
                <span className="text-xs font-bold text-zinc-500">최근 12개월</span>
              </div>
              <MonthlyTrendChart />
            </article>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
              <article className="rounded-2xl border border-white/[0.08] bg-[#131a25] p-6 shadow-2xl shadow-black/40">
                <h2 className="text-lg font-black text-[#fbfbdc]">서비스별 비용 분석</h2>
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead className="border-b border-white/[0.08] text-xs text-zinc-500">
                      <tr>
                        <th className="py-3 pr-4 font-semibold">서비스</th>
                        <th className="py-3 pr-4 font-semibold">월 비용</th>
                        <th className="py-3 pr-4 font-semibold">비중</th>
                        <th className="py-3 pr-4 font-semibold">변화율</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceCosts.map((row) => (
                        <tr key={row.service} className="border-b border-white/[0.06] last:border-0">
                          <td className="py-4 pr-4 font-semibold text-zinc-300">{row.service}</td>
                          <td className="py-4 pr-4 text-zinc-400">{row.cost}</td>
                          <td className="py-4 pr-4 text-zinc-400">{row.share}</td>
                          <td className="py-4 pr-4 text-[#8290a5]">{row.change}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>

              <article className="rounded-2xl border border-white/[0.08] bg-[#131a25] p-6 shadow-2xl shadow-black/40">
                <h2 className="text-lg font-black text-[#fbfbdc]">AI 분석 결과</h2>
                <ul className="mt-7 grid gap-5">
                  {aiResults.map((item) => (
                    <li key={item} className="flex gap-3 text-sm font-medium leading-6 text-zinc-400">
                      <span className="mt-2 size-1.5 rounded-full bg-[#8290a5]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
