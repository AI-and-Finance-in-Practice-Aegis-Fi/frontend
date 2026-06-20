import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  getPendingApprovals,
  getDashboardSummary,
  getAuditLog,
  formatKRW,
  formatDate,
} from "@/lib/api";

type AlertIconType = "shield" | "warning" | "chart" | "card" | "calendar";

const filterTypes = ["전체", "위험", "주의", "정보"];
const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
const calendarDays = Array.from({ length: 35 }, (_, index) => {
  const day = index - 0;
  return day > 0 && day <= 30 ? day : null;
});

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

function AlertIcon({ type }: { type: AlertIconType }) {
  return (
    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#202734] text-slate-300">
      {type === "shield" ? (
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
          <path
            d="M12 4 19 7v5.5c0 4-2.7 6.4-7 7.5-4.3-1.1-7-3.5-7-7.5V7l7-3Z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.9"
          />
        </svg>
      ) : null}
      {type === "warning" ? (
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
          <path
            d="M12 4.5 21 20H3L12 4.5Z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.9"
          />
          <path d="M12 9.5v4.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" />
          <path d="M12 17.2h.01" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" />
        </svg>
      ) : null}
      {type === "chart" ? (
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
          <path d="M6 18V12" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
          <path d="M12 18V7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
          <path d="M18 18v-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
        </svg>
      ) : null}
      {type === "card" ? (
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
          <rect
            x="4"
            y="6.5"
            width="16"
            height="11"
            rx="2"
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.9"
          />
          <path d="M4 10h16" fill="none" stroke="currentColor" strokeWidth="1.9" />
          <path d="M8 14.5h4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" />
        </svg>
      ) : null}
      {type === "calendar" ? (
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
          <rect
            x="4"
            y="5.5"
            width="16"
            height="14.5"
            rx="2"
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.9"
          />
          <path d="M8 3.5v4M16 3.5v4M4 10h16" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" />
          <path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
        </svg>
      ) : null}
    </span>
  );
}

