import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const navItems = ["Resources", "Product", "Pricing", "Solutions"];

function SavingsChart() {
  return (
    <div className="relative min-h-[360px] w-full max-w-[580px] sm:min-h-[420px] lg:min-h-[520px]">
      <div className="absolute left-0 top-0 z-20 rounded-[18px] border border-white/10 bg-[#151820] px-5 py-5 shadow-2xl shadow-black/50 sm:left-2 sm:px-6">
        <p className="text-[10px] font-medium uppercase tracking-normal text-slate-400">
          Policy Violations
        </p>
        <div className="mt-3 flex items-end gap-7">
          <p className="text-3xl font-black leading-none text-[#fbfbdc]">24</p>
          <p className="pb-1 text-xs font-semibold text-slate-400">-12%</p>
        </div>
      </div>

      <div className="absolute right-0 top-4 w-[86%] rounded-[22px] border border-white/[0.035] bg-[#07080a]/80 px-8 py-8 shadow-2xl shadow-black/60 sm:top-3 sm:px-12">
        <div className="ml-[22%]">
          <p className="text-[10px] font-medium uppercase tracking-normal text-slate-500">
            Total Savings
          </p>
          <div className="mt-12 flex items-center gap-7">
            <p className="text-4xl font-black tracking-normal text-slate-100 sm:text-5xl">
              12,420,000{"\uC6D0"}
            </p>
            <p className="text-xs font-semibold text-[#8290a5]">+18.2%</p>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 top-24 overflow-hidden">
        <div className="absolute bottom-2 left-[9%] h-[72%] w-[76%] rounded-full bg-slate-700/20 blur-3xl" />
        <svg
          className="absolute bottom-8 left-0 h-[78%] w-full overflow-visible"
          fill="none"
          viewBox="0 0 620 380"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="lineGlow" x1="116" x2="520" y1="294" y2="62">
              <stop stopColor="#7d8da3" stopOpacity="0.72" />
              <stop offset="1" stopColor="#97a8bd" />
            </linearGradient>
            <filter
              id="softGlow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M98 314 L250 284 L376 206 L516 62"
            stroke="url(#lineGlow)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="5"
          />
          <circle
            cx="516"
            cy="62"
            r="4.5"
            fill="#a9b8cb"
            filter="url(#softGlow)"
          />
        </svg>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-[#f8f8df]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1320px] flex-col px-5 sm:px-8 lg:px-12">
        <header className="flex h-24 items-center justify-between gap-6 lg:h-28">
          <Link
            href="/"
            className="text-lg font-semibold tracking-normal text-[#fbfbdc] lg:ml-[48%]"
          >
            Aegis-Fi
          </Link>

          <nav className="hidden items-center gap-10 text-[11px] font-medium text-zinc-400 md:flex">
            {navItems.map((item) => (
              <Link
                key={item}
                href={
                  item === "Product"
                    ? "/features"
                    : item === "Solutions"
                      ? "/monitoring"
                      : "#"
                }
                className="transition hover:text-[#fbfbdc]"
              >
                {item}
              </Link>
            ))}
          </nav>

          <Button
            asChild
            className="h-12 rounded-full bg-[#8290a2] px-7 text-xs font-bold text-white shadow-lg shadow-slate-900/30 hover:bg-[#95a3b6]"
          >
            <Link href="/features">Request Demo</Link>
          </Button>
        </header>

        <section className="grid flex-1 items-center gap-14 pb-12 pt-8 md:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:pb-20 lg:pt-12">
          <div className="max-w-[560px]">
            <h1 className="text-[64px] font-black leading-[0.99] tracking-normal text-[#ffffdf] sm:text-[86px] lg:text-[96px] xl:text-[106px]">
              AI-Powered
              <br />
              Financial
              <br />
              Intelligence
            </h1>

            <p className="mt-16 max-w-[460px] text-base leading-8 text-zinc-400 sm:text-lg">
              Optimize SaaS spend, automate policy control,
              <br className="hidden sm:block" />
              and detect anomalies with AI-driven finance operations.
            </p>

            <div className="mt-12 flex flex-wrap items-center gap-4">
              <Button
                asChild
                className="h-12 rounded-full bg-[#8290a2] px-7 text-xs font-bold text-white hover:bg-[#95a3b6]"
              >
                <Link href="/features">Request Demo</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-full border-white/15 bg-black px-7 text-xs font-bold text-white hover:bg-white hover:text-black"
              >
                <Link href="/features">
                  View Dashboard
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </Button>
            </div>

            <p className="mt-28 text-[11px] font-semibold text-zinc-600">
              Trusted by modern finance teams worldwide
            </p>
          </div>

          <div className="flex justify-center md:justify-end">
            <SavingsChart />
          </div>
        </section>
      </div>
    </main>
  );
}
