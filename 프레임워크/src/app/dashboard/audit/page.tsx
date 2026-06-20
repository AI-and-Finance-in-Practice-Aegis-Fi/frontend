import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getAuditLog } from "@/lib/api";

import AuditClient from "./AuditClient";

export default async function AuditPage() {
  try {
    const auditLogs = await getAuditLog(200);

    return (
      <DashboardShell
        activeHref="/dashboard/audit"
        title="감사 로그"
        description={`최근 ${auditLogs.length}건의 활동 기록`}
      >
        <AuditClient initialLogs={auditLogs} />
      </DashboardShell>
    );
  } catch {
    return (
      <DashboardShell
        activeHref="/dashboard/audit"
        title="감사 로그"
        description="데이터를 불러오는 중 오류가 발생했습니다."
      >
        <p className="mt-8 text-sm text-zinc-500">잠시 후 다시 시도해주세요.</p>
      </DashboardShell>
    );
  }
}
