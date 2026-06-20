"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type AlertType = "danger" | "caution" | "info";
type AlertIconType = "shield" | "warning" | "chart" | "card" | "calendar";

export interface AlertItem {
  icon: AlertIconType;
  title: string;
  description: string;
  time: string;
  type: AlertType;
}

const filterTypes = ["전체", "위험", "주의", "정보"];
const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
const serviceOptions = ["전체 서비스", "SaaS", "법인카드", "감사 로그"];
const periodOptions = ["전체 기간", "오늘", "최근 7일", "최근 30일"];

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <article className={`rounded-2xl border border-white/10 bg-[#111722] shadow-2xl shadow-black/30 ${className}`}>
      {children}
    </article>
  );
}

function AlertIcon({ type }: { type: AlertIconType }) {
  return (
    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#202734] text-slate-300">
      {type === "shield" ? (
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
          <path
            d="M12 4 19 7v5.5c0 4-2.7 6.4-7 7.5-4.3-1.1-7-3.5-7-7.5V7l7-3Z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.9"
          />
        </svg>
      ) : null}
      {type === "warning" ? (
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
          <path
            d="M12 4.5 21 20H3L12 4.5Z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.9"
          />
          <path d="M12 9.5v4.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" />
          <path d="M12 17.2h.01" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" />
        </svg>
      ) : null}
      {type === "chart" ? (
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
          <path d="M6 18V12" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
          <path d="M12 18V7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
          <path d="M18 18v-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
        </svg>
      ) : null}
      {type === "card" ? (
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
          <rect
            x="4"
            y="6.5"
            width="16"
            height="11"
            rx="2"
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.9"
          />
          <path d="M4 10h16" fill="none" stroke="currentColor" strokeWidth="1.9" />
          <path d="M8 14.5h4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" />
        </svg>
      ) : null}
      {type === "calendar" ? (
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
          <rect
            x="4"
            y="5.5"
            width="16"
            height="14.5"
            rx="2"
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.9"
          />
          <path d="M8 3.5v4M16 3.5v4M4 10h16" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" />
          <path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
        </svg>
      ) : null}
    </span>
  );
}

export default function AlertsClient({ alerts }: { alerts: AlertItem[] }) {
  const [pendingFilter, setPendingFilter] = useState(0);
  const [activeFilter, setActiveFilter] = useState(0);
  const [selectedService, setSelectedService] = useState("전체 서비스");
  const [selectedPeriod, setSelectedPeriod] = useState("전체 기간");

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayDate = today.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const monthLabel = `${year}년 ${month + 1}월`;

  const filteredAlerts = useMemo(() => {
    if (activeFilter === 0) return alerts;
    const typeMap: Record<number, AlertType> = { 1: "danger", 2: "caution", 3: "info" };
    return alerts.filter((a) => a.type === typeMap[activeFilter]);
  }, [alerts, activeFilter]);

  const handleApplyFilter = () => {
    setActiveFilter(pendingFilter);
  };

  const handleReset = () => {
    setPendingFilter(0);
    setActiveFilter(0);
    setSelectedService("전체 서비스");
    setSelectedPeriod("전체 기간");
  };

  return (
    <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="overflow-hidden">
        <div className="border-b border-white/10 px-5 py-5">
          <h2 className="text-xl font-black text-[#ffffe3]">알림 목록</h2>
        </div>

        <div>
          {filteredAlerts.map((alert, idx) => (
            <div
              key={`${alert.title}-${idx}`}
              className="flex min-h-[78px] flex-col gap-3 border-b border-white/10 px-5 py-4 last:border-0 sm:flex-row sm:items-center"
            >
              <span className="hidden size-4 shrink-0 rounded-sm border border-white/20 bg-black/10 sm:block" />
              <AlertIcon type={alert.icon} />
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-black leading-6 text-[#ffffe3]">{alert.title}</h3>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">{alert.description}</p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-slate-400 sm:w-20 sm:text-right">
                {alert.time}
              </span>
            </div>
          ))}
          {filteredAlerts.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-zinc-500">알림이 없습니다.</div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-400">총 {filteredAlerts.length}건의 알림</p>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <button type="button" className="px-2 py-1 hover:text-white">
              ‹
            </button>
            <button type="button" className="rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-white">
              1
            </button>
            <button type="button" className="px-2 py-1 hover:text-white">
              ›
            </button>
          </div>
        </div>
      </Card>

      <aside className="grid gap-5 self-start">
        {/* 필터 카드 */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[#fbfbdc]">필터</h2>
            <button type="button" onClick={handleReset} className="text-xs font-bold text-[#8290a5]">
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
                  onClick={() => setPendingFilter(index)}
                  className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${
                    pendingFilter === index
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
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="mt-2 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 py-3 text-sm font-semibold text-zinc-400 outline-none"
            >
              {serviceOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-[#111722]">
                  {opt}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 block">
            <span className="text-xs font-bold text-zinc-500">기간</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="mt-2 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 py-3 text-sm font-semibold text-zinc-400 outline-none"
            >
              {periodOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-[#111722]">
                  {opt}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={handleApplyFilter}
            className="mt-5 w-full rounded-lg bg-[#8290a5] px-4 py-3 text-sm font-black text-[#050608] transition hover:bg-[#a3afc1]"
          >
            필터 적용
          </button>
        </Card>

        {/* 알림 캘린더 */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[#fbfbdc]">알림 캘린더</h2>
            <span className="text-xs font-bold text-[#8290a5]">{monthLabel}</span>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center">
            {weekDays.map((day) => (
              <span key={day} className="py-1 text-[10px] font-bold text-zinc-600">
                {day}
              </span>
            ))}
            {calendarCells.map((day, index) => (
              <span
                key={`${day ?? "empty"}-${index}`}
                className={`flex aspect-square items-center justify-center rounded-md text-[11px] font-bold ${
                  day === todayDate
                    ? "bg-[#8290a5] text-[#050608]"
                    : day
                      ? "bg-black/20 text-zinc-500"
                      : "text-transparent"
                }`}
              >
                {day ?? "."}
              </span>
            ))}
          </div>
        </Card>

        {/* 알림 설정 카드 */}
        <Card className="p-5">
          <Link href="/dashboard/settings/notifications" className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-[#fbfbdc]">알림 설정</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                알림 수신 방법 및 환경을 설정하세요
              </p>
            </div>
            <span className="text-xl font-light text-[#8290a5]">›</span>
          </Link>
        </Card>
      </aside>
    </section>
  );
}
