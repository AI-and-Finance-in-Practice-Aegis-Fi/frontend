import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const monitoringCards = [
  {
    label: "Alert",
    title: "이상 결제 패턴 감지",
    description:
      "평소 대비 240% 증가한 클라우드 비용 사용량이 감지되었습니다.",
    value: "+240%",
  },
  {
    label: "Compliance",
    title: "정책 위반 자동 탐지",
    description: "허용되지 않은 SaaS 결제가 자동으로 분류되었습니다.",
    value: "32건 탐지",
  },
  {
    label: "Optimization",
    title: "AI 비용 최적화 제안",
    description: "중복 구독과 비효율 지출 항목을 AI가 자동 분석합니다.",
    value: "₩18.4M 절감",
  },
];

export default function MonitoringPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-[#f8f8df]">
      <section className="mx-auto grid min-h-screen w-full max-w-[1320px] items-center gap-14 px-5 py-20 sm:px-8 md:grid-cols-[1fr_0.95fr] lg:gap-24 lg:px-12">
        <div className="max-w-[640px]">
          <Link
            href="/"
            className="text-lg font-semibold tracking-normal text-[#fbfbdc]"
          >
            Aegis-Fi
          </Link>

          <p className="mt-20 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            Monitoring
          </p>

          <h1 className="mt-12 text-[44px] font-black leading-[1.35] tracking-normal text-[#ffffdf] sm:text-[58px] lg:text-[64px]">
            실시간 금융 운영 상태를
            <br />
            한눈에 확인하세요
          </h1>

          <p className="mt-10 max-w-[610px] text-lg font-semibold leading-9 text-slate-100 sm:text-xl">
            AI 기반 이상 탐지와 자동 정책 분석을 통해
            <br className="hidden sm:block" />
            기업의 금융 리스크를 빠르게 파악할 수 있습니다.
          </p>
        </div>

        <div className="flex w-full flex-col gap-10 md:items-end">
          {monitoringCards.map((card) => (
            <article
              key={card.label}
              className="w-full max-w-[380px] rounded-[24px] border border-white/10 bg-[#13161d] px-6 py-7 shadow-2xl shadow-black/40 sm:px-7"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                {card.label}
              </p>
              <h2 className="mt-5 text-2xl font-black leading-tight tracking-normal text-[#fbfbdc]">
                {card.title}
              </h2>
              <p className="mt-6 text-sm font-medium leading-7 text-zinc-400">
                {card.description}
              </p>
              <p className="mt-4 text-base font-bold tracking-normal text-[#8290a5]">
                {card.value}
              </p>
            </article>
          ))}

          <Button
            asChild
            className="mt-2 h-12 rounded-full bg-[#8290a2] px-7 text-xs font-bold text-white hover:bg-[#95a3b6]"
          >
            <Link href="/dashboard">
              View Dashboard
              <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
