import Link from "next/link";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DataCard } from "@/components/dashboard/DataCard";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  getDashboardSummary,
  getRecentTransactions,
  getSaasSubscriptions,
  formatKRW,
  formatDate,
  saasUsageRate,
} from "@/lib/api";

function statusClass(status: string) {
  if (status === "정상") return "text-emerald-400";
  if (status === "검토 중") return "text-amber-200";
  return "text-rose-300";
}

function approvalStatus(isApproved: boolean | null): string {
  if (isApproved === true) return "정상";
  if (isApproved === false) return "위반 감지";
  return "검토 중";
}

export default async function DashboardPage() {
  try {
    const [summary, recentTransactions, subscriptions] = await Promise.all([
      getDashboardSummary(),
      getRecentTransactions(5),
      getSaasSubscriptions(100),
    ]);

    const totalSpending = summary.department_budgets.reduce(
      (sum, d) => sum + d.current_spending,
      0,
    );

    const stats = [
      {
        label: "이번 누적 결제액",
        value: "₩" + Math.round(totalSpending).toLocaleString("ko-KR"),
        helper: "월 누적 집계",
      },
      {
        label: "활성 SaaS 구독",
        value: `${subscriptions.length}개`,
        helper: "운영 중인 구독",
      },
      {
        label: "이번 카드 결제",
        value: formatKRW(summary.today.total_spending),
        helper: "오늘 집계",
      },
      {
        label: "정책 위반 알림",
        value: `${summary.pending_approval_count}건`,
        helper: "주의 필요",
      },
    ];

    const payments = recentTransactions.map((t) => ({
      employee: t.employee_name,
      department: t.department_name,
      merchant: t.merchant_name,
      amount: formatKRW(t.amount),
      status: approvalStatus(t.is_approved),
      key: `${t.transaction_id}`,
    }));

    const alerts: Array<{ title: string; description: string; time: string; dot: string }> = [];
    if (summary.pending_approval_count > 0) {
      alerts.push({
        title: "정책 위반 결제 감지",
        description: `승인 대기 ${summary.pending_approval_count}건`,
        time: "최근",
        dot: "bg-[#f1d9df] shadow-[0_0_12px_rgba(241,217,223,0.75)]",
      });
    }
    if (summary.saas.ghost_account_count > 0) {
      alerts.push({
        title: `미사용 SaaS ${summary.saas.ghost_account_count}개 감지`,
        description: "45일+ 미접속 계정 포함",
        time: "최근",
        dot: "bg-[#8fc5d4] shadow-[0_0_12px_rgba(143,197,212,0.7)]",
      });
    }
    if (summary.saas.total_wasted_amount > 0) {
      alerts.push({
        title: "AI 최적화 리포트",
        description: `약 ${formatKRW(summary.saas.total_wasted_amount)} 절감 가능`,
        time: "최근",
        dot: "bg-[#9aa7e8] shadow-[0_0_12px_rgba(154,167,232,0.7)]",
      });
    }

    const saasUsage = [...subscriptions]
      .sort((a, b) => saasUsageRate(b) - saasUsageRate(a))
      .slice(0, 5)
      .map((sub) => ({
        label: sub.subscription_name,
        value: saasUsageRate(sub),
      }));

    const budgets = [...summary.department_budgets]
      .sort((a, b) => b.spend_rate - a.spend_rate)
      .slice(0, 5)
      .map((d) => ({
        label: d.department_name,
        value: Math.round(d.spend_rate * 100),
      }));

    return (
      <DashboardShell
        activeHref="/dashboard"
        title="대시보드"
        description="2026년 6월 13일 기준"
      >
        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]">
          <DataCard
            title="최근 결제 내역"
            action={
              <Link href="/dashboard/expenses" className="text-xs font-bold text-[#8290a5]">
                전체 보기 →
              </Link>
            }
          >
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="border-y border-white/10 text-xs text-zinc-500">
                  <tr>
                    <th className="py-3 pr-4 font-semibold">직원/부서</th>
                    <th className="py-3 pr-4 font-semibold">가맹점</th>
                    <th className="py-3 pr-4 text-right font-semibold">금액</th>
                    <th className="py-3 pl-6 pr-2 text-right font-semibold">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.key}
                      className="border-b border-white/10 last:border-0"
                    >
                      <td className="py-4 pr-4">
                        <span className="block text-[13px] font-black leading-5 text-[#fbfbdc]">
                          {payment.employee}
                        </span>
                        <span className="mt-1 block text-[11px] font-semibold leading-4 text-zinc-600">
                          {payment.department}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-[13px] font-black text-zinc-200">{payment.merchant}</td>
                      <td className="py-4 pr-4 text-right text-[13px] font-bold text-zinc-200">{payment.amount}</td>
                      <td className="py-4 pl-6 pr-2 text-right">
                        <span className={`text-[12px] font-black ${statusClass(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataCard>

          <DataCard title="알림" className="flex min-h-[330px] flex-col">
            <ul className="mt-4 border-t border-white/10">
              {alerts.map((alert) => (
                <li
                  key={alert.title}
                  className="grid grid-cols-[14px_minmax(0,1fr)_62px] gap-3 border-b border-white/10 py-4"
                >
                  <span className={`mt-1.5 size-2 rounded-full ${alert.dot}`} />
                  <span>
                    <span className="block text-[13px] font-black leading-5 text-[#fbfbdc]">
                      {alert.title}
                    </span>
                    <span className="mt-1 block text-[11px] font-semibold leading-5 text-zinc-500">
                      {alert.description}
                    </span>
                  </span>
                  <span className="pt-1 text-right text-xs font-semibold text-zinc-500">{alert.time}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard/alerts"
              className="mt-auto inline-block pt-7 text-xs font-bold text-[#9aa7e8] transition hover:text-white"
            >
              모든 알림 보기 →
            </Link>
          </DataCard>
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-2">
          <DataCard title="SaaS 사용량 상위 항목">
            <div className="mt-6 grid gap-5">
              {saasUsage.map((item) => (
                <ProgressBar key={item.label} {...item} />
              ))}
            </div>
          </DataCard>

          <DataCard title="부서별 예산 소진율">
            <div className="mt-6 grid gap-5">
              {budgets.map((item) => (
                <ProgressBar key={item.label} {...item} />
              ))}
            </div>
          </DataCard>
        </section>
      </DashboardShell>
    );
  } catch {
    return (
      <DashboardShell activeHref="/dashboard" title="대시보드" description="데이터를 불러오는 중 오류가 발생했습니다.">
        <p className="mt-8 text-sm text-zinc-500">잠시 후 다시 시도해주세요.</p>
      </DashboardShell>
    );
  }
}