export default async function AlertsPage() {
  try {
    const [pendingApprovals, summary] = await Promise.all([
      getPendingApprovals(),
      getDashboardSummary(),
      getAuditLog(20),
    ]);

    // Build alert list
    const alerts: Array<{ icon: AlertIconType; title: string; description: string; time: string }> = [];

    // Pending approvals → danger alerts
    for (const approval of pendingApprovals) {
      alerts.push({
        icon: "shield",
        title: "승인 대기 결제 감지",
        description: `${approval.employee_name} · ${approval.department_name} · ${approval.merchant_name} (${formatKRW(approval.amount)})`,
        time: formatDate(approval.requested_at),
      });
    }

    // Ghost accounts
    if (summary.saas.ghost_account_count > 0) {
      alerts.push({
        icon: "warning",
        title: `미사용 SaaS ${summary.saas.ghost_account_count}개 감지`,
        description: "45일+ 미접속 계정 포함",
        time: "최근",
      });
    }

    // Budget near limit
    const nearLimitDepts = summary.department_budgets.filter((d) => d.spend_rate > 0.8);
    for (const dept of nearLimitDepts) {
      alerts.push({
        icon: "card",
        title: "법인카드 한도 근접",
        description: `${dept.department_name} · 월 한도 ${Math.round(dept.spend_rate * 100)}% 사용`,
        time: "최근",
      });
    }

    const dangerCount = pendingApprovals.length;
    const cautionCount = nearLimitDepts.length + (summary.saas.ghost_account_count > 0 ? 1 : 0);
    const infoCount = Math.max(0, alerts.length - dangerCount - cautionCount);
    const totalCount = alerts.length;

    const stats = [
      { label: "전체 알림", value: `${totalCount}건`, helper: "오늘 발생", icon: "i", color: "text-[#fbd5d9]" },
      { label: "위험 알림", value: `${dangerCount}건`, helper: "즉시 확인 필요", icon: "△", color: "text-[#61a4bc]" },
      { label: "주의 알림", value: `${cautionCount}건`, helper: "검토 권장", icon: "i", color: "text-[#7b93c9]" },
      { label: "정보 알림", value: `${infoCount}건`, helper: "참고 사항", icon: "✓", color: "text-[#ffffe3]" },
    ];

    return (
      <DashboardShell
        activeHref="/dashboard/alerts"
        title="알림 센터"
        description="2026년 6월 13일 기준"
      >
        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="min-h-[112px] px-5 py-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full border border-white/10 bg-white/10 text-[11px] font-black text-slate-300">
                  {stat.icon}
                </span>
                <p className="text-xs font-bold text-slate-400">{stat.label}</p>
              </div>
              <p className={`mt-2 text-[28px] font-black leading-none ${stat.color}`}>{stat.value}</p>
              <p className="mt-4 text-xs font-semibold text-slate-500">{stat.helper}</p>
            </Card>
          ))}
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="overflow-hidden">
            <div className="border-b border-white/10 px-5 py-5">
              <h2 className="text-xl font-black text-[#ffffe3]">알림 목록</h2>
            </div>

            <div>
              {alerts.map((alert, idx) => (
                <div
                  key={`${alert.title}-${idx}`}
                  className="flex min-h-[78px] flex-col gap-3 border-b border-white/10 px-5 py-4 last:border-0 sm:flex-row sm:items-center"
                >
                  <span className="hidden size-4 shrink-0 rounded-sm border border-white/20 bg-black/10 sm:block" />
                  <AlertIcon type={alert.icon} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] font-black leading-6 text-[#ffffe3]">{alert.title}</h3>
                    <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">{alert.description}</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-slate-400 sm:w-20 sm:text-right">
                    {alert.time}
                  </span>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-zinc-500">알림이 없습니다.</div>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-slate-400">총 {totalCount}건의 알림</p>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <button type="button" className="px-2 py-1 hover:text-white">
                  ‹
                </button>
                <button type="button" className="rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-white">
                  1
                </button>
                <button type="button" className="px-2 py-1 hover:text-white">
                  ›
                </button>
              </div>
            </div>
          </Card>

          <aside className="grid gap-5 self-start">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-[#fbfbdc]">필터</h2>
                <button type="button" className="text-xs font-bold text-[#8290a5]">
                  초기화
                </button>
              </div>

              <div className="mt-5">
                <p className="text-xs font-bold text-zinc-500">알림 유형</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {filterTypes.map((type, index) => (
                    <button
                      key={type}
                      type="button"
                      className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${
                        index === 0
                          ? "border-white/20 bg-white/5 text-white"
                          : "border-white/[0.06] text-zinc-500 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <label className="mt-5 block">
                <span className="text-xs font-bold text-zinc-500">서비스 선택</span>
                <div className="mt-2 rounded-lg border border-white/[0.08] bg-black/20 px-3 py-3 text-sm font-semibold text-zinc-400">
                  전체 서비스
                </div>
              </label>

              <label className="mt-4 block">
                <span className="text-xs font-bold text-zinc-500">기간</span>
                <div className="mt-2 rounded-lg border border-white/[0.08] bg-black/20 px-3 py-3 text-sm font-semibold text-zinc-400">
                  전체 기간
                </div>
              </label>

              <button
                type="button"
                className="mt-5 w-full rounded-lg bg-[#8290a5] px-4 py-3 text-sm font-black text-[#050608] transition hover:bg-[#a3afc1]"
              >
                필터 적용
              </button>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-[#fbfbdc]">알림 캘린더</h2>
                <span className="text-xs font-bold text-[#8290a5]">2026년 6월</span>
              </div>
              <div className="mt-4 grid grid-cols-7 gap-1 text-center">
                {weekDays.map((day) => (
                  <span key={day} className="py-1 text-[10px] font-bold text-zinc-600">
                    {day}
                  </span>
                ))}
                {calendarDays.map((day, index) => (
                  <span
                    key={`${day ?? "empty"}-${index}`}
                    className={`flex aspect-square items-center justify-center rounded-md text-[11px] font-bold ${
                      day === 13
                        ? "bg-[#8290a5] text-[#050608]"
                        : day
                          ? "bg-black/20 text-zinc-500"
                          : "text-transparent"
                    }`}
                  >
                    {day}
                  </span>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-black text-[#fbfbdc]">알림 설정</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    알림 수신 방법 및 환경을 설정하세요
                  </p>
                </div>
                <span className="text-xl font-light text-[#8290a5]">›</span>
              </div>
            </Card>
          </aside>
        </section>
      </DashboardShell>
    );
  } catch {
    return (
      <DashboardShell activeHref="/dashboard/alerts" title="알림 센터" description="데이터를 불러오는 중 오류가 발생했습니다.">
        <p className="mt-8 text-sm text-zinc-500">잠시 후 다시 시도해주세요.</p>
      </DashboardShell>
    );
  }
}
