import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  getSaasSubscriptions,
  getDashboardSummary,
  formatKRW,
  saasUsageRate,
  saasStatus,
} from "@/lib/api";

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

export default async function SaasPage() {
  try {
    const [subscriptions, summary] = await Promise.all([
      getSaasSubscriptions(100),
      getDashboardSummary(),
    ]);

    // Build department_id → name map
    const deptMap = new Map(
      summary.department_budgets.map((d) => [d.department_id, d.department_name]),
    );

    const unusedCount = subscriptions.filter((s) => saasStatus(s) === "미사용").length;
    const renewalCount = subscriptions.filter((s) => saasStatus(s) === "갱신 임박").length;
    const highRiskCount = subscriptions.filter((s) => s.risk_level === "HIGH").length;

    const stats = [
      {
        label: "월 총 구독료",
        value: formatKRW(summary.saas.total_monthly_fee),
        helper: `${subscriptions.length}개 서비스`,
        tone: "bg-rose-300/10 text-rose-200",
        icon: "card",
      },
      {
        label: "절감 가능 추정액",
        value: formatKRW(summary.saas.total_wasted_amount),
        helper: "낭비 비용 추정",
        tone: "bg-cyan-300/10 text-cyan-200",
        icon: "wallet",
      },
      {
        label: "미사용 중복 구독",
        value: `${summary.saas.high_risk_count}개`,
        helper: "즉시 조치 권장",
        tone: "bg-rose-400/10 text-rose-300",
        icon: "alert",
      },
    ];

    const tabs = [
      `전체 (${subscriptions.length})`,
      `미사용 (${unusedCount})`,
      `갱신 임박 (${renewalCount})`,
      `중복 의심 (${highRiskCount})`,
    ];

    // Top AI optimization suggestion: highest wasted amount HIGH risk sub
    const topWasted = [...subscriptions]
      .filter((s) => s.risk_level === "HIGH")
      .sort((a, b) => parseFloat(b.wasted_amount) - parseFloat(a.wasted_amount))[0];

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
                {subscriptions.map((item) => {
                  const usage = saasUsageRate(item);
                  const status = saasStatus(item);
                  const deptName = deptMap.get(item.department_id) ?? `부서 ${item.department_id}`;
                  return (
                    <tr key={item.subscription_id} className="border-b border-white/[0.06] last:border-0">
                      <td className="px-5 py-4 font-semibold text-[#fbfbdc]">{item.subscription_name}</td>
                      <td className="px-4 py-4 text-zinc-400">{deptName}</td>
                      <td className="px-4 py-4 text-zinc-400">{item.total_seats}석</td>
                      <td className="px-4 py-4">
                        <ProgressLine value={usage} />
                      </td>
                      <td className="px-4 py-4 text-zinc-300">{formatKRW(parseFloat(item.monthly_fee))}</td>
                      <td className="px-4 py-4 text-zinc-400">{item.renewal_date}</td>
                      <td className={`px-4 py-4 text-xs font-black ${statusClass(status)}`}>{status}</td>
                      <td className="px-5 py-4 text-right text-lg font-black text-zinc-500">...</td>
                    </tr>
                  );
                })}
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
              {topWasted ? (
                <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
                  {topWasted.subscription_name} {topWasted.total_seats}석 중{" "}
                  {topWasted.total_seats - topWasted.used_seats}석이 미사용 상태입니다.
                  <br />
                  좌석 축소 시 월 {formatKRW(parseFloat(topWasted.wasted_amount))} 절감 가능합니다.
                </p>
              ) : (
                <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
                  현재 고위험 구독이 없습니다. 모든 구독이 효율적으로 사용되고 있습니다.
                </p>
              )}
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
  } catch {
    return (
      <DashboardShell activeHref="/dashboard/saas" title="SaaS 구독 관리" description="데이터를 불러오는 중 오류가 발생했습니다.">
        <p className="mt-8 text-sm text-zinc-500">잠시 후 다시 시도해주세요.</p>
      </DashboardShell>
    );
  }
}
