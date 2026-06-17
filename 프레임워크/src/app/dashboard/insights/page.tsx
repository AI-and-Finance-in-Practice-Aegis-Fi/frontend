import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DataCard } from "@/components/dashboard/DataCard";
import { StatCard } from "@/components/dashboard/StatCard";

const reportLines = [
  "이번 달 총 지출은 지난달 대비 12% 증가했습니다.",
  "주요 원인은 AWS 사용량 증가와 중복 SaaS 구독 3건으로 분석되었습니다.",
  "현재 비용 구조는 전반적으로 안정적이며, 연간 약 184만원의 절감 가능성이 있습니다.",
];

const actions = [
  { title: "중복 구독 제거", value: "620,000원" },
  { title: "미사용 라이선스 정리", value: "480,000원" },
  { title: "AWS 비용 최적화", value: "740,000원" },
];

export default function InsightsPage() {
  return (
    <DashboardShell activeHref="/dashboard/insights" title="AI 금융 운영 리포트" description="AI가 비용 패턴과 정책 위반을 분석해 운영 리포트를 생성합니다.">
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="예상 절감액" value="1,840,000원" />
        <StatCard label="위험 알림" value="7건" />
        <StatCard label="AI 신뢰도" value="94%" />
      </section>
      <DataCard title="이번 달 AI 분석 결과" className="mt-6">
        <div className="mt-6 grid gap-5 text-sm font-semibold leading-8 text-zinc-300">
          {reportLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </DataCard>
      <section className="mt-6 grid gap-5 md:grid-cols-3">
        {actions.map((action) => (
          <DataCard key={action.title} title={action.title}>
            <p className="mt-5 text-xs font-bold text-zinc-500">예상 절감액</p>
            <p className="mt-3 text-2xl font-black text-[#8290a5]">{action.value}</p>
          </DataCard>
        ))}
      </section>
      <DataCard title="예상 연간 절감 효과" className="mt-6 text-center">
        <p className="mt-8 text-5xl font-black text-[#ffffdf]">18,400,000원</p>
        <p className="mt-4 text-sm text-zinc-500">AI 추천 적용 시 예상 절감 금액</p>
      </DataCard>
    </DashboardShell>
  );
}
