"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const groups = [
  {
    label: "Overview",
    items: [
      { label: "대시보드", href: "/dashboard" },
      { label: "알림 센터", href: "/dashboard/alerts" },
    ],
  },
  {
    label: "관리",
    items: [
      { label: "SaaS 구독 관리", href: "/dashboard/saas" },
      { label: "법인카드 결제", href: "/dashboard/expenses" },
      { label: "감사 로그", href: "/dashboard/audit" },
    ],
  },
  {
    label: "분석",
    items: [
      { label: "AI 리포트", href: "/dashboard/insights" },
      { label: "정책 설정", href: "/dashboard/settings" },
    ],
  },
];

type SidebarProps = {
  activeHref?: string;
};

export function Sidebar({ activeHref }: SidebarProps) {
  const pathname = usePathname();
  const currentPath = pathname || activeHref || "/dashboard";

  return (
    <aside className="min-h-screen border-b border-white/10 bg-[#080d1a] px-6 py-7 lg:w-[196px] lg:border-b-0 lg:border-r">
      <Link href="/dashboard" className="block">
        <span className="block font-serif text-[19px] font-semibold tracking-normal text-[#fbfbdc]">
          Aegis-Fi
        </span>
        <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.24em] text-slate-500">
          AI CFO Platform
        </span>
      </Link>

      <div className="mt-6 h-px bg-white/10" />

      <nav className="mt-7">
        {groups.map((group, groupIndex) => (
          <div key={group.label} className={groupIndex === 0 ? "" : "mt-8"}>
            <p className="px-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-600">
              {group.label}
            </p>
            <div className="mt-3 space-y-1">
              {group.items.map((item) => {
                const active =
                  item.href === "/dashboard"
                    ? currentPath === item.href
                    : currentPath.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-md border px-3 py-2 text-[13px] font-semibold transition ${
                      active
                        ? "border-white/20 bg-white/5 text-white"
                        : "border-transparent text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
