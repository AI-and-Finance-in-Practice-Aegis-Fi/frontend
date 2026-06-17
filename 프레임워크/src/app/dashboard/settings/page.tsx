"use client";

import { useState } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";

type NotificationKey =
  | "policyAlert"
  | "budgetAlert"
  | "renewalAlert"
  | "weeklyReport";

const departments = [
  {
    name: "영업팀",
    monthlyLimit: "5,000,000원",
    singleLimit: "700,000원",
    usage: "3,240,000원",
    percent: 64,
    policy: "접대, 주류",
    approval: "AI 자동",
  },
  {
    name: "마케팅팀",
    monthlyLimit: "8,000,000원",
    singleLimit: "700,000원",
    usage: "5,120,000원",
    percent: 64,
    policy: "개인쇼핑",
    approval: "AI 자동",
  },
  {
    name: "개발팀",
    monthlyLimit: "12,000,000원",
    singleLimit: "3,000,000원",
    usage: "8,420,000원",
    percent: 70,
    policy: "-",
    approval: "AI 자동",
  },
  {
    name: "인사팀",
    monthlyLimit: "3,000,000원",
    singleLimit: "500,000원",
    usage: "1,450,000원",
    percent: 48,
    policy: "교육/도서",
    approval: "수동 승인",
  },
  {
    name: "경영지원팀",
    monthlyLimit: "6,000,000원",
    singleLimit: "1,000,000원",
    usage: "2,780,000원",
    percent: 46,
    policy: "교통",
    approval: "AI 자동",
  },
];

const categories = [
  { name: "게임", status: "제한", policy: "허용되지 않음", teams: "영업팀 +2" },
  { name: "주류", status: "조건부", policy: "접대 목적만 허용", teams: "영업팀, 경영지원팀" },
  { name: "개인쇼핑", status: "제한", policy: "허용되지 않음", teams: "마케팅팀" },
  { name: "교육/도서", status: "허용", policy: "영수증 필수 첨부", teams: "인사팀, 개발팀" },
  { name: "교통", status: "허용", policy: "일반 교통비 허용", teams: "전체 부서" },
  { name: "숙박", status: "조건부", policy: "출장 시에만 허용", teams: "전체 부서" },
];

const approvalSteps = [
  {
    title: "AI 자동 승인",
    description: "정책 위반 없고 사전 승인 기준 이하",
    mode: "자동",
  },
  {
    title: "1차 승인",
    description: "팀장 승인 (500,000원 이상)",
    mode: "수동",
  },
  {
    title: "2차 승인",
    description: "부장 승인 (2,000,000원 이상)",
    mode: "수동",
  },
  {
    title: "최종 승인",
    description: "CFO 또는 임원 승인",
    mode: "자동",
  },
];

