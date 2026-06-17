import { DashboardShell } from "@/components/dashboard/DashboardShell";

const stats = [
  {
    label: "월 총 구독료",
    value: "₩3,840,000",
    helper: "47개 서비스",
    tone: "bg-rose-300/10 text-rose-200",
    icon: "card",
  },
  {
    label: "절감 가능 추정액",
    value: "₩860,000",
    helper: "22.4% 절감 가능",
    tone: "bg-cyan-300/10 text-cyan-200",
    icon: "wallet",
  },
  {
    label: "미사용 중복 구독",
    value: "9개",
    helper: "즉시 조치 권장",
    tone: "bg-rose-400/10 text-rose-300",
    icon: "alert",
  },
];

const tabs = ["전체 (47)", "미사용 (9)", "갱신 임박 (4)", "중복 의심 (2)"];

const subscriptions = [
  {
    service: "Slack",
    department: "전사",
    seats: "200석",
    usage: 88,
    fee: "4,800,000",
    renewal: "2025-7-28",
    status: "정상",
  },
  {
    service: "Salesforce",
    department: "영업팀",
    seats: "40석",
    usage: 18,
    fee: "9,600,000",
    renewal: "2025-7-28",
    status: "미사용",
  },
  {
    service: "Zoom",
    department: "전사",
    seats: "180석",
    usage: 34,
    fee: "3,200,000",
    renewal: "2025-7-28",
    status: "갱신 임박",
  },
  {
    service: "Notion",
    department: "전사",
    seats: "120석",
    usage: 72,
    fee: "1,440,000",
    renewal: "2025-7-28",
    status: "정상",
  },
  {
    service: "Adobe CC",
    department: "디자인팀",
    seats: "20석",
    usage: 60,
    fee: "1,280,000",
    renewal: "2025-7-28",
    status: "정상",
  },
];

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article className={`rounded-2xl border border-white/10 bg-[#111722] shadow-2xl shadow-black/30 ${className}`}>
      {children}
    </article>
  );
}

function ProgressLine({ value }: { value: number }) {
  let color = "bg-blue-300";

  if (value >= 80) color = "bg-rose-200";
  else if (value >= 60) color = "bg-orange-300";
  else if (value >= 40) color = "bg-emerald-300";

  return (
    <div className="flex min-w-[130px] items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-700/70">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="w-8 text-right text-[11px] font-semibold text-zinc-500">{value}%</span>
    </div>
  );
}

function statusClass(status: string) {
  if (status === "미사용") return "text-rose-300";
  if (status === "갱신 임박") return "text-amber-200";
  return "text-[#fbfbdc]";
}

function StatIcon({ type }: { type: string }) {
  if (type === "wallet") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <rect x="4" y="7" width="16" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M16 12h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (type === "alert") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <path
          d="M12 4.5 21 20H3L12 4.5Z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path d="M12 9v5M12 17h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <rect x="4" y="6" width="16" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 10h16" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default function SaasPage() {
  return (
    <DashboardShell
      activeHref="/dashboard/saas"
      title="SaaS 구독 관리"
      description="2026년 6월 13일 기준"
    >
      <section className="mt-7 grid gap-4 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-start gap-4">
              <span className={`flex size-10 items-center justify-center rounded-xl ${stat.tone}`}>
                <StatIcon type={stat.icon} />
              </span>
              <div>
                <p className="text-xs font-bold text-zinc-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-black text-[#fbfbdc]">{stat.value}</p>
                <p className="mt-2 text-xs font-semibold text-[#8290a5]">{stat.helper}</p>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          className="rounded-lg border border-white/10 bg-[#111722] px-4 py-2 text-xs font-bold text-zinc-300 transition hover:bg-white/5"
        >
          CSV 내보내기
        </button>
        <button
          type="button"
          className="rounded-lg bg-[#f1d9df] px-4 py-2 text-xs font-black text-[#130b10] transition hover:bg-[#f7e6eb]"
        >
          + 구독 추가
        </button>
      </div>

      <nav className="mt-7 flex gap-8 border-b border-white/10 text-sm font-bold">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            type="button"
            className={`pb-3 transition ${
              index === 0
                ? "border-b border-[#fbfbdc] text-[#fbfbdc]"
                : "border-b border-transparent text-zinc-500 hover:text-zinc-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-white/[0.08] text-xs text-zinc-500">
              <tr>
                <th className="px-5 py-4 font-semibold">서비스명</th>
                <th className="px-4 py-4 font-semibold">담당 부서</th>
                <th className="px-4 py-4 font-semibold">좌석 수</th>
                <th className="px-4 py-4 font-semibold">사용률</th>
                <th className="px-4 py-4 font-semibold">월 구독료</th>
                <th className="px-4 py-4 font-semibold">갱신일</th>
                <th className="px-4 py-4 font-semibold">상태</th>
                <th className="px-5 py-4 text-right font-semibold">관리</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((item) => (
                <tr key={item.service} className="border-b border-white/[0.06] last:border-0">
                  <td className="px-5 py-4 font-semibold text-[#fbfbdc]">{item.service}</td>
                  <td className="px-4 py-4 text-zinc-400">{item.department}</td>
                  <td className="px-4 py-4 text-zinc-400">{item.seats}</td>
                  <td className="px-4 py-4">
                    <ProgressLine value={item.usage} />
                  </td>
                  <td className="px-4 py-4 text-zinc-300">{item.fee}</td>
                  <td className="px-4 py-4 text-zinc-400">{item.renewal}</td>
                  <td className={`px-4 py-4 text-xs font-black ${statusClass(item.status)}`}>{item.status}</td>
                  <td className="px-5 py-4 text-right text-lg font-black text-zinc-500">...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-5 p-6">
        <div className="grid gap-5 sm:grid-cols-[64px_minmax(0,1fr)] sm:items-start">
          <div className="flex size-14 items-center justify-center rounded-full bg-[#7aa0aa]/30 text-[#dbeef2]">
            <svg viewBox="0 0 24 24" className="size-7" aria-hidden="true">
              <path d="M12 3v5M12 16v5M3 12h5M16 12h5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
              <path d="m6.5 6.5 3.5 3.5M14 14l3.5 3.5M17.5 6.5 14 10M10 14l-3.5 3.5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-black text-[#fbfbdc]">AI 최적화 제안</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
              Salesforce 80석 중 65석이 30일 이상 미사용 상태입니다.
              <br />
              15석으로 다운그레이드 시 월 7,200,000원, 연간 86,400,000원 절감 가능합니다.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-lg bg-[#f1d9df] px-5 py-2.5 text-xs font-black text-[#130b10] transition hover:bg-[#f7e6eb]"
              >
                적용하기
              </button>
              <button
                type="button"
                className="rounded-lg border border-white/10 px-5 py-2.5 text-xs font-bold text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                나중에
              </button>
            </div>
          </div>
        </div>
      </Card>
    </DashboardShell>
  );
}
