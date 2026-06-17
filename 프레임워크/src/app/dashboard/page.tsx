import Link from "next/link";

const sidebarItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Analytics", href: "/dashboard/analytics" },
  { label: "Policies", href: "/dashboard/policies" },
  { label: "SaaS 구독 관리", href: "/dashboard/expenses" },
  { label: "AI Insights", href: "/dashboard/insights" },
  { label: "Settings", href: "/dashboard/settings" },
];

const kpiCards = [
  { label: "이번 달 총 지출", value: "₩248,400,000", change: "이번달 +12%" },
  { label: "활성 SaaS 구독", value: "47개", change: "지난달 대비 +8%" },
  { label: "예상 절감액", value: "₩1,240,000", change: "절감 가능성 +6%" },
  { label: "정책 위반 알림", value: "3건", change: "주의 필요" },
];

const payments = [
  { service: "AWS", category: "클라우드", amount: "12,400,000원", status: "정상" },
  { service: "Slack", category: "SaaS 구독", amount: "320,000원", status: "정상" },
  { service: "GS25", category: "편의점", amount: "56,000원", status: "검토중" },
  { service: "Notion", category: "SaaS 구독", amount: "180,000원", status: "정상" },
  { service: "Adobe", category: "디자인 툴", amount: "650,000원", status: "위반" },
];

const alerts = [
  { label: "정책 위반 감지", time: "방금" },
  { label: "예산 SaaS 초과", time: "14분 전" },
  { label: "소프트웨어 비용 증가", time: "34분 전" },
];

const saasUsage = [
  { label: "Slack", value: 88 },
  { label: "Notion", value: 73 },
  { label: "Figma", value: 60 },
  { label: "Zoom", value: 34 },
  { label: "Salesforce", value: 18 },
];

const budgets = [
  { label: "마케팅팀", value: 92 },
  { label: "개발팀", value: 78 },
  { label: "기획팀", value: 55 },
  { label: "인사팀", value: 41 },
  { label: "재무팀", value: 29 },
];

const productLinks = ["Features", "Analytics", "AI Insights", "Pricing"];
const companyLinks = ["About", "Contact", "Security", "Careers"];

function statusClass(status: string) {
  if (status === "정상") return "bg-emerald-400/10 text-emerald-300";
  if (status === "검토중") return "bg-amber-300/10 text-amber-200";
  return "bg-rose-400/10 text-rose-300";
}

function getProgressColor(value: number) {
  if (value >= 80) return "bg-red-400";
  if (value >= 60) return "bg-orange-400";
  if (value >= 40) return "bg-emerald-400";
  return "bg-blue-400";
}

