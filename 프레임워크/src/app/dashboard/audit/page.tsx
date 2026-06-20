import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getAuditLog, formatDate, formatTime } from "@/lib/api";

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

function FilterButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="rounded-lg border border-white/10 bg-[#111722] px-3 py-2 text-xs font-bold text-zinc-400 transition hover:bg-white/5 hover:text-white"
    >
      {children}
    </button>
  );
}

const activityLegend = [
  { label: "승인", value: "54%", count: "25건", color: "#f3cbd3" },
  { label: "수정", value: "21%", count: "10건", color: "#8fc5d4" },
  { label: "조회", value: "17%", count: "8건", color: "#96a8d8" },
  { label: "삭제", value: "8%", count: "4건", color: "#f4eecb" },
];

function eventTypeLabel(eventType: string): { type: string; tone: string } {
  if (eventType.includes("APPROVED")) {
    return { type: "결제 승인", tone: "bg-yellow-200/20 text-yellow-100" };
  }
  if (eventType.includes("BLOCKED")) {
    return { type: "결제 차단", tone: "bg-rose-300/20 text-rose-100" };
  }
  if (eventType.includes("ANOMALY")) {
    return { type: "이상 감지", tone: "bg-cyan-300/20 text-cyan-100" };
  }
  if (eventType.includes("POLICY")) {
    return { type: "정책 변경", tone: "bg-rose-300/20 text-rose-100" };
  }
  return { type: eventType, tone: "bg-blue-300/20 text-blue-100" };
}

