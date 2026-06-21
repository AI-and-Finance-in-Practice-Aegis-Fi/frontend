import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  getPendingApprovals,
  getDashboardSummary,
  formatKRW,
  formatDate,
} from "@/lib/api";

import AlertsClient, { type AlertItem } from "./AlertsClient";

function StatCard({ label, value, helper, icon, color }: {
  label: string;
  value: string;
  helper: string;
  icon: string;
  color: string;
}) {
  return (
    <article className="min-h-[112px] rounded-2xl border border-white/10 bg-[#111722] px-5 py-4 shadow-2xl shadow-black/30">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-full border border-white/10 bg-white/10 text-[11px] font-black text-slate-300">
          {icon}
        </span>
        <p className="text-xs font-bold text-slate-400">{label}</p>
      </div>
      <p className={`mt-2 text-[28px] font-black leading-none ${color}`}>{value}</p>
      <p className="mt-4 text-xs font-semibold text-slate-500">{helper}</p>
    </article>
  );
}

export default async function AlertsPage() {
  try {
    const [pendingApprovals, summary] = await Promise.all([
      getPendingApprovals(),
      getDashboardSummary(),
    ]);

    const alerts: AlertItem[] = [];

    for (const approval of pendingApprovals) {
      alerts.push({
        icon: "shield",
        title: "승인 대기 결제 감지",
        description: `${approval.employee_name} · ${approval.department_name} · ${approval.merchant_name} (${formatKRW(approval.amount)})`,
        time: formatDate(approval.requested_at),
        type: "danger",
      });
    }

    if (summary.saas.ghost_account_count > 0) {
      alerts.push({
        icon: "warning",
        title: `미사용 SaaS ${summary.saas.ghost_account_count}개 감지`,
        description: "45일+ 미접속 계정 포함",
        time: "최근",
        type: "caution",
      });
    }

    const nearLimitDepts = summary.department_budgets.filter((d) => d.spend_rate > 0.8);
    for (const dept of nearLimitDepts) {
      alerts.push({
        icon: "card",
        title: "법인카드 한도 근접",
        description: `${dept.department_name} · 월 한도 ${Math.round(dept.spend_rate * 100)}% 사용`,
        time: "최근",
        type: "caution",
      });
    }

    const dangerCount = pendingApprovals.length;
    const cautionCount = nearLimitDepts.length + (summary.saas.ghost_account_count > 0 ? 1 : 0);
    const infoCount = Math.max(0, alerts.length - dangerCount - cautionCount);
    const totalCount = alerts.length;

    const stats = [
      { label: "전체 알림", value: `${totalCount}건`, helper: "오늘 발생", icon: "i", color: "text-[#fbd5d9]" },
      { label: "위험 알림", value: `${dangerCount}건`, helper: "즉시 확인 필요", icon: "△", color: "text-[#61a4bc]" },
      { label: "주의 알림", value: `${cautionCount}건`, helper: "검토 권장", icon: "i", color: "text-[#7b93c9]" },
      { label: "정보 알림", value: `${infoCount}건`, helper: "참고 사항", icon: "✓", color: "text-[#ffffe3]" },
    ];

    const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
    const kstLabel = `${kst.getUTCFullYear()}년 ${kst.getUTCMonth() + 1}월 ${kst.getUTCDate()}일 기준`;

    return (
      <DashboardShell
        activeHref="/dashboard/alerts"
        title="알림 센터"
        description={kstLabel}
      >
        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>

        <AlertsClient alerts={alerts} />
      </DashboardShell>
    );
  } catch {
    return (
      <DashboardShell activeHref="/dashboard/alerts" title="알림 센터" description="데이터를 불러오는 중 오류가 발생했습니다.">
        <p className="mt-8 text-sm text-zinc-500">잠시 후 다시 시도해주세요.</p>
      </DashboardShell>
    );
  }
}
