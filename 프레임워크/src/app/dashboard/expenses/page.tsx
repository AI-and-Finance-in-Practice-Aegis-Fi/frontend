import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DataCard } from "@/components/dashboard/DataCard";
import { StatCard } from "@/components/dashboard/StatCard";

const payments = [
  { service: "AWS", category: "클라우드", amount: "12,400,000원", status: "정상" },
  { service: "Slack", category: "SaaS 구독", amount: "320,000원", status: "정상" },
  { service: "GS25", category: "편의점", amount: "56,000원", status: "검토중" },
  { service: "Notion", category: "SaaS 구독", amount: "180,000원", status: "정상" },
  { service: "Adobe", category: "디자인 툴", amount: "650,000원", status: "위반" },
];

function statusClass(status: string) {
  if (status === "정상") return "bg-emerald-400/10 text-emerald-300";
  if (status === "검토중") return "bg-amber-300/10 text-amber-200";
  return "bg-rose-400/10 text-rose-300";
}

export default function ExpensesPage() {
  return (
    <DashboardShell activeHref="/dashboard/expenses" title="법인카드 결제" description="법인카드 지출 내역과 검토 상태를 확인하세요.">
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="이번 달 결제" value="₩42,850,000" helper="+12%" />
        <StatCard label="검토중" value="4건" helper="확인 필요" />
        <StatCard label="위반 감지" value="1건" helper="즉시 대응" />
      </section>
      <DataCard title="최근 결제 내역" className="mt-6">
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b border-white/[0.08] text-xs text-zinc-500">
              <tr>
                <th className="py-3 pr-4">서비스</th>
                <th className="py-3 pr-4">카테고리</th>
                <th className="py-3 pr-4">금액</th>
                <th className="py-3 pr-4">상태</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={`${payment.service}-${payment.amount}`} className="border-b border-white/[0.06] last:border-0">
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
      </DataCard>
    </DashboardShell>
  );
}
