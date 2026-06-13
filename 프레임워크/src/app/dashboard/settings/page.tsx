"use client";

import { useState } from "react";
import Link from "next/link";

const sidebarItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Analytics", href: "/dashboard/analytics" },
  { label: "Policies", href: "/dashboard/policies" },
  { label: "Expenses", href: "/dashboard/expenses" },
  { label: "AI Insights", href: "/dashboard/insights" },
  { label: "Settings", href: "/dashboard/settings" },
];

const productLinks = ["Features", "Analytics", "AI Insights", "Pricing"];
const companyLinks = ["About", "Contact", "Security", "Careers"];

const settingCards = [
  {
    title: "Company Profile",
    rows: [
      ["회사명", "Aegis-Fi Demo Corp"],
      ["기본 통화", "KRW"],
      ["월간 예산", "\u20A9125,000,000"],
    ],
  },
  {
    title: "Policy Settings",
    rows: [
      ["예산 초과 알림", "80%"],
      ["고액 결제 기준", "\u20A9500,000"],
      ["이상 지출 감지", "평소 대비 200%"],
    ],
  },
];

type NotificationKey =
  | "policyAlert"
  | "budgetAlert"
  | "renewalAlert"
  | "weeklyReport";

const notificationItems: Array<{
  key: NotificationKey;
  label: string;
}> = [
  { key: "policyAlert", label: "정책 위반 알림" },
  { key: "budgetAlert", label: "예산 초과 알림" },
  { key: "renewalAlert", label: "SaaS 갱신 알림" },
  { key: "weeklyReport", label: "주간 리포트 이메일" },
];

export default function SettingsPage() {
  const [notifications, setNotifications] = useState<
    Record<NotificationKey, boolean>
  >({
    policyAlert: true,
    budgetAlert: true,
    renewalAlert: true,
    weeklyReport: false,
  });

  function toggleNotification(key: NotificationKey) {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  return (
    <main className="min-h-screen bg-[#050608] text-[#f8f8df]">
      <section className="mx-auto grid min-h-screen w-full max-w-[1280px] px-5 py-10 sm:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-12 lg:py-14">
        <aside className="mb-8 rounded-2xl border border-white/[0.06] bg-[#131a25] p-6 lg:mb-0 lg:min-h-[640px] lg:rounded-r-none">
          <Link href="/" className="block text-xl font-bold tracking-normal text-[#fbfbdc]">
            Aegis-Fi
          </Link>
          <nav className="mt-10 grid gap-4 text-xs font-semibold text-zinc-500">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition hover:text-[#fbfbdc] ${
                  item.href === "/dashboard/settings" ? "text-[#fbfbdc]" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="rounded-2xl border border-white/[0.06] bg-[#0b0d11] p-6 shadow-2xl shadow-black/50 sm:p-8 lg:rounded-l-none lg:p-10">
          <header>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Settings
            </p>
            <h1 className="mt-6 text-4xl font-black leading-tight tracking-normal text-[#ffffdf] sm:text-5xl">
              Aegis-Fi 운영 설정
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-zinc-400">
              기업 재무 운영 기준, 정책 관리, 알림 설정을 한 곳에서 관리하세요.
            </p>
          </header>

          <section className="mt-12 rounded-2xl border border-white/[0.08] bg-[#080a0e] px-7 py-9 sm:px-10">
            <div className="grid gap-12 lg:grid-cols-[1fr_0.7fr] lg:items-start">
              <div>
                <h2 className="text-3xl font-black tracking-[0.08em] text-[#fbfbdc]">
                  Aegis-Fi
                </h2>
                <p className="mt-8 max-w-md text-sm font-medium leading-8 tracking-[0.08em] text-zinc-500">
                  AI-powered financial operations platform
                  <br />
                  for modern enterprise teams.
                </p>
              </div>

              <div className="grid gap-10 sm:grid-cols-2">
                <div>
                  <h3 className="text-xs font-bold tracking-[0.14em] text-[#fbfbdc]">
                    Product
                  </h3>
                  <div className="mt-6 grid gap-3 text-sm font-medium text-zinc-500">
                    {productLinks.map((item) => (
                      <a key={item} href="#" className="transition hover:text-[#fbfbdc]">
                        {item}
                      </a>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold tracking-[0.14em] text-[#fbfbdc]">
                    Company
                  </h3>
                  <div className="mt-6 grid gap-3 text-sm font-medium text-zinc-500">
                    {companyLinks.map((item) => (
                      <a key={item} href="#" className="transition hover:text-[#fbfbdc]">
                        {item}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-white/20 pt-5">
              <p className="text-xs font-medium tracking-[0.08em] text-zinc-600">
                © 2026 Aegis-Fi. All rights reserved.
              </p>
            </div>
          </section>

          <section className="mt-8 grid gap-5 xl:grid-cols-3">
            {settingCards.map((card) => (
              <article
                key={card.title}
                className="rounded-2xl border border-white/[0.08] bg-[#131a25] p-6 shadow-xl shadow-black/30"
              >
                <h2 className="text-lg font-black text-[#fbfbdc]">{card.title}</h2>
                <div className="mt-6 grid gap-4">
                  {card.rows.map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-3 text-sm last:border-b-0 last:pb-0"
                    >
                      <span className="font-medium text-zinc-500">{label}</span>
                      <span className="text-right font-bold text-[#8290a5]">{value}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}

            <article className="rounded-2xl border border-white/[0.08] bg-[#131a25] p-6 shadow-xl shadow-black/30">
              <h2 className="text-lg font-black text-[#fbfbdc]">Notification</h2>
              <div className="mt-6 grid gap-4">
                {notificationItems.map((item) => {
                  const enabled = notifications[item.key];

                  return (
                    <div
                      key={item.key}
                      className="border-b border-white/[0.06] pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-zinc-400">
                          {item.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleNotification(item.key)}
                          className={`min-w-16 rounded-full px-4 py-1.5 text-xs font-bold text-white transition hover:opacity-85 ${
                            enabled ? "bg-blue-500" : "bg-red-500"
                          }`}
                        >
                          {enabled ? "ON" : "OFF"}
                        </button>
                      </div>
                      <p className="mt-2 text-xs font-medium text-zinc-600">
                        현재 상태: {enabled ? "활성화됨" : "비활성화됨"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}
