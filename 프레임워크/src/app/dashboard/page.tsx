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
  { label: "Active Policies", value: "128", change: "+12%" },
  { label: "Risk Alerts", value: "24", change: "+12%" },
];

const payments = [
  { employee: "김민준", service: "AWS", amount: "12,400,000원", status: "정상" },
  { employee: "이수현", service: "Slack", amount: "320,000원", status: "정상" },
  { employee: "최서윤", service: "GS25", amount: "580,000원", status: "검토중" },
  { employee: "박지훈", service: "Notion", amount: "180,000원", status: "정상" },
  { employee: "이지우", service: "Adobe", amount: "650,000원", status: "위반감지" },
];

const violations = [
  { label: "AWS 예산 초과", level: "해결", tone: "bg-emerald-400" },
  { label: "SaaS 중복 결제", level: "경고", tone: "bg-amber-300" },
  { label: "승인되지 않은 결제", level: "위험", tone: "bg-rose-400" },
  { label: "정책 미준수 결제", level: "해결", tone: "bg-emerald-400" },
];

const saasUsage = [
  { label: "Slack", value: 86 },
  { label: "Notion", value: 72 },
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

const activities = [
  { label: "정책 위반 결제가 감지되었습니다", time: "1분 전" },
  { label: "AWS 비용이 18% 증가했습니다", time: "12분 전" },
  { label: "새로운 SaaS 구독이 추가되었습니다", time: "34분 전" },
  { label: "AI 최적화 리포트가 생성되었습니다", time: "1시간 전" },
];

const insights = [
  "중복 SaaS 구독 3건 발견",
  "AWS 비용 18% 증가",
  "미사용 라이선스 감지",
];

function statusClass(status: string) {
  if (status === "정상") {
    return "bg-emerald-400/10 text-emerald-300";
  }

  if (status === "검토중") {
    return "bg-amber-300/10 text-amber-200";
  }

  return "bg-rose-400/10 text-rose-300";
}

function SpendChart() {
  return (
    <svg
      className="mt-8 h-[260px] w-full overflow-visible"
      fill="none"
      viewBox="0 0 760 260"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="spendLine" x1="74" x2="612" y1="204" y2="48">
          <stop stopColor="#708098" stopOpacity="0.8" />
          <stop offset="1" stopColor="#a9b8ca" />
        </linearGradient>
        <radialGradient id="spendGlow" cx="0" cy="0" r="1">
          <stop stopColor="#c4ceda" stopOpacity="0.9" />
          <stop offset="1" stopColor="#8290a5" stopOpacity="0" />
        </radialGradient>
        <filter
          id="pointGlow"
          x="-40%"
          y="-40%"
          width="180%"
          height="180%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M58 205 L164 190 L286 152 L414 106 L528 48"
        stroke="url(#spendLine)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <circle cx="528" cy="48" r="22" fill="url(#spendGlow)" filter="url(#pointGlow)" />
      <circle cx="528" cy="48" r="4.5" fill="#b2c0d0" />
    </svg>
  );
}

function getProgressColor(value: number) {
  if (value >= 80) return "bg-red-400";
  if (value >= 60) return "bg-orange-400";
  if (value >= 40) return "bg-emerald-400";
  return "bg-blue-400";
}

function ProgressBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const color = getProgressColor(value);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-xs font-semibold">
        <span className="text-zinc-400">{label}</span>
        <span className="text-[#fbfbdc]">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/8">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#050608] text-[#f8f8df]">
      <section className="mx-auto w-full max-w-[1280px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="max-w-[760px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
            Dashboard
          </p>
          <h1 className="mt-8 text-[42px] font-black leading-[1.28] tracking-normal text-[#ffffdf] sm:text-[58px] lg:text-[66px]">
            복잡한 금융 운영을
            <br />
            하나의 화면에서 관리하세요
          </h1>
          <p className="mt-7 max-w-[660px] text-base font-medium leading-8 text-zinc-400 sm:text-lg">
            결제 내역, 정책 위반, 실시간 비용 분석,
            <br className="hidden sm:block" />
            AI 인사이트를 하나의 대시보드에서 확인할 수 있습니다.
          </p>
        </div>

        <section className="mt-12 grid overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0e131c] shadow-2xl shadow-black/60 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="border-b border-white/[0.06] bg-[#131a25] p-6 lg:min-h-[560px] lg:border-b-0 lg:border-r">
            <Link href="/" className="block text-xl font-bold tracking-normal text-[#fbfbdc]">
              Aegis-Fi
            </Link>
            <nav className="mt-10 grid gap-4 text-xs font-semibold text-zinc-500">
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition hover:text-[#fbfbdc]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          <div className="p-5 sm:p-7 lg:p-8">
            <div className="grid gap-4 md:grid-cols-3">
              {kpiCards.map((card) => (
                <article
                  key={card.label}
                  className="rounded-2xl border border-white/[0.08] bg-[#151c27] p-5 shadow-xl shadow-black/30"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    {card.label}
                  </p>
                  <p className="mt-3 text-3xl font-black leading-none text-[#fbfbdc]">
                    {card.value}
                  </p>
                  <p className="mt-4 text-xs font-bold text-[#8290a5]">
                    {card.change}
                  </p>
                </article>
              ))}
            </div>

            <article className="mt-5 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#131a25] px-6 py-6 shadow-2xl shadow-black/40">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-sm font-bold tracking-[0.12em] text-[#fbfbdc]">
                  Monthly Spend Analytics
                </h2>
                <span className="text-xs font-bold text-[#8290a5]">+18.2%</span>
              </div>
              <SpendChart />
            </article>
          </div>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-2xl border border-white/[0.08] bg-[#131a25] p-6 shadow-2xl shadow-black/40 xl:col-span-2">
            <h2 className="text-lg font-black text-[#fbfbdc]">최근 결제 내역</h2>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="border-b border-white/[0.08] text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="py-3 pr-4 font-semibold">직원</th>
                    <th className="py-3 pr-4 font-semibold">서비스</th>
                    <th className="py-3 pr-4 font-semibold">금액</th>
                    <th className="py-3 pr-4 font-semibold">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={`${payment.employee}-${payment.service}`} className="border-b border-white/[0.06] last:border-0">
                      <td className="py-4 pr-4 font-semibold text-zinc-200">{payment.employee}</td>
                      <td className="py-4 pr-4 text-zinc-400">{payment.service}</td>
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

          <article className="rounded-2xl border border-white/[0.08] bg-[#131a25] p-6 shadow-2xl shadow-black/40">
            <h2 className="text-lg font-black text-[#fbfbdc]">정책 위반 결제 감지</h2>
            <div className="mt-6 grid gap-4">
              {violations.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 rounded-xl bg-black/15 px-4 py-3">
                  <span className="flex items-center gap-3 text-sm font-semibold text-zinc-300">
                    <span className={`size-2 rounded-full ${item.tone}`} />
                    {item.label}
                  </span>
                  <span className="text-xs font-bold text-[#8290a5]">{item.level}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-white/[0.08] bg-[#131a25] p-6 shadow-2xl shadow-black/40">
            <h2 className="text-lg font-black text-[#fbfbdc]">SaaS 사용량 상위 항목</h2>
            <div className="mt-6 grid gap-5">
              {saasUsage.map((item) => (
                <ProgressBar key={item.label} {...item} />
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-white/[0.08] bg-[#131a25] p-6 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-black text-[#fbfbdc]">부서별 예산 소진율</h2>
              <span className="text-xs font-bold text-[#8290a5]">실시간 지출</span>
            </div>
            <div className="mt-6 grid gap-5">
              {budgets.map((item) => (
                <ProgressBar key={item.label} {...item} />
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-white/[0.08] bg-[#131a25] p-6 shadow-2xl shadow-black/40">
            <h2 className="text-lg font-black text-[#fbfbdc]">실시간 활동</h2>
            <ul className="mt-6 grid gap-5">
              {activities.map((activity) => (
                <li key={activity.label} className="flex items-center justify-between gap-4 text-xs">
                  <span className="flex items-center gap-3 font-medium text-zinc-400">
                    <span className="size-1.5 rounded-full bg-rose-400" />
                    {activity.label}
                  </span>
                  <span className="shrink-0 text-zinc-600">{activity.time}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-white/[0.08] bg-[#131a25] p-6 shadow-2xl shadow-black/40">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8290a5]">
              AI Insights
            </p>
            <h2 className="mt-5 text-2xl font-black leading-snug text-[#fbfbdc]">
              이번 달 비용 이상 패턴이
              <br />
              감지되었습니다
            </h2>
            <ul className="mt-7 grid gap-3">
              {insights.map((insight) => (
                <li key={insight} className="text-xs font-medium text-zinc-400">
                  + {insight}
                </li>
              ))}
            </ul>
          </article>
        </section>
      </section>
    </main>
  );
}