export default async function AuditPage() {
  try {
    const auditLogs = await getAuditLog(30);

    const totalCount = auditLogs.length;
    const importantCount = auditLogs.filter(
      (l) => l.event_type.includes("BLOCKED") || l.event_type.includes("ANOMALY"),
    ).length;
    const violationCount = auditLogs.filter((l) => l.event_type.includes("BLOCKED")).length;

    const summaryItems = [
      { label: "총 활동", value: `${totalCount}건`, helper: "조회된 전체 활동" },
      { label: "중요 이벤트", value: `${importantCount}건`, helper: "즉시 검토가 필요한 이벤트" },
      { label: "정책 위반 관련", value: `${violationCount}건`, helper: "정책 위반 또는 예외 승인" },
    ];

    const timeline = auditLogs.map((log) => {
      const { type, tone } = eventTypeLabel(log.event_type);
      const data = log.event_data as Record<string, unknown>;
      const employeeId = data.employee_id as number | undefined;
      const merchantName = data.merchant_name as string | undefined;
      const category = data.category as string | undefined;
      const reason = data.reason as string | undefined;

      return {
        time: formatTime(log.created_at),
        user: employeeId != null ? `직원 #${employeeId}` : "시스템",
        role: "",
        event: [merchantName, category].filter(Boolean).join(" · ") || type,
        desc: reason ?? type,
        type,
        ip: "-",
        tone,
        key: String(log.audit_id),
      };
    });

    return (
      <DashboardShell
        activeHref="/dashboard/audit"
        title="감사 로그"
        description={`최근 ${totalCount}건의 활동 기록`}
      >
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <FilterButton>날짜 범위: 2026.05.14~2026.06.13</FilterButton>
          <FilterButton>전체 사용자⌄</FilterButton>
          <FilterButton>필터</FilterButton>
        </div>

        <Card className="mt-5 p-6">
          <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr_1fr_1.15fr] xl:items-center xl:divide-x xl:divide-white/10">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-[#141b27] text-[#8290a5]">
                  <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                    <path
                      d="M12 4 19 7v5.5c0 4.1-2.8 6.4-7 7.5-4.2-1.1-7-3.4-7-7.5V7l7-3Z"
                      fill="none"
                      stroke="currentColor"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                </span>
                <h2 className="text-base font-black text-[#fbfbdc]">최근 보안 활동 요약</h2>
              </div>
            </div>

            {summaryItems.map((item) => (
              <div key={item.label} className="xl:px-6">
                <p className="text-xs font-bold text-zinc-500">{item.label}</p>
                <p className="mt-2 text-3xl font-black text-[#fbfbdc]">{item.value}</p>
                <p className="mt-2 text-xs font-semibold text-zinc-500">{item.helper}</p>
              </div>
            ))}

            <div className="xl:px-6">
              <div className="grid grid-cols-[92px_minmax(0,1fr)] items-center gap-4">
                <div className="relative flex size-20 items-center justify-center rounded-full bg-[conic-gradient(#8fb7ca_0_23deg,#243041_23deg_360deg)]">
                  <div className="flex size-16 flex-col items-center justify-center rounded-full bg-[#111722]">
                    <span className="text-lg font-black text-[#fbfbdc]">6.3%</span>
                    <span className="text-[10px] font-bold text-zinc-500">위험도 지수</span>
                  </div>
                </div>
                <p className="text-xs font-semibold leading-6 text-zinc-500">
                  지난 30일 기준
                  <br />
                  위험도가 낮습니다.
                  <br />
                  계속해서 모니터링이 필요합니다.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="mt-6 p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-black text-[#fbfbdc]">활동 타임라인</h2>
            <button
              type="button"
              className="rounded-lg border border-white/10 bg-black/15 px-3 py-2 text-xs font-bold text-zinc-500"
            >
              최신순⌄
            </button>
          </div>

          <div className="relative mt-6">
            <div className="absolute left-[60px] top-2 hidden h-[calc(100%-26px)] w-px bg-[#334155] sm:block" />
            {timeline.map((item) => (
              <div
                key={item.key}
                className="grid gap-4 border-b border-white/[0.06] py-4 last:border-0 sm:grid-cols-[48px_24px_64px_minmax(0,1fr)_110px_110px] sm:items-center"
              >
                <span className="text-xs font-semibold text-zinc-500">{item.time}</span>
                <span className="relative hidden size-3 rounded-full bg-[#7f9dbb] ring-4 ring-[#111722] sm:block" />
                <span className={`flex size-10 items-center justify-center rounded-full text-xs font-black ${item.tone}`}>
                  {item.user.slice(0, 2)}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="text-sm font-black text-[#fbfbdc]">{item.user}</p>
                    {item.role ? <span className="text-xs font-semibold text-zinc-500">{item.role}</span> : null}
                  </div>
                  <p className="mt-2 text-sm font-bold text-zinc-300">{item.event}</p>
                  <p className="mt-1 text-xs text-zinc-500">{item.desc}</p>
                </div>
                <span className="w-fit rounded-md border border-white/15 px-2.5 py-1 text-xs font-bold text-zinc-300">
                  {item.type}
                </span>
                <span className="text-xs font-semibold text-zinc-500 sm:text-right">{item.ip}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-6 w-full rounded-lg border border-white/10 px-4 py-3 text-sm font-bold text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            더 많은 활동 보기⌄
          </button>
        </Card>

        <section className="mt-6 grid gap-5 xl:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-lg font-black text-[#fbfbdc]">오늘의 활동 요약</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center">
              <div className="relative mx-auto flex size-36 items-center justify-center rounded-full bg-[conic-gradient(#f3cbd3_0_194deg,#8fc5d4_194deg_270deg,#96a8d8_270deg_331deg,#f4eecb_331deg_360deg)]">
                <div className="flex size-24 flex-col items-center justify-center rounded-full bg-[#111722] text-center">
                  <span className="text-xs font-bold text-zinc-500">오늘</span>
                  <span className="text-3xl font-black text-[#fbfbdc]">{totalCount}건</span>
                  <span className="text-xs font-bold text-zinc-500">총 활동</span>
                </div>
              </div>
              <div className="grid gap-3">
                {activityLegend.map((item) => (
                  <div key={item.label} className="grid grid-cols-[12px_1fr_42px_40px] items-center gap-3 text-xs font-semibold">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-zinc-400">{item.label}</span>
                    <span className="text-zinc-300">{item.value}</span>
                    <span className="text-zinc-500">({item.count})</span>
                  </div>
                ))}
                <button
                  type="button"
                  className="mt-4 rounded-lg border border-white/10 px-4 py-2.5 text-xs font-bold text-zinc-400 transition hover:bg-white/5 hover:text-white"
                >
                  전체 통계 보기
                </button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-[#f1d9df]/15 text-[#f1d9df]">
                  ✧
                </span>
                <h2 className="text-lg font-black text-[#fbfbdc]">AI 이상 활동 분석</h2>
              </div>
              <span className="rounded-full bg-rose-400/20 px-3 py-1 text-xs font-black text-rose-200">주의</span>
            </div>
            <p className="mt-5 text-sm leading-7 text-zinc-500">
              지난 7일간 권한 변경이 평소 대비 33% 증가했습니다.
              <br />
              추가 검토를 권장합니다.
            </p>
            <svg viewBox="0 0 420 150" className="mt-5 h-36 w-full" role="img" aria-label="AI 이상 활동 추이">
              <defs>
                <linearGradient id="auditArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#f3cbd3" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#f3cbd3" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M20 118 L75 102 L125 110 L178 84 L232 96 L292 60 L350 72 L400 38 L400 140 L20 140Z" fill="url(#auditArea)" />
              <polyline
                points="20,118 75,102 125,110 178,84 232,96 292,60 350,72 400,38"
                fill="none"
                stroke="#d8b8c0"
                strokeWidth="3"
              />
              {[20, 75, 125, 178, 232, 292, 350, 400].map((x, index) => {
                const y = [118, 102, 110, 84, 96, 60, 72, 38][index];
                return <circle key={x} cx={x} cy={y} r="3" fill="#f3cbd3" />;
              })}
            </svg>
            <button
              type="button"
              className="mt-4 rounded-lg bg-[#f1d9df] px-5 py-2.5 text-xs font-black text-[#130b10] transition hover:bg-[#f7e6eb]"
            >
              자세히 보기
            </button>
          </Card>
        </section>
      </DashboardShell>
    );
  } catch {
    return (
      <DashboardShell activeHref="/dashboard/audit" title="감사 로그" description="데이터를 불러오는 중 오류가 발생했습니다.">
        <p className="mt-8 text-sm text-zinc-500">잠시 후 다시 시도해주세요.</p>
      </DashboardShell>
    );
  }
}
