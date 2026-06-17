import { DashboardShell } from "@/components/dashboard/DashboardShell";

const stats = [
  { label: "전체 알림", value: "12건", helper: "오늘 발생", tone: "bg-blue-400/10" },
  { label: "위험 알림", value: "3건", helper: "즉시 확인 필요", tone: "bg-rose-400/10" },
  { label: "주의 알림", value: "6건", helper: "검토 권장", tone: "bg-amber-300/10" },
  { label: "정보 알림", value: "3건", helper: "참고 사항", tone: "bg-slate-400/10" },
];

const alerts = [
  {
    icon: "shield",
    title: "정책 위반 결제 감지",
    description: "김태훈 · 마케팅 · 스시 오마카세 초과 (700,000원)",
    time: "14:32",
  },
  {
    icon: "warning",
    title: "미사용 SaaS 9개 감지",
    description: "Salesforce 65석, Zoom 99석 등 45일+ 미사용",
    time: "13:00",
  },
  {
    icon: "chart",
    title: "AI 최적화 리포트 생성됨",
    description: "약 210,000원 절감 가능 시나리오 포함",
    time: "10:00",
  },
  {
    icon: "card",
    title: "법인카드 한도 근접",
    description: "마케팅팀 카드 · 월 한도 90% 사용",
    time: "09:15",
  },
  {
    icon: "shield",
    title: "정책 위반 결제 감지",
    description: "이정민 · 개발팀 · 해외 결제 승인 필요",
    time: "어제 17:45",
  },
  {
    icon: "calendar",
    title: "구독 갱신 예정",
    description: "Adobe Creative Cloud · 5일 후 자동 갱신",
    time: "어제 13:20",
  },
];

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

function AlertIcon({ type }: { type: string }) {
  if (type === "warning") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <path
          d="M12 4.5 21 20H3L12 4.5Z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path d="M12 9v5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        <path d="M12 17.2h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" />
      </svg>
    );
  }

  if (type === "chart") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <path d="M6 18V11" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        <path d="M12 18V7" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        <path d="M18 18v-4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      </svg>
    );
  }

  if (type === "card") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <rect x="4" y="6" width="16" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4 10h16" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 15h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (type === "calendar") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <rect x="4" y="5" width="16" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        <path d="M8 14h.01M12 14h.01M16 14h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        d="M12 4 19 7v5.5c0 4.1-2.8 6.4-7 7.5-4.2-1.1-7-3.4-7-7.5V7l7-3Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default function AlertsPage() {
  return (
    <DashboardShell
      activeHref="/dashboard/alerts"
      title="알림 센터"
      description="2026년 6월 13일 기준"
    >
      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className={`mb-4 flex size-9 items-center justify-center rounded-lg ${stat.tone}`}>
              <span className="size-2 rounded-full bg-[#fbfbdc]" />
            </div>
            <p className="text-xs font-bold text-zinc-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-black text-[#fbfbdc]">{stat.value}</p>
            <p className="mt-2 text-xs font-semibold text-[#8290a5]">{stat.helper}</p>
          </Card>
        ))}
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-white/[0.1] px-5 py-4">
            <h2 className="text-lg font-black text-[#fbfbdc]">알림 목록</h2>
            <button type="button" className="text-xs font-bold text-zinc-400 hover:text-white">
              최신 순⌄
            </button>
          </div>

          <div>
            {alerts.map((alert) => (
              <div
                key={`${alert.title}-${alert.time}-${alert.description}`}
                className="grid gap-3 border-b border-white/[0.08] px-5 py-3.5 last:border-0 sm:grid-cols-[18px_42px_minmax(0,1fr)_72px] sm:items-center"
              >
                <span className="hidden size-4 rounded-[3px] border border-slate-600/70 bg-[#0c111a] sm:block" />
                <span className="hidden size-10 items-center justify-center rounded-lg border border-white/[0.07] bg-[#202837] text-slate-300 sm:flex">
                  <AlertIcon type={alert.icon} />
                </span>
                <div>
                  <h3 className="text-[13px] font-black leading-5 text-[#fbfbdc]">{alert.title}</h3>
                  <p className="mt-0.5 text-[11px] font-semibold leading-5 text-zinc-500">{alert.description}</p>
                </div>
                <span className="text-xs font-semibold text-zinc-500 sm:text-right">{alert.time}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 border-t border-white/[0.08] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold text-zinc-500">총 12건의 알림</p>
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
              <button type="button" className="px-2 py-1 hover:text-white">
                ‹
              </button>
              <button type="button" className="rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-white">
                1
              </button>
              <button type="button" className="px-2 py-1 hover:text-white">
                2
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
}