const notificationItems: Array<{ key: NotificationKey; label: string }> = [
  { key: "policyAlert", label: "정책 위반 알림" },
  { key: "budgetAlert", label: "예산 초과 알림" },
  { key: "renewalAlert", label: "SaaS 갱신 알림" },
  { key: "weeklyReport", label: "주간 리포트 이메일" },
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

function progressColor(value: number) {
  if (value >= 70) return "bg-[#f1cbd3]";
  if (value >= 40) return "bg-[#d7b6bd]";
  return "bg-[#7f9dbb]";
}

function statusClass(status: string) {
  if (status === "제한") return "text-rose-300";
  if (status === "조건부") return "text-amber-200";
  return "text-emerald-300";
}

export default function SettingsPage() {
  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({
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
    <DashboardShell
      activeHref="/dashboard/settings"
      title="정책 설정"
      description="2026년 6월 13일 기준"
    >
      <Card className="mt-7 overflow-hidden p-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-[#141b27] text-[#8290a5]">
                <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                  <path
                    d="M12 4 19 7v5.5c0 4.1-2.8 6.4-7 7.5-4.2-1.1-7-3.4-7-7.5V7l7-3Z"
                    fill="none"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                </svg>
              </span>
              <p className="text-sm font-black text-[#fbfbdc]">정책 관리 인사이트</p>
            </div>
            <h2 className="mt-5 text-2xl font-black text-[#fbfbdc] sm:text-3xl">
              정책으로 비용을 효율적으로 관리하세요
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
              부서별 지출 한도, 카테고리 정책, 승인 흐름을 설정하여
              <br />
              예산을 통제하고 리스크를 최소화할 수 있습니다.
            </p>
            <button type="button" className="mt-6 text-xs font-bold text-[#8fc5d4] hover:text-white">
              정책 가이드 보기 ›
            </button>
          </div>

          <div className="relative mx-auto flex h-52 w-full max-w-[320px] items-center justify-center">
            <div className="absolute left-6 top-8 h-9 w-16 rounded-lg border border-[#8fc5d4]/25 bg-black/20" />
            <div className="absolute right-10 top-7 h-12 w-12 rounded-lg border border-[#8fc5d4]/25 bg-black/20" />
            <div className="absolute bottom-8 left-10 h-12 w-12 rounded-lg border border-[#8fc5d4]/25 bg-black/20" />
            <div className="absolute bottom-10 right-8 h-12 w-12 rounded-lg border border-[#8fc5d4]/25 bg-black/20" />
            <div className="absolute bottom-3 h-10 w-44 rounded-[50%] bg-[#8fc5d4]/10 blur-sm" />
            <div className="relative flex size-28 items-center justify-center rounded-[2rem] border border-[#8fc5d4]/40 bg-[#17313a] shadow-[0_0_45px_rgba(143,197,212,0.25)]">
              <svg viewBox="0 0 80 88" className="size-20 text-[#9de1dc]" aria-hidden="true">
                <path
                  d="M40 6 67 18v24c0 18-11 30-27 39C24 72 13 60 13 42V18L40 6Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                />
                <path d="m27 43 9 9 18-22" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" />
              </svg>
            </div>
          </div>
        </div>
      </Card>

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-white/[0.08] px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-black text-[#fbfbdc]">부서별 한도 설정</h2>
            <p className="mt-2 text-sm text-zinc-500">
              각 부서의 월간 사용 한도와 1회 한도, 적용 정책을 설정할 수 있습니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs font-bold text-zinc-400">
              2026년 6월
            </button>
            <button type="button" className="rounded-lg bg-[#f1d9df] px-3 py-2 text-xs font-black text-[#130b10]">
              + 부서 추가
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-white/[0.08] text-xs text-zinc-500">
              <tr>
                <th className="px-5 py-4 font-semibold">부서</th>
                <th className="px-4 py-4 font-semibold">월 한도</th>
                <th className="px-4 py-4 font-semibold">1회 한도</th>
                <th className="px-4 py-4 font-semibold">사용 현황</th>
                <th className="px-4 py-4 font-semibold">정책 적용</th>
                <th className="px-4 py-4 font-semibold">승인 방식</th>
                <th className="px-5 py-4 text-right font-semibold">관리</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((row) => (
                <tr key={row.name} className="border-b border-white/[0.06] last:border-0">
                  <td className="px-5 py-4 font-semibold text-[#fbfbdc]">{row.name}</td>
                  <td className="px-4 py-4 text-zinc-400">{row.monthlyLimit}</td>
                  <td className="px-4 py-4 text-zinc-400">{row.singleLimit}</td>
                  <td className="px-4 py-4">
                    <div className="min-w-[160px]">
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-zinc-300">{row.usage}</span>
                        <span className="text-xs font-semibold text-zinc-500">{row.percent}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-700/70">
                        <div className={`h-full rounded-full ${progressColor(row.percent)}`} style={{ width: `${row.percent}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-zinc-400">{row.policy}</td>
                  <td className="px-4 py-4 text-zinc-300">{row.approval}</td>
                  <td className="px-5 py-4 text-right">
                    <button type="button" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-zinc-400 hover:text-white">
                      수정
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-white/[0.08] px-5 py-4">
          <button type="button" className="w-full rounded-lg border border-white/10 px-4 py-3 text-sm font-bold text-zinc-400 hover:bg-white/5 hover:text-white">
            더 많은 부서 보기⌄
          </button>
        </div>
      </Card>

      <section className="mt-6 grid gap-5 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] px-5 py-4">
            <div>
              <h2 className="text-lg font-black text-[#fbfbdc]">카테고리 정책 설정</h2>
              <p className="mt-2 text-sm text-zinc-500">카테고리별 사용 여부와 정책을 설정합니다.</p>
            </div>
            <button type="button" className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-zinc-400">
              전체 관리
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-white/[0.08] text-xs text-zinc-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">카테고리</th>
                  <th className="px-4 py-3 font-semibold">사용 여부</th>
                  <th className="px-4 py-3 font-semibold">추가 정책</th>
                  <th className="px-5 py-3 font-semibold">적용 부서</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((item) => (
                  <tr key={item.name} className="border-b border-white/[0.06] last:border-0">
                    <td className="px-5 py-3 font-semibold text-zinc-300">{item.name}</td>
                    <td className={`px-4 py-3 text-xs font-black ${statusClass(item.status)}`}>{item.status}</td>
                    <td className="px-4 py-3 text-zinc-500">{item.policy}</td>
                    <td className="px-5 py-3 text-zinc-500">{item.teams}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-[#fbfbdc]">승인 흐름 설정</h2>
              <p className="mt-2 text-sm text-zinc-500">결제 금액 승인 흐름과 조건을 설정합니다.</p>
            </div>
            <button type="button" className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-zinc-400">
              흐름 관리
            </button>
          </div>
          <div className="mt-5 grid gap-4">
            {approvalSteps.map((step, index) => (
              <div key={step.title} className="grid grid-cols-[34px_minmax(0,1fr)_56px] items-center gap-4 border-b border-white/[0.06] pb-4 last:border-0 last:pb-0">
                <span className="flex size-8 items-center justify-center rounded-full bg-[#8fc5d4]/20 text-xs font-black text-[#8fc5d4]">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-black text-[#fbfbdc]">{step.title}</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">{step.description}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-center text-xs font-black ${step.mode === "자동" ? "bg-blue-400/10 text-blue-200" : "bg-zinc-500/10 text-zinc-300"}`}>
                  {step.mode}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card className="mt-6 p-5">
        <h2 className="text-lg font-black text-[#fbfbdc]">알림 설정</h2>
        <p className="mt-2 text-sm text-zinc-500">정책 설정과 관련된 알림 수신 상태를 관리합니다.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {notificationItems.map((item) => {
            const enabled = notifications[item.key];

            return (
              <div key={item.key} className="rounded-xl border border-white/[0.08] bg-black/15 p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-zinc-300">{item.label}</span>
                  <button
                    type="button"
                    onClick={() => toggleNotification(item.key)}
                    className={`min-w-14 rounded-full px-3 py-1.5 text-xs font-black text-white transition hover:opacity-85 ${
                      enabled ? "bg-blue-500" : "bg-red-500"
                    }`}
                  >
                    {enabled ? "ON" : "OFF"}
                  </button>
                </div>
                <p className="mt-3 text-xs font-medium text-zinc-600">
                  현재 상태: {enabled ? "활성화됨" : "비활성화됨"}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </DashboardShell>
  );
}
