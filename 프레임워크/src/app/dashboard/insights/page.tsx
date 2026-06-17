import { DashboardShell } from "@/components/dashboard/DashboardShell";

const stats = [
  {
    label: "월 절감 가능 금액",
    value: "₩1,840,000",
    helper: "전년 대비 15.6% 비용 효율 개선",
    tone: "bg-rose-300/10 text-rose-200",
    icon: "wallet",
  },
  {
    label: "위험 활동",
    value: "7건",
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

const insights = [
  {
    title: "이번 달 지출은 지난달 대비 12% 증가했습니다.",
    description: "특히 SaaS 구독 및 클라우드 비용 증가가 주요 원인입니다.",
  },
  {
    title: "주요 원인은 AWS 사용량 증가와 중복 SaaS 구독 3건으로 분석되었습니다.",
    description: "",
  },
  {
    title: "현재 비용 구조는 전반적으로 안정적이며, 연간 약 184만원의 절감 가능성이 있습니다.",
    description: "",
  },
];

const factors = [
  { label: "AWS 사용량 증가", value: "45%", color: "#f3cbd3" },
  { label: "SaaS 중복 구독", value: "30%", color: "#8fc5d4" },
  { label: "기타", value: "25%", color: "#f4eecb" },
];

const recommendations = [
  {
    title: "Salesforce → 즉시 조치 권장",
    body:
      "80석 중 65석이 30일 이상 미접속 상태입니다. 현행 15석 수준으로 다운그레이드 시 월 7,200,000원, 연간 86,400,000원 절감 가능합니다.",
    pills: ["미사용 50석"],
    accent: "border-l-[#f3cbd3]",
  },
  {
    title: "Salesforce → 갱신 조치 권장",
    body:
      "150석 구매 대비 실사용은 51석(34%)입니다. 60석으로 축소 시 월 1,280,000원 절감 가능합니다. 단, 갱신일(6/19)이 6일 후로 즉시 결정이 필요합니다.",
    pills: ["실사용 51석", "갱신일 D-6"],
    accent: "border-l-[#8fc5d4]",
  },
];

const savings = [
  { title: "중복 구독 제거", label: "예상 절감액", value: "₩620,000", helper: "중복 3건", tone: "bg-rose-300/10" },
  { title: "미사용 라이선스 정리", label: "예상 절감액", value: "₩480,000", helper: "미사용 9건", tone: "bg-cyan-300/10" },
  { title: "AWS 비용 최적화", label: "예상 절감액", value: "₩740,000", helper: "과다 사용 5건", tone: "bg-slate-300/10" },
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

function StatIcon({ type }: { type: string }) {
  if (type === "alert") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <path
          d="M12 4.5 21 20H3L12 4.5Z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path d="M12 9v5M12 17h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (type === "check") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="m8.5 12 2.3 2.3 4.9-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <rect x="4" y="7" width="16" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 12h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

export default function InsightsPage() {
  return (
    <DashboardShell
      activeHref="/dashboard/insights"
      title="AI 금융 운영 리포트"
      description="GPT-4o 기반 개인화 분석 · 2026년 6월 13일 생성 · 비용 패턴, 정책 위반, SaaS 사용 현황을 AI가 자동 분석하여 요약합니다."
    >
      <section className="mt-7 grid gap-4 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-zinc-500">{stat.label}</p>
                <p className="mt-3 text-3xl font-black text-[#fbfbdc]">{stat.value}</p>
                <p className="mt-3 text-xs font-semibold text-zinc-500">{stat.helper}</p>
              </div>
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${stat.tone}`}>
                <StatIcon type={stat.icon} />
              </span>
            </div>
          </Card>
        ))}
      </section>

      <Card className="mt-6 p-6">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:divide-x lg:divide-white/10">
          <div className="lg:pr-8">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#f3cbd3]" />
              <h2 className="text-lg font-black text-[#fbfbdc]">이번 달 핵심 인사이트</h2>
            </div>
            <div className="mt-7 grid gap-6">
              {insights.map((item) => (
                <div key={item.title} className="grid grid-cols-[36px_minmax(0,1fr)] gap-4">
                  <span className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-[#141b27] text-xs text-[#8290a5]">
                    ◎
                  </span>
                  <div>
                    <p className="text-sm font-semibold leading-7 text-zinc-300">{item.title}</p>
                    {item.description ? <p className="mt-1 text-sm leading-7 text-zinc-500">{item.description}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:pl-8">
            <h2 className="text-base font-black text-[#fbfbdc]">지출 증가 요인 분석</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
              <svg viewBox="0 0 220 140" className="h-36 w-full" role="img" aria-label="지출 증가 요인 반원형 차트">
                <path d="M35 115a75 75 0 0 1 150 0" fill="none" stroke="#253244" strokeWidth="28" strokeLinecap="butt" />
                <path d="M35 115a75 75 0 0 1 72-74" fill="none" stroke="#f3cbd3" strokeWidth="28" strokeLinecap="butt" />
                <path d="M107 41a75 75 0 0 1 57 31" fill="none" stroke="#8fc5d4" strokeWidth="28" strokeLinecap="butt" />
                <path d="M164 72a75 75 0 0 1 21 43" fill="none" stroke="#f4eecb" strokeWidth="28" strokeLinecap="butt" />
              </svg>
              <div className="grid gap-3">
                {factors.map((factor) => (
                  <div key={factor.label} className="grid grid-cols-[10px_1fr_42px] items-center gap-3 text-xs font-semibold">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: factor.color }} />
                    <span className="text-zinc-400">{factor.label}</span>
                    <span className="text-zinc-300">{factor.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <button type="button" className="mt-5 text-xs font-bold text-[#8290a5] hover:text-white">
              자세히 보기 ›
            </button>
          </div>
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#f3cbd3]" />
              <h2 className="text-lg font-black text-[#fbfbdc]">SaaS 구독 최적화 요약</h2>
            </div>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-zinc-300">
              현재 47개 구독 서비스 중 9개(19.1%)가 30일 이상 미사용 상태로 확인되었습니다.
              <br />
              가장 즉각적인 절감 효과를 낼 수 있는 항목은 다음과 같습니다.
            </p>
          </div>
          <span className="w-fit rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-right text-[11px] font-bold text-zinc-400">
            AI Confidence
            <br />
            <span className="text-[#fbfbdc]">94%</span>
          </span>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {recommendations.map((item) => (
            <article key={item.title} className={`rounded-xl border border-white/10 border-l-4 bg-black/15 p-5 ${item.accent}`}>
              <h3 className="text-sm font-black text-[#fbfbdc]">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-zinc-500">{item.body}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {item.pills.map((pill) => (
                  <span key={pill} className="rounded-md bg-white/10 px-3 py-1.5 text-[11px] font-bold text-zinc-300">
                    {pill}
                  </span>
                ))}
                <button type="button" className="ml-auto rounded-md border border-white/10 px-3 py-1.5 text-[11px] font-bold text-zinc-400 hover:text-white">
                  조치 가이드 보기 ›
                </button>
              </div>
            </article>
          ))}
        </div>
      </Card>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        {savings.map((item) => (
          <Card key={item.title} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-black text-[#fbfbdc]">{item.title}</h2>
                <p className="mt-3 text-xs font-bold text-zinc-500">{item.label}</p>
                <p className="mt-2 text-3xl font-black text-[#fbfbdc]">{item.value}</p>
                <p className="mt-3 text-xs font-semibold text-zinc-500">{item.helper}</p>
              </div>
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${item.tone}`}>
                <span className="size-3 rounded-full bg-[#8290a5]" />
              </span>
            </div>
          </Card>
        ))}
      </section>

      <div className="mt-5 flex flex-col gap-3 text-xs font-semibold text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
        <p>AI 분석은 참고 정보이며, 실제 의사결정은 담당자의 검토가 필요합니다.</p>
        <button type="button" className="text-[#8290a5] hover:text-white">
          리포트 다운로드
        </button>
      </div>
    </DashboardShell>
  );
}
