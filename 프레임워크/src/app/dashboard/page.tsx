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
  { employee: "김태훈", department: "마케팅", merchant: "Adobe Creative", amount: "320,000원", status: "정상" },
  { employee: "박소현", department: "영업", merchant: "스시 오마카세", amount: "890,000원", status: "위반 감지" },
  { employee: "최민준", department: "개발", merchant: "AWS", amount: "1,240,000원", status: "정상" },
  { employee: "정유미", department: "인사", merchant: "GS25 편의점", amount: "58,000원", status: "검토 중" },
  { employee: "이지수", department: "재무", merchant: "Notion", amount: "180,000원", status: "정상" },
];

const alerts = [
  {
    title: "정책 위반 결제 감지",
    description: "김태훈 · 마케팅 · 스시 한도 초과",
    time: "방금",
    dot: "bg-[#f1d9df] shadow-[0_0_12px_rgba(241,217,223,0.75)]",
  },
  {
    title: "미사용 SaaS 9개 감지",
    description: "45일+ 미접속 포함",
    time: "1시간 전",
    dot: "bg-[#8fc5d4] shadow-[0_0_12px_rgba(143,197,212,0.7)]",
  },
  {
    title: "AI 최적화 리포트 생성됨",
    description: "약 210,000원 절감 가능",
    time: "3시간 전",
    dot: "bg-[#9aa7e8] shadow-[0_0_12px_rgba(154,167,232,0.7)]",
  },
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
  if (status === "정상") return "text-[#fbfbdc]";
  if (status === "검토 중") return "text-amber-200";
  return "text-rose-300";
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
                    key={`${payment.employee}-${payment.amount}`}
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
}
