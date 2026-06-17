"use client";

import { useState } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DataCard } from "@/components/dashboard/DataCard";

type NotificationKey =
  | "policyAlert"
  | "budgetAlert"
  | "renewalAlert"
  | "weeklyReport";

const notificationItems: Array<{ key: NotificationKey; label: string }> = [
  { key: "policyAlert", label: "정책 위반 알림" },
  { key: "budgetAlert", label: "예산 초과 알림" },
  { key: "renewalAlert", label: "SaaS 갱신 알림" },
  { key: "weeklyReport", label: "주간 리포트 이메일" },
];

const policyRows = [
  ["예산 초과 알림", "80%"],
  ["고액 결제 기준", "₩500,000"],
  ["이상 지출 감지", "평소 대비 200%"],
];

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
    <DashboardShell activeHref="/dashboard/settings" title="정책 설정" description="정책 기준과 알림 설정을 관리하세요.">
      <section className="mt-6 grid gap-5 xl:grid-cols-3">
        <DataCard title="Company Profile">
          <div className="mt-6 grid gap-4 text-sm">
            <div className="flex justify-between gap-4"><span className="text-zinc-500">회사명</span><span className="font-bold text-[#8290a5]">Aegis-Fi Demo Corp</span></div>
            <div className="flex justify-between gap-4"><span className="text-zinc-500">기본 통화</span><span className="font-bold text-[#8290a5]">KRW</span></div>
            <div className="flex justify-between gap-4"><span className="text-zinc-500">월간 예산</span><span className="font-bold text-[#8290a5]">₩125,000,000</span></div>
          </div>
        </DataCard>

        <DataCard title="Policy Settings">
          <div className="mt-6 grid gap-4 text-sm">
            {policyRows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <span className="text-zinc-500">{label}</span>
                <span className="font-bold text-[#8290a5]">{value}</span>
              </div>
            ))}
          </div>
        </DataCard>

        <DataCard title="Notification">
          <div className="mt-6 grid gap-4">
            {notificationItems.map((item) => {
              const enabled = notifications[item.key];

              return (
                <div key={item.key} className="border-b border-white/[0.06] pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-zinc-400">{item.label}</span>
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
        </DataCard>
      </section>
    </DashboardShell>
  );
}
