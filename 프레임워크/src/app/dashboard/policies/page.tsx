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
  { label: "전체 위반 건수", value: "24건" },
  { label: "위험 대응", value: "17건" },
  { label: "미해결", value: "7건" },
  { label: "이번 주 신규", value: "3건" },
];

const violations = [
  {
    type: "중복구독",
    service: "Slack",
    date: "2026.06.01",
    severity: "중간",
    status: "검토중",
  },
  {
    type: "허가되지 않은 사용",
    service: "Notion",
    date: "2026.06.03",
    severity: "높음",
    status: "미해결",
  },
  {
    type: "예산 초과",
    service: "AWS",
    date: "2026.06.05",
    severity: "높음",
    status: "미해결",
  },
  {
    type: "비정상 결제",
    service: "Figma",
    date: "2026.06.06",
    severity: "낮음",
    status: "해결완료",
  },
];

function severityClass(severity: string) {
  if (severity === "높음") return "text-orange-300";
  if (severity === "중간") return "text-amber-200";
  return "text-emerald-300";
}

function statusClass(status: string) {
  if (status === "미해결") return "text-rose-300";
  if (status === "검토중") return "text-amber-200";
  return "text-emerald-300";
}

export default function PoliciesPage() {
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
                    item.href === "/dashboard/policies" ? "text-[#fbfbdc]" : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          <section className="pb-14 pt-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
              Policy Violations
            </p>
            <h1 className="mt-5 text-[40px] font-black leading-[1.15] tracking-normal text-[#ffffdf] sm:text-[56px]">
              정책 위반 상황을
              <br />
              실시간으로 추적하세요
            </h1>
            <p className="mt-6 max-w-[620px] text-base font-medium leading-7 text-zinc-400">
              비정상 지출, 중복 구독,
              <br />
              승인되지 않은 SaaS 사용을 감지합니다.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {kpiCards.map((card) => (
                <article
                  key={card.label}
                  className="rounded-2xl border border-white/[0.08] bg-[#131a25] p-6 shadow-xl shadow-black/30"
                >
                  <p className="text-[10px] font-bold tracking-[0.14em] text-zinc-500">
                    {card.label}
                  </p>
                  <p className="mt-5 text-3xl font-black text-[#fbfbdc]">
                    {card.value}
                  </p>
                </article>
              ))}
            </div>

            <article className="mt-10 rounded-2xl border border-white/[0.08] bg-[#131a25] p-6 shadow-2xl shadow-black/40 sm:p-8">
              <h2 className="text-lg font-black text-[#fbfbdc]">위반 내역</h2>
              <div className="mt-8 overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-white/[0.08] text-xs text-zinc-500">
                    <tr>
                      <th className="py-4 pr-6 font-semibold">유형</th>
                      <th className="py-4 pr-6 font-semibold">서비스</th>
                      <th className="py-4 pr-6 font-semibold">발생일</th>
                      <th className="py-4 pr-6 font-semibold">심각도</th>
                      <th className="py-4 pr-6 font-semibold">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {violations.map((item) => (
                      <tr
                        key={`${item.type}-${item.service}`}
                        className="border-b border-white/[0.06] last:border-0"
                      >
                        <td className="py-6 pr-6 font-semibold text-zinc-200">{item.type}</td>
                        <td className="py-6 pr-6 font-semibold text-zinc-300">{item.service}</td>
                        <td className="py-6 pr-6 font-semibold text-zinc-400">{item.date}</td>
                        <td className={`py-6 pr-6 font-bold ${severityClass(item.severity)}`}>
                          {item.severity}
                        </td>
                        <td className={`py-6 pr-6 font-bold ${statusClass(item.status)}`}>
                          {item.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        </div>
      </div>
    </main>
  );
}
