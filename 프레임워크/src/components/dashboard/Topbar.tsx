"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Activity = { title: string; time: string };

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}시간 전`;
  return `${Math.floor(hrs / 24)}일 전`;
}

function auditTitle(eventType: string, eventData: Record<string, unknown>): string {
  const merchant = String(eventData.merchant_name ?? "");
  const amount = Number(eventData.amount ?? 0).toLocaleString("ko-KR");
  const category = String(eventData.category ?? "");
  if (eventType === "TRANSACTION_APPROVED") return `${merchant} 결제 ${amount}원 승인`;
  if (eventType === "TRANSACTION_BLOCKED") return `${merchant} ${category} 결제 차단`;
  return eventType;
}

type TopbarProps = {
  title: string;
  description: string;
};

export function Topbar({ title, description }: TopbarProps) {
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [badgeCount, setBadgeCount] = useState(0);

  useEffect(() => {
    fetch("/api/v1/audit-log?limit=6")
      .then((r) => r.json())
      .then((logs: Array<{ event_type: string; event_data: Record<string, unknown>; created_at: string }>) => {
        setActivities(
          logs.map((l) => ({
            title: auditTitle(l.event_type, l.event_data),
            time: relativeTime(l.created_at),
          })),
        );
        setBadgeCount(logs.filter((l) => l.event_type === "TRANSACTION_BLOCKED").length);
      })
      .catch(() => {});
  }, []);

  return (
    <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-3xl font-black text-[#fbfbdc]">{title}</h1>
        <p className="mt-2 text-sm font-medium text-zinc-500">{description}</p>
      </div>
      <div className="relative flex shrink-0 items-center gap-3">
        <button
          type="button"
          className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-[#111722] px-4 text-sm font-black text-slate-200 shadow-xl shadow-black/25 transition hover:bg-[#151d2a] sm:h-14 sm:px-5 sm:text-base"
        >
          <span className="relative flex size-3 items-center justify-center rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.8)]">
            <span className="absolute size-6 rounded-full bg-emerald-400/25 blur-sm" />
          </span>
          실시간 동기화
        </button>
        <button
          type="button"
          aria-label="알림"
          aria-expanded={isActivityOpen}
          onClick={() => setIsActivityOpen((prev) => !prev)}
          className="relative flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-[#111722] text-slate-200 shadow-xl shadow-black/25 transition hover:bg-[#151d2a] sm:size-14"
        >
          {badgeCount > 0 && (
            <span className="absolute -right-2 -top-2 flex size-[22px] items-center justify-center rounded-full bg-[#f1d9df] text-xs font-black text-[#141018]">
              {badgeCount}
            </span>
          )}
          <svg viewBox="0 0 32 32" className="size-7 sm:size-8" aria-hidden="true">
            <path
              d="M9 23h14M11 23V13a5 5 0 0 1 10 0v10M14 26a2 2 0 0 0 4 0"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            />
            <path d="M16 6v2" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
          </svg>
        </button>

        {isActivityOpen ? (
          <div className="absolute right-0 top-[72px] z-50 w-[calc(100vw-32px)] max-w-[420px] rounded-[28px] border border-white/10 bg-[#4b4f54] px-7 py-6 text-white shadow-2xl shadow-black/50">
            <span className="absolute -top-3 right-8 size-7 rotate-45 rounded-sm bg-[#4b4f54]" />
            <div className="relative flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">최근 활동</h2>
              <button type="button" className="text-sm font-semibold text-white/70 transition hover:text-white">
                모두 읽음
              </button>
            </div>

            <ul className="relative mt-5">
              {activities.length === 0 ? (
                <li className="py-3 text-sm text-white/50">활동 내역을 불러오는 중...</li>
              ) : (
                activities.map((activity) => (
                  <li key={`${activity.title}-${activity.time}`} className="grid grid-cols-[minmax(0,1fr)_18px] gap-4 border-b border-white/10 py-3">
                    <div>
                      <p className="truncate text-[15px] font-semibold leading-6 text-white/90">
                        {activity.title}
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-white/50">{activity.time}</p>
                    </div>
                    <span className="mt-2 size-3 rounded-full bg-pink-100/80 shadow-[0_0_10px_rgba(255,228,230,0.9)] blur-[1px]" />
                  </li>
                ))
              )}
            </ul>

            <div className="relative mt-5 border-t border-white/10 pt-5 text-center">
              <Link href="/dashboard/alerts" className="text-sm font-semibold text-white/80 transition hover:text-white">
                전체 활동 보기 〉
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
