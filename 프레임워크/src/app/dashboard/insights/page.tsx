import Link from "next/link";

const sidebarItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Analytics", href: "/dashboard/analytics" },
  { label: "Policies", href: "/dashboard/policies" },
  { label: "Expenses", href: "/dashboard/expenses" },
  { label: "AI Insights", href: "/dashboard/insights" },
  { label: "Settings", href: "/dashboard/settings" },
];

const kpiCards = [
  { label: "예상 절감액", value: "1,840,000원" },
  { label: "위험 알림", value: "7건" },
  { label: "AI 신뢰도", value: "94%" },
];

const reportLines = [
  "이번 달 총 지출은 지난달 대비 12% 증가했습니다.",
  "주요 원인은 AWS 사용량 증가와 중복 SaaS 구독 3건으로 분석되었습니다.",
  "현재 비용 구조는 전반적으로 안정적이며, 연간 약 184만원의 절감 가능성이 있습니다.",
];

const actionCards = [
  { title: "중복 구독 제거", label: "예상 절감액", value: "620,000원" },
  { title: "미사용 라이선스 정리", label: "예상 절감액", value: "480,000원" },
  { title: "AWS 비용 최적화", label: "예상 절감액", value: "740,000원" },
];

export default function InsightsPage() {
  return (
    <main className="min-h-screen bg-[#050608] text-[#f8f8df]">
      <section className="mx-auto grid min-h-screen w-full max-w-[1280px] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[210px_minmax(0,1fr)] lg:px-12 lg:py-14">
        <aside className="rounded-2xl border border-white/[0.06] bg-[#111722] p-6 lg:min-h-[680px]">
          <Link href="/" className="block text-xl font-bold text-[#fbfbdc]">
            Aegis-Fi
          </Link>
          <nav className="mt-10 grid gap-4 text-xs font-semibold text-zinc-500">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition hover:text-[#fbfbdc] ${
                  item.href === "/dashboard/insights" ? "text-[#fbfbdc]" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="pb-12">
          <header>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
              AI Reports
            </p>
            <h1 className="mt-5 text-[40px] font-black leading-[1.15] tracking-normal text-[#ffffdf] sm:text-[56px]">
              AI가 생성한
              <br />
              금융 운영 리포트
            </h1>
            <p className="mt-6 max-w-[620px] text-base font-medium leading-8 text-zinc-400">
              비용 패턴, 정책 위반, SaaS 사용 현황을
              <br />
              AI가 자동 분석하여 요약합니다.
            </p>
          </header>

          <section className="mt-10 grid gap-4 md:grid-cols-3">
            {kpiCards.map((card) => (
              <article
                key={card.label}
                className="rounded-2xl border border-white/[0.08] bg-[#131a25] p-6 shadow-xl shadow-black/30"
              >
                <p className="text-[10px] font-bold tracking-[0.14em] text-zinc-500">
                  {card.label}
                </p>
                <p className="mt-5 text-3xl font-black text-[#fbfbdc]">
                  {card.value}
                </p>
              </article>
            ))}
          </section>

          <article className="mt-8 rounded-2xl border border-white/[0.08] bg-[#131a25] p-7 shadow-2xl shadow-black/40 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="size-2.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.55)]" />
                <h2 className="text-xl font-black text-[#fbfbdc]">
                  이번 달 AI 분석 결과
                </h2>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-black/15 px-4 py-2 text-right">
                <p className="text-[10px] font-bold tracking-[0.14em] text-zinc-500">
                  AI Confidence
                </p>
                <p className="mt-1 text-sm font-black text-[#fbfbdc]">94%</p>
              </div>
            </div>

            <div className="mt-8 grid gap-5 text-sm font-semibold leading-8 text-zinc-300">
              {reportLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </article>

          <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {actionCards.map((card) => (
              <article
                key={card.title}
                className="rounded-2xl border border-white/[0.08] bg-[#131a25] p-6 shadow-xl shadow-black/30"
              >
                <h2 className="text-lg font-bold text-zinc-300">{card.title}</h2>
                <p className="mt-5 text-xs font-bold tracking-[0.12em] text-zinc-500">
                  {card.label}
                </p>
                <p className="mt-4 text-2xl font-black text-[#8290a5]">
                  {card.value}
                </p>
              </article>
            ))}
          </section>

          <section className="mt-8 rounded-2xl border border-white/[0.08] bg-[#131a25] px-6 py-10 text-center shadow-2xl shadow-black/40 sm:px-10">
            <h2 className="text-lg font-black text-[#fbfbdc]">
              예상 연간 절감 효과
            </h2>
            <p className="mt-8 text-[42px] font-black leading-none tracking-normal text-[#ffffdf] sm:text-[56px]">
              18,400,000원
            </p>
            <p className="mt-5 text-sm font-medium text-zinc-500">
              AI 추천 적용 시 예상 절감 금액
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
