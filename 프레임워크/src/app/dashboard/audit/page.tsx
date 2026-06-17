import { DashboardShell } from "@/components/dashboard/DashboardShell";

const summary = [
  { label: "총 활동", value: "1,284건", helper: "지난 30일 전체 활동" },
  { label: "중요 이벤트", value: "24건", helper: "즉시 검토가 필요한 이벤트" },
  { label: "정책 위반 관련", value: "7건", helper: "정책 위반 또는 예외 승인" },
];

const timeline = [
  {
    time: "14:32",
    user: "김태훈",
    role: "마케팅 계정",
    event: "식비 정책 수정",
    desc: "정책명: 식비 카드 변경",
    type: "정책 변경",
    ip: "192.168.1.12",
    tone: "bg-rose-300/20 text-rose-100",
  },
  {
    time: "13:18",
    user: "박소현",
    role: "결제 담당자",
    event: "AWS 결제 승인",
    desc: "1,240,000원 결제 승인",
    type: "결제 승인",
    ip: "192.168.1.45",
    tone: "bg-yellow-200/20 text-yellow-100",
  },
  {
    time: "12:04",
    user: "AI 시스템",
    role: "",
    event: "미사용 SaaS 탐지",
    desc: "Zoom 45일 미사용 감지",
    type: "AI 탐지",
    ip: "-",
    tone: "bg-cyan-300/20 text-cyan-100",
  },
  {
    time: "11:47",
    user: "이지수",
    role: "마케팅 사원",
    event: "Adobe Creative Cloud 접근",
    desc: "서비스 접근 이력 조회",
    type: "조회",
    ip: "192.168.1.32",
    tone: "bg-blue-300/20 text-blue-100",
  },
  {
    time: "10:22",
    user: "최민준",
    role: "인사팀 대리",
    event: "사용자 권한 변경",
    desc: "박소현 - 팀 리더 권한 부여",
    type: "권한 변경",
    ip: "192.168.1.21",
    tone: "bg-rose-300/20 text-rose-100",
  },
];

const activityLegend = [
  { label: "승인", value: "54%", count: "25건", color: "#f3cbd3" },
  { label: "수정", value: "21%", count: "10건", color: "#8fc5d4" },
  { label: "조회", value: "17%", count: "8건", color: "#96a8d8" },
  { label: "삭제", value: "8%", count: "4건", color: "#f4eecb" },
];

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

export default function AuditPage() {
  return (
    <DashboardShell
      activeHref="/dashboard/audit"
      title="감사 로그"
      description="지난 30일간 1,284건의 활동 기록"
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

          {summary.map((item) => (
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
              key={`${item.time}-${item.event}`}
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
                <span className="text-3xl font-black text-[#fbfbdc]">47건</span>
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
}
