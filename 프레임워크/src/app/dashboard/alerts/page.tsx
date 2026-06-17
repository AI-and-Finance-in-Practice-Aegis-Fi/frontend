import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DataCard } from "@/components/dashboard/DataCard";
import { StatCard } from "@/components/dashboard/StatCard";

const alerts = [
  { title: "정책 위반 감지", desc: "승인되지 않은 결제가 발견되었습니다.", time: "방금" },
  { title: "예산 SaaS 초과", desc: "SaaS 예산 사용률이 80%를 넘었습니다.", time: "14분 전" },
  { title: "소프트웨어 비용 증가", desc: "AWS 비용이 전월 대비 18% 증가했습니다.", time: "34분 전" },
];

export default function AlertsPage() {
  return (
    <DashboardShell activeHref="/dashboard/alerts" title="알림 센터" description="금융 운영 이벤트와 위험 신호를 확인하세요.">
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="전체 알림" value="18건" helper="오늘 +3건" />
        <StatCard label="미확인" value="7건" helper="확인 필요" />
        <StatCard label="위험" value="3건" helper="즉시 대응" />
      </section>
      <DataCard title="최근 알림" className="mt-6">
        <div className="mt-5 grid gap-4">
          {alerts.map((alert) => (
            <div key={alert.title} className="rounded-xl border border-white/[0.06] bg-black/15 p-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-bold text-[#fbfbdc]">{alert.title}</h2>
                <span className="text-xs text-zinc-600">{alert.time}</span>
              </div>
              <p className="mt-2 text-sm text-zinc-500">{alert.desc}</p>
            </div>
          ))}
        </div>
      </DataCard>
    </DashboardShell>
  );
}
