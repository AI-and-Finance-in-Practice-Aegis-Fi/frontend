import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const kpiCards = [
  {
    label: "Monthly Savings",
    value: "84.2M\uC6D0",
    change: "+24%",
  },
  {
    label: "Active Policies",
    value: "128",
  },
  {
    label: "Risk Alerts",
    value: "07",
  },
];

function AnalyticsChart() {
  return (
    <svg
      className="absolute inset-x-6 bottom-7 h-[58%] w-[calc(100%-3rem)] overflow-visible sm:inset-x-8 sm:w-[calc(100%-4rem)]"
      fill="none"
      viewBox="0 0 420 180"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="featureLine" x1="44" x2="346" y1="138" y2="46">
          <stop stopColor="#728197" stopOpacity="0.74" />
          <stop offset="1" stopColor="#a0afc4" />
        </linearGradient>
        <filter
          id="featureGlow"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M42 142 L132 130 L230 106 L310 68 L356 22"
        stroke="url(#featureLine)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.2"
      />
      <circle
        cx="356"
        cy="22"
        r="3.8"
        fill="#a7b6ca"
        filter="url(#featureGlow)"
      />
    </svg>
  );
}

export function FeatureShowcase() {
  return (
    <section className="mx-auto grid min-h-screen w-full max-w-[1320px] items-center gap-14 px-5 py-20 sm:px-8 md:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-12 lg:py-20">
      <div className="max-w-[520px]">
        <Link
          href="/"
          className="text-lg font-semibold tracking-normal text-[#fbfbdc]"
        >
          Aegis-Fi
        </Link>
        <p className="mt-16 text-[10px] font-semibold uppercase tracking-normal text-zinc-600">
          Features
        </p>
        <h1 className="mt-10 text-[48px] font-black leading-[1.12] tracking-normal text-slate-100 sm:text-[64px] lg:text-[72px]">
          AI finance
          <br />
          operations
          <br />
          built for scale
        </h1>
        <p className="mt-8 max-w-[430px] text-base font-medium leading-6 text-zinc-400 sm:text-lg">
          Automate compliance, monitor spend,
          <br className="hidden sm:block" />
          and gain real-time financial intelligence
          <br className="hidden sm:block" />
          through AI-powered workflows.
        </p>

        <Button
          asChild
          className="mt-12 h-12 rounded-full bg-[#8290a2] px-7 text-xs font-bold text-white hover:bg-[#95a3b6]"
        >
          <Link href="/monitoring">
            Monitoring
            <ArrowUpRight className="size-3.5" />
          </Link>
        </Button>
      </div>

      <div className="relative min-h-[590px] w-full">
        <div className="absolute right-0 top-0 h-[390px] w-full rounded-[26px] border border-white/[0.035] bg-[#07080a]/90 shadow-2xl shadow-black/60 md:w-[88%]">
          <div className="absolute right-8 top-14 flex w-[150px] flex-col gap-4 sm:right-14 sm:w-[170px]">
            {kpiCards.map((card) => (
              <div
                key={card.label}
                className="rounded-[18px] border border-white/10 bg-[#171b24] px-5 py-5 text-center shadow-xl shadow-black/30"
              >
                <p className="text-[9px] font-semibold uppercase tracking-normal text-slate-400">
                  {card.label}
                </p>
                <p className="mt-3 text-2xl font-black leading-none text-[#fbfbdc] sm:text-3xl">
                  {card.value}
                </p>
                {card.change ? (
                  <p className="mt-3 text-xs font-semibold text-[#8290a5]">
                    {card.change}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-0 h-[220px] w-[78%] min-w-[290px] overflow-hidden rounded-[20px] border border-white/10 bg-[#151b27] px-6 py-6 shadow-2xl shadow-black/50 sm:h-[240px] sm:px-8 md:w-[70%]">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-sm font-semibold text-white">
              Spend Analytics
            </h2>
            <p className="text-xs font-semibold text-[#6f7c91]">+18.2%</p>
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_58%,rgba(103,116,137,0.22),transparent_38%)]" />
          <AnalyticsChart />
        </div>

        <div className="absolute bottom-[164px] right-0 w-[220px] rounded-[18px] border border-white/10 bg-[#171b24] px-5 py-5 shadow-2xl shadow-black/40 sm:right-[-10px]">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#8290a5] shadow-[0_0_14px_rgba(130,144,165,0.9)]" />
            <p className="text-xs font-semibold uppercase tracking-normal text-slate-400">
              AI Insight
            </p>
          </div>
          <p className="mt-4 text-xs font-medium leading-4 text-white">
            Unusual spend spike detected in cloud usage
          </p>
        </div>
      </div>
    </section>
  );
}
