import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getDashboardSummary, getTransactions } from "@/lib/api";

import ExpensesClient from "./ExpensesClient";

export default async function ExpensesPage() {
  try {
    const [summary, transactions] = await Promise.all([
      getDashboardSummary(),
      getTransactions(200),
    ]);

    const totalSpend = summary.department_budgets.reduce((sum, d) => sum + d.current_spending, 0);
    const totalBudget = summary.department_budgets.reduce((sum, d) => sum + d.monthly_budget_limit, 0);
    const spendRate = totalBudget > 0 ? Math.round((totalSpend / totalBudget) * 100) : 0;

    const departmentUsage = [...summary.department_budgets]
      .sort((a, b) => b.spend_rate - a.spend_rate)
      .slice(0, 5)
      .map((d) => ({ label: d.department_name, value: Math.round(d.spend_rate * 100) }));

    const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
    const kstLabel = `${kst.getUTCFullYear()}년 ${kst.getUTCMonth() + 1}월 ${kst.getUTCDate()}일 기준`;

    return (
      <DashboardShell
        activeHref="/dashboard/expenses"
        title="법인카드 결제"
        description={kstLabel}
      >
        <ExpensesClient
          initialTransactions={transactions}
          departmentBudgets={summary.department_budgets}
          totalSpend={totalSpend}
          totalBudget={totalBudget}
          spendRate={spendRate}
          departmentUsage={departmentUsage}
        />
      </DashboardShell>
    );
  } catch {
    return (
      <DashboardShell
        activeHref="/dashboard/expenses"
        title="법인카드 결제"
        description="데이터를 불러오는 중 오류가 발생했습니다."
      >
        <p className="mt-8 text-sm text-zinc-500">잠시 후 다시 시도해주세요.</p>
      </DashboardShell>
    );
  }
}
