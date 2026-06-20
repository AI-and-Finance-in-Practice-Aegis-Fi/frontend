import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  getDashboardSummary,
  getTransactions,
  formatKRW,
  formatDate,
} from "@/lib/api";

type DetectionType = "warning" | "success" | "pending";

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

function getProgressColor(value: number) {
  if (value >= 80) return "bg-rose-200";
  if (value >= 60) return "bg-orange-300";
  if (value >= 40) return "bg-cyan-300";
  return "bg-yellow-100";
}

function detectionTone(type: DetectionType) {
  if (type === "warning") {
    return {
      badge: "bg-rose-500/10 text-rose-300",
      status: "text-rose-400",
    };
  }

  if (type === "success") {
    return {
      badge: "bg-cyan-500/10 text-cyan-300",
      status: "text-cyan-300",
    };
  }

  return {
    badge: "bg-slate-500/20 text-yellow-200",
    status: "text-yellow-200",
  };
}

function DetectionIcon({ type }: { type: DetectionType }) {
  if (type === "warning") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <path
          d="M12 4.5 21 20H3L12 4.5Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.9"
        />
        <path d="M12 9.5v4.5M12 17.2h.01" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" />
      </svg>
    );
  }

  if (type === "success") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <path
          d="m7 12 3.2 3.2L17.5 8"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.2"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <path d="M12 8v4.6l3 2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" />
    </svg>
  );
}