function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-xs font-semibold">
        <span className="text-zinc-400">{label}</span>
        <span className="text-[#fbfbdc]">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-700/70">
        <div
          className={`h-full rounded-full ${getProgressColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#050608] text-[#f8f8df]">
      <div className="mx-auto grid min-h-screen w-full max-w-[1440px] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-white/[0.06] bg-[#0b1020] px-6 py-7 lg:border-b-0 lg:border-r">
          <Link href="/" className="block text-xl font-black tracking-normal text-[#fbfbdc]">
            Aegis-Fi
          </Link>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-600">
            AI CFO Platform
          </p>

          <div className="mt-8 h-px bg-white/[0.08]" />

          <nav className="mt-8 grid gap-2 text-sm font-semibold">
            {sidebarItems.map((item) => {
              const active = item.href === "/dashboard";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-4 py-3 transition ${
                    active
                      ? "bg-[#141b2b] text-[#fbfbdc]"
                      : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="bg-[#070a10]">
          <div className="px-5 py-6 sm:px-8 lg:px-10">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-black text-[#fbfbdc]">대시보드</h1>
                <p className="mt-2 text-sm font-medium text-zinc-500">
                  CFO님을 위한 AI 재무 운영 콘솔입니다.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-white/[0.08] bg-[#111722] px-4 py-2 text-xs font-bold text-zinc-300 transition hover:bg-[#151d2a]"
                >
                  데이터 동기화
                </button>
                <div className="flex size-10 items-center justify-center rounded-lg border border-white/[0.08] bg-[#111722] text-xs text-zinc-400">
                  검색
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg border border-white/[0.08] bg-[#111722] text-xs text-zinc-400">
                  알림
                </div>
              </div>
            </header>

            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {kpiCards.map((card) => (
                <article
                  key={card.label}
                  className="rounded-2xl border border-white/[0.08] bg-[#141b27] p-5 shadow-xl shadow-black/30"
                >
                  <p className="text-xs font-bold text-zinc-500">{card.label}</p>
                  <p className="mt-3 text-2xl font-black text-[#fbfbdc]">{card.value}</p>
                  <p className="mt-3 text-xs font-semibold text-[#8290a5]">{card.change}</p>
                </article>
              ))}
            </section>

            <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
              <article className="rounded-2xl border border-white/[0.08] bg-[#111722] p-5 shadow-2xl shadow-black/40">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-black text-[#fbfbdc]">최근 결제 내역</h2>
                  <Link href="/dashboard/analytics" className="text-xs font-bold text-[#8290a5]">
                    전체 보기 →
                  </Link>
                </div>
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead className="border-b border-white/[0.08] text-xs text-zinc-500">
                      <tr>
                        <th className="py-3 pr-4 font-semibold">서비스</th>
                        <th className="py-3 pr-4 font-semibold">카테고리</th>
                        <th className="py-3 pr-4 font-semibold">금액</th>
                        <th className="py-3 pr-4 font-semibold">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr
                          key={`${payment.service}-${payment.amount}`}
                          className="border-b border-white/[0.06] last:border-0"
                        >
                          <td className="py-4 pr-4 font-semibold text-zinc-200">{payment.service}</td>
                          <td className="py-4 pr-4 text-zinc-500">{payment.category}</td>
                          <td className="py-4 pr-4 text-zinc-300">{payment.amount}</td>
                          <td className="py-4 pr-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(payment.status)}`}>
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>

              <article className="rounded-2xl border border-white/[0.08] bg-[#111722] p-5 shadow-2xl shadow-black/40">
                <h2 className="text-lg font-black text-[#fbfbdc]">알림</h2>
                <ul className="mt-5 grid gap-5">
                  {alerts.map((alert) => (
                    <li key={alert.label} className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-3 text-sm font-semibold text-zinc-300">
                        <span className="size-2 rounded-full bg-[#8290a5]" />
                        {alert.label}
                      </span>
                      <span className="text-xs font-medium text-zinc-600">{alert.time}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard/policies" className="mt-8 inline-block text-xs font-bold text-[#8290a5]">
                  모든 알림 보기 →
                </Link>
              </article>
            </section>

            <section className="mt-6 grid gap-5 xl:grid-cols-2">
              <article className="rounded-2xl border border-white/[0.08] bg-[#111722] p-5 shadow-2xl shadow-black/40">
                <h2 className="text-lg font-black text-[#fbfbdc]">SaaS 사용량 상위 항목</h2>
                <div className="mt-6 grid gap-5">
                  {saasUsage.map((item) => (
                    <ProgressBar key={item.label} {...item} />
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-white/[0.08] bg-[#111722] p-5 shadow-2xl shadow-black/40">
                <h2 className="text-lg font-black text-[#fbfbdc]">부서별 예산 소진율</h2>
                <div className="mt-6 grid gap-5">
                  {budgets.map((item) => (
                    <ProgressBar key={item.label} {...item} />
                  ))}
                </div>
              </article>
            </section>
          </div>

          <footer className="mt-8 border-t border-white/[0.08] bg-[#050608] px-5 py-10 sm:px-8 lg:px-10">
            <div className="grid gap-10 lg:grid-cols-[1fr_0.6fr]">
              <div>
                <h2 className="text-2xl font-black tracking-[0.08em] text-[#fbfbdc]">Aegis-Fi</h2>
                <p className="mt-6 max-w-md text-sm leading-7 text-zinc-500">
                  AI-powered financial operations platform
                  <br />
                  for modern enterprise teams.
                </p>
              </div>
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <h3 className="text-xs font-bold text-[#fbfbdc]">Product</h3>
                  <div className="mt-4 grid gap-2 text-sm text-zinc-500">
                    {productLinks.map((item) => (
                      <a key={item} href="#" className="hover:text-[#fbfbdc]">
                        {item}
                      </a>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#fbfbdc]">Company</h3>
                  <div className="mt-4 grid gap-2 text-sm text-zinc-500">
                    {companyLinks.map((item) => (
                      <a key={item} href="#" className="hover:text-[#fbfbdc]">
                        {item}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 border-t border-white/20 pt-4">
              <p className="text-xs text-zinc-600">© 2026 Aegis-Fi. All rights reserved.</p>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
}
