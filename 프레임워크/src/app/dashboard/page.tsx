import Link from "next/link";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DataCard } from "@/components/dashboard/DataCard";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { StatCard } from "@/components/dashboard/StatCard";

const stats = [
  { label: "이번 누적 결제액", value: "₩24,840,000", helper: "전월 대비 +12%" },
  { label: "활성 SaaS 구독", value: "47개", helper: "운영 중인 구독" },
  { label: "이번 카드 결제", value: "₩1,240,000", helper: "이번 주 집계" },
  { label: "정책 위반 알림", value: "3건", helper: "주의 필요" },
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

function statusClass(status: string) {
  if (status === "정상") return "bg-emerald-400/10 text-emerald-300";
  if (status === "검토중") return "bg-amber-300/10 text-amber-200";
  return "bg-rose-400/10 text-rose-300";
}

export default function DashboardPage() {
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
                    <td className="py-3.5 pr-4 font-semibold text-zinc-200">{payment.service}</td>
                    <td className="py-3.5 pr-4 text-zinc-500">{payment.category}</td>
                    <td className="py-3.5 pr-4 text-zinc-300">{payment.amount}</td>
                    <td className="py-3.5 pr-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataCard>

        <DataCard title="알림">
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
          <Link href="/dashboard/alerts" className="mt-8 inline-block text-xs font-bold text-[#8290a5]">
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
}
