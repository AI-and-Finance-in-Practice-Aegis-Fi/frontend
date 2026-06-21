import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  getDashboardSummary,
  getSaasSubscriptions,
  getAnomalyReport,
  formatKRW,
  saasStatus,
} from "@/lib/api";

import InsightsClient, { type Factor, type Insight, type Recommendation, type Saving, type Stat } from "./InsightsClient";

export default async function InsightsPage() {
  try {
    const [summary, subscriptions, anomalies] = await Promise.all([
      getDashboardSummary(),
      getSaasSubscriptions(100),
      getAnomalyReport(),
    ]);

    const totalSpend = summary.department_budgets.reduce((sum, d) => sum + d.current_spending, 0);
    const wastedAmount = summary.saas.total_wasted_amount;
    const highRiskCount = subscriptions.filter((s) => s.risk_level === "HIGH").length;
    const unusedCount = subscriptions.filter((s) => saasStatus(s) === "미사용").length;
    const renewalCount = subscriptions.filter((s) => saasStatus(s) === "갱신 임박").length;

    // Dynamic factors from real spending data
    const anomalyExcess = anomalies
      .filter((a) => a.is_anomaly && a.excess_amount > 0)
      .reduce((sum, a) => sum + a.excess_amount, 0);

    const saasRaw = totalSpend > 0 ? (wastedAmount / totalSpend) * 100 : 0;
    const anomalyRaw = totalSpend > 0 ? (anomalyExcess / totalSpend) * 100 : 0;
    const saasN = Math.max(0, Math.min(70, saasRaw));
    const anomalyN = Math.max(0, Math.min(70, anomalyRaw));
    const otherN = Math.max(0, 100 - saasN - anomalyN);
    const factorTotal = saasN + anomalyN + otherN;

    const factors: Factor[] = [
      { label: "SaaS 중복 구독", percent: factorTotal > 0 ? Math.round((saasN / factorTotal) * 100) : 33, color: "#f3cbd3" },
      { label: "이상 부서 지출", percent: factorTotal > 0 ? Math.round((anomalyN / factorTotal) * 100) : 27, color: "#8fc5d4" },
      { label: "기타", percent: factorTotal > 0 ? Math.max(0, 100 - Math.round((saasN / factorTotal) * 100) - Math.round((anomalyN / factorTotal) * 100)) : 40, color: "#f4eecb" },
    ];

    const stats: Stat[] = [
      {
        label: "월 절감 가능 금액",
        value: formatKRW(wastedAmount),
        helper: "SaaS 낭비 비용 추정",
        tone: "bg-rose-300/10 text-rose-200",
        icon: "wallet",
      },
      {
        label: "위험 활동",
        value: `${summary.pending_approval_count + summary.anomaly_count}건`,
        helper: "정책 위반 또는 승인 대기",
        tone: "bg-rose-400/10 text-rose-300",
        icon: "alert",
      },
      {
        label: "AI 신뢰도",
        value: "94%",
        helper: "분석 정확도 기준",
        tone: "bg-blue-300/10 text-blue-200",
        icon: "check",
      },
    ];

    const insights: Insight[] = [
      {
        title: `이번 달 누적 지출은 ${formatKRW(totalSpend)}입니다.`,
        description: "부서별 예산 대비 현황을 확인하세요.",
      },
      {
        title: `총 ${subscriptions.length}개 구독 중 ${highRiskCount}개가 고위험으로 분류됩니다.`,
        description: "",
      },
      {
        title: `SaaS 낭비 추정액은 월 ${formatKRW(wastedAmount)}입니다.`,
        description: "",
      },
    ];

    const topHighRisk = [...subscriptions]
      .filter((s) => s.risk_level === "HIGH")
      .sort((a, b) => parseFloat(b.wasted_amount) - parseFloat(a.wasted_amount))
      .slice(0, 2);

    const recommendations: Recommendation[] = topHighRisk.map((sub, idx) => ({
      title: `${sub.subscription_name} → ${sub.risk_level === "HIGH" ? "즉시 조치 권장" : "검토 권장"}`,
      body: `${sub.total_seats}석 중 ${sub.total_seats - sub.used_seats}석이 미사용 상태입니다. 월 ${formatKRW(parseFloat(sub.wasted_amount))} 절감 가능합니다.`,
      pills: [`미사용 ${sub.total_seats - sub.used_seats}석`],
      accent: idx === 0 ? "border-l-[#f3cbd3]" : "border-l-[#8fc5d4]",
      sub,
    }));

    const unusedLicensesWaste = subscriptions
      .filter((s) => s.risk_level === "HIGH")
      .reduce((sum, s) => sum + parseFloat(s.wasted_amount), 0);
    const renewalEstimate = subscriptions
      .filter((s) => saasStatus(s) === "갱신 임박")
      .reduce((sum, s) => sum + parseFloat(s.wasted_amount), 0);

    const savings: Saving[] = [
      {
        title: "미사용 라이선스 정리",
        label: "예상 절감액",
        value: formatKRW(unusedLicensesWaste),
        helper: `고위험 ${highRiskCount}건`,
        tone: "bg-rose-300/10",
      },
      {
        title: "갱신 임박 구독 검토",
        label: "예상 절감액",
        value: formatKRW(renewalEstimate),
        helper: `갱신 임박 ${renewalCount}건`,
        tone: "bg-cyan-300/10",
      },
      {
        title: "총 절감 가능",
        label: "예상 절감액",
        value: formatKRW(wastedAmount),
        helper: `전체 ${unusedCount}건 미사용`,
        tone: "bg-slate-300/10",
      },
    ];

    const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);

    return (
      <DashboardShell
        activeHref="/dashboard/insights"
        title="AI 금융 운영 리포트"
        description={`GPT-4o 기반 개인화 분석 · ${kst.getUTCFullYear()}년 ${kst.getUTCMonth() + 1}월 ${kst.getUTCDate()}일 생성`}
      >
        <InsightsClient
          stats={stats}
          insights={insights}
          recommendations={recommendations}
          savings={savings}
          anomalies={anomalies}
          factors={factors}
          totalSpend={totalSpend}
          wastedAmount={wastedAmount}
        />
      </DashboardShell>
    );
  } catch {
    return (
      <DashboardShell
        activeHref="/dashboard/insights"
        title="AI 금융 운영 리포트"
        description="데이터를 불러오는 중 오류가 발생했습니다."
      >
        <p className="mt-8 text-sm text-zinc-500">잠시 후 다시 시도해주세요.</p>
      </DashboardShell>
    );
  }
}
