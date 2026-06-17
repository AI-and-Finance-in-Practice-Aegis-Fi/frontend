import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DataCard } from "@/components/dashboard/DataCard";

const logs = [
  { action: "정책 변경", user: "Finance Admin", time: "2026.06.17 09:30" },
  { action: "결제 승인", user: "CFO", time: "2026.06.17 10:12" },
  { action: "SaaS 구독 갱신", user: "Ops Manager", time: "2026.06.17 11:04" },
  { action: "알림 설정 변경", user: "Finance Admin", time: "2026.06.17 13:21" },
];

export default function AuditPage() {
  return (
    <DashboardShell activeHref="/dashboard/audit" title="감사 로그" description="주요 운영 변경 이력을 추적합니다.">
      <DataCard title="최근 감사 기록" className="mt-6">
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b border-white/[0.08] text-xs text-zinc-500">
              <tr>
                <th className="py-3 pr-4">작업</th>
                <th className="py-3 pr-4">사용자</th>
                <th className="py-3 pr-4">시간</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={`${log.action}-${log.time}`} className="border-b border-white/[0.06] last:border-0">
                  <td className="py-4 pr-4 font-semibold text-zinc-200">{log.action}</td>
                  <td className="py-4 pr-4 text-zinc-500">{log.user}</td>
                  <td className="py-4 pr-4 text-zinc-400">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataCard>
    </DashboardShell>
  );
}
