import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getDashboardSummary, getSaasSubscriptions, formatKRW } from "@/lib/api";

import SaasClient from "./SaasClient";

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

    const deptMap: Record<number, string> = Object.fromEntries(
      summary.department_budgets.map((d) => [d.department_id, d.department_name]),
    );

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

    const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
    const kstLabel = `${kst.getUTCFullYear()}년 ${kst.getUTCMonth() + 1}월 ${kst.getUTCDate()}일 기준`;

    return (
      <DashboardShell
        activeHref="/dashboard/saas"
        title="SaaS 구독 관리"
        description={kstLabel}
      >
        <section className="mt-7 grid gap-4 lg:grid-cols-3">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-[#111722] p-5 shadow-2xl shadow-black/30"
            >
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
            </article>
          ))}
        </section>

        <SaasClient initialSubscriptions={subscriptions} deptMap={deptMap} />
      </DashboardShell>
    );
  } catch {
    return (
      <DashboardShell
        activeHref="/dashboard/saas"
        title="SaaS 구독 관리"
        description="데이터를 불러오는 중 오류가 발생했습니다."
      >
        <p className="mt-8 text-sm text-zinc-500">잠시 후 다시 시도해주세요.</p>
      </DashboardShell>
    );
  }
}
