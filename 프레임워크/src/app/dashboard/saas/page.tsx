import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DataCard } from "@/components/dashboard/DataCard";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { StatCard } from "@/components/dashboard/StatCard";

const tools = [
  { label: "Slack", value: 88 },
  { label: "Notion", value: 73 },
  { label: "Figma", value: 60 },
  { label: "Zoom", value: 34 },
  { label: "Salesforce", value: 18 },
];

export default function SaasPage() {
  return (
    <DashboardShell activeHref="/dashboard/saas" title="SaaS 구독 관리" description="구독 현황과 사용량을 한 곳에서 관리하세요.">
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="활성 구독" value="47개" helper="지난달 대비 +8%" />
        <StatCard label="월 구독 비용" value="₩8,240,000" helper="+12%" />
        <StatCard label="중복 구독" value="3건" helper="정리 필요" />
      </section>
      <DataCard title="SaaS 사용량 상위 항목" className="mt-6">
        <div className="mt-6 grid gap-5">
          {tools.map((item) => (
            <ProgressBar key={item.label} {...item} />
          ))}
        </div>
      </DataCard>
    </DashboardShell>
  );
}