function ProgressRow({
  label,
  value,
  amount,
}: {
  label: string;
  value: number;
  amount?: string;
}) {
  return (
    <div className="grid grid-cols-[82px_minmax(0,1fr)_52px] items-center gap-3 text-xs font-semibold">
      <span className="text-zinc-400">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-slate-700/70">
        <div className={`h-full rounded-full ${getProgressColor(value)}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-right text-zinc-500">{amount ?? `${value}%`}</span>
    </div>
  );
}

function statusClass(status: string) {
  if (status === "정상") return "border-cyan-300/20 bg-cyan-300/10 text-cyan-200";
  if (status === "한도초과") return "border-rose-300/20 bg-rose-400/10 text-rose-300";
  return "border-amber-300/20 bg-amber-300/10 text-amber-200";
}

function approvalStatusLabel(isApproved: boolean | null): string {
  if (isApproved === true) return "정상";
  if (isApproved === false) return "한도초과";
  return "검토 중";
}

function approvalAction(isApproved: boolean | null): string {
  if (isApproved === false) return "조치";
  if (isApproved === null) return "검토";
  return "-";
}

export default async function ExpensesPage() {
  try {
    const [summary, transactions] = await Promise.all([
      getDashboardSummary(),
      getTransactions(200),
    ]);

    const totalSpend = summary.department_budgets.reduce(
      (sum, d) => sum + d.current_spending,
      0,
    );
    const totalBudget = summary.department_budgets.reduce(
      (sum, d) => sum + d.monthly_budget_limit,
      0,
    );
    const spendRate = totalBudget > 0 ? Math.round((totalSpend / totalBudget) * 100) : 0;

    const violationCount = transactions.filter((t) => t.is_approved === false).length;
    const normalCount = transactions.filter((t) => t.is_approved === true).length;
    const pendingCount = transactions.filter((t) => t.is_approved === null).length;

    const aiResults: Array<{ label: string; value: string; helper: string; type: DetectionType }> = [
      {
        label: "정책 위반",
        value: `${violationCount}건`,
        helper: "즉시 검토 필요",
        type: "warning",
      },
      {
        label: "정상 결제",
        value: `${normalCount}건`,
        helper: "정상 처리됨",
        type: "success",
      },
      {
        label: "승인 대기",
        value: `${pendingCount}건`,
        helper: "검토 대기 중",
        type: "pending",
      },
    ];

    const payments = transactions.slice(0, 20).map((t) => ({
      date: formatDate(t.payment_time),
      employee: t.employee_name,
      department: t.department_name,
      merchant: t.merchant_name,
      category: t.category,
      amount: formatKRW(parseFloat(t.amount)),
      status: approvalStatusLabel(t.is_approved),
      action: approvalAction(t.is_approved),
      key: String(t.transaction_id),
    }));

    const departmentUsage = [...summary.department_budgets]
      .sort((a, b) => b.spend_rate - a.spend_rate)
      .slice(0, 5)
      .map((d) => ({
        label: d.department_name,
        value: Math.round(d.spend_rate * 100),
      }));

    // Aggregate by category
    const categoryMap = new Map<string, number>();
    for (const t of transactions) {
      const amt = parseFloat(t.amount);
      categoryMap.set(t.category, (categoryMap.get(t.category) ?? 0) + amt);
    }
    const sortedCategories = [...categoryMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const maxCategoryAmt = sortedCategories[0]?.[1] ?? 1;
    const categorySpend = sortedCategories.map(([label, amt]) => ({
      label,
      value: Math.round((amt / maxCategoryAmt) * 100),
      amount: formatKRW(amt),
    }));

    return (
      <DashboardShell
        activeHref="/dashboard/expenses"
        title="법인카드 결제"
        description={`${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월 ${new Date().getDate()}일 기준`}
      >
        <Card className="mt-7 p-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_1.3fr] lg:divide-x lg:divide-white/10">
            <div className="lg:pr-8">
              <p className="text-xs font-bold text-zinc-500">이번 달 총 사용액</p>
              <p className="mt-3 text-3xl font-black text-[#fbfbdc]">{formatKRW(totalSpend)}</p>
              <p className="mt-3 text-sm font-semibold text-zinc-400">예산 대비 {spendRate}% 사용 중</p>
              <p className="mt-1 text-xs font-semibold text-[#8290a5]">예산 총액 {formatKRW(totalBudget)}</p>
              <div className="mt-7 flex items-center gap-4">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-700/70">
                  <div className="h-full rounded-full bg-[#f1cbd3]" style={{ width: `${spendRate}%` }} />
                </div>
                <span className="text-xs font-bold text-zinc-500">{spendRate}%</span>
              </div>
            </div>

            <div className="lg:pl-8">
              <h2 className="text-lg font-black text-[#fbfbdc]">AI 감지 결과</h2>
              <div className="mt-5">
                {aiResults.map((item) => {
                  const tone = detectionTone(item.type);

                  return (
                    <div
                      key={item.label}
                      className="flex min-h-[70px] items-center gap-4 border-b border-white/10 py-4 last:border-b-0"
                    >
                      <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${tone.badge}`}>
                        <DetectionIcon type={item.type} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-300">{item.label}</p>
                        <p className="mt-1 text-3xl font-black leading-none text-[#ffffe3]">{item.value}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-4 text-right">
                        <span className={`text-sm font-semibold ${tone.status}`}>{item.helper}</span>
                        <span className="text-xl font-light text-slate-500">›</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

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

        <Card className="mt-5 overflow-hidden">
          <div className="border-b border-white/[0.08] px-5 py-4">
            <h2 className="text-lg font-black text-[#fbfbdc]">결제 내역</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="border-b border-white/[0.08] text-xs text-zinc-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">일시</th>
                  <th className="px-4 py-4 font-semibold">직원</th>
                  <th className="px-4 py-4 font-semibold">부서</th>
                  <th className="px-4 py-4 font-semibold">가맹점</th>
                  <th className="px-4 py-4 font-semibold">카테고리</th>
                  <th className="px-4 py-4 font-semibold">금액</th>
                  <th className="px-4 py-4 font-semibold">상태</th>
                  <th className="px-5 py-4 font-semibold">조치</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.key} className="border-b border-white/[0.06] last:border-0">
                    <td className="px-5 py-4 text-zinc-400">{payment.date}</td>
                    <td className="px-4 py-4 font-semibold text-[#fbfbdc]">{payment.employee}</td>
                    <td className="px-4 py-4 text-zinc-400">{payment.department}</td>
                    <td className="px-4 py-4 text-zinc-300">{payment.merchant}</td>
                    <td className="px-4 py-4 text-zinc-400">{payment.category}</td>
                    <td className="px-4 py-4 text-zinc-300">{payment.amount}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-md border px-2 py-1 text-[11px] font-black ${statusClass(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {payment.action === "-" ? (
                        <span className="text-zinc-500">-</span>
                      ) : (
                        <button
                          type="button"
                          className="rounded-md border border-white/10 px-3 py-1 text-[11px] font-bold text-zinc-300 hover:bg-white/5"
                        >
                          {payment.action}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <section className="mt-5 grid gap-5 xl:grid-cols-2">
          <Card className="p-5">
            <h2 className="text-lg font-black text-[#fbfbdc]">부서별 카드 사용 현황</h2>
            <div className="mt-6 grid gap-4">
              {departmentUsage.map((item) => (
                <ProgressRow key={item.label} {...item} />
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-black text-[#fbfbdc]">카테고리별 지출</h2>
            <div className="mt-6 grid gap-4">
              {categorySpend.map((item) => (
                <ProgressRow key={item.label} label={item.label} value={item.value} amount={item.amount} />
              ))}
            </div>
          </Card>
        </section>

        <Card className="mt-5 p-6">
          <div className="grid gap-5 sm:grid-cols-[54px_minmax(0,1fr)] sm:items-start">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#f1d9df]/15 text-[#f1d9df]">
              <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
                <path d="M12 3v5M12 16v5M3 12h5M16 12h5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
                <path d="m6.5 6.5 3.5 3.5M14 14l3.5 3.5M17.5 6.5 14 10M10 14l-3.5 3.5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-black text-[#fbfbdc]">AI 비용 분석 결과</h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-zinc-400">
                {violationCount > 0
                  ? `정책 위반 결제 ${violationCount}건이 감지되었습니다. 해당 항목을 수정하거나 예외 승인 시 유사 사례를 자동 관리할 수 있습니다.`
                  : "현재 정책 위반 결제가 없습니다. 모든 결제가 정상 처리되고 있습니다."}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-lg bg-[#f1d9df] px-5 py-2.5 text-xs font-black text-[#130b10] transition hover:bg-[#f7e6eb]"
                >
                  정책 수정
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-white/10 px-5 py-2.5 text-xs font-bold text-zinc-400 transition hover:bg-white/5 hover:text-white"
                >
                  예외 승인
                </button>
              </div>
            </div>
          </div>
        </Card>
      </DashboardShell>
    );
  } catch {
    return (
      <DashboardShell activeHref="/dashboard/expenses" title="법인카드 결제" description="데이터를 불러오는 중 오류가 발생했습니다.">
        <p className="mt-8 text-sm text-zinc-500">잠시 후 다시 시도해주세요.</p>
      </DashboardShell>
    );
  }
}
