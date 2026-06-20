"use client";

import { useState } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";

function Switch({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      type="button"
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        checked ? "bg-[#8290a5]" : "bg-white/10"
      }`}
    >
      <span
        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <article className={`rounded-2xl border border-white/10 bg-[#111722] shadow-2xl shadow-black/30 ${className}`}>
      {children}
    </article>
  );
}

function SettingRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-bold text-[#fbfbdc]">{label}</p>
        <p className="mt-0.5 text-xs font-semibold text-zinc-500">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

type SettingsState = {
  emailNotification: boolean;
  slackNotification: boolean;
  paymentApproval: boolean;
  dangerAlert: boolean;
  cautionAlert: boolean;
  infoAlert: boolean;
};

export default function NotificationsSettingsPage() {
  const [settings, setSettings] = useState<SettingsState>({
    emailNotification: true,
    slackNotification: false,
    paymentApproval: true,
    dangerAlert: true,
    cautionAlert: true,
    infoAlert: false,
  });

  const toggle = (key: keyof SettingsState) => (value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <DashboardShell
      activeHref="/dashboard/settings"
      title="알림 설정"
      description="알림 수신 방법 및 유형을 설정하세요"
    >
      <div className="mt-7 max-w-2xl space-y-5">
        {/* 알림 채널 */}
        <Card className="px-5">
          <div className="border-b border-white/10 py-4">
            <h2 className="text-base font-black text-[#fbfbdc]">알림 채널</h2>
            <p className="mt-1 text-xs font-semibold text-zinc-500">알림을 받을 채널을 선택하세요</p>
          </div>
          <div className="divide-y divide-white/[0.06]">
            <SettingRow
              label="이메일 알림"
              description="등록된 이메일로 알림을 수신합니다"
              checked={settings.emailNotification}
              onCheckedChange={toggle("emailNotification")}
            />
            <SettingRow
              label="Slack 알림"
              description="연결된 Slack 워크스페이스로 알림을 수신합니다"
              checked={settings.slackNotification}
              onCheckedChange={toggle("slackNotification")}
            />
          </div>
        </Card>

        {/* 알림 유형 */}
        <Card className="px-5">
          <div className="border-b border-white/10 py-4">
            <h2 className="text-base font-black text-[#fbfbdc]">알림 유형</h2>
            <p className="mt-1 text-xs font-semibold text-zinc-500">수신할 알림 유형을 선택하세요</p>
          </div>
          <div className="divide-y divide-white/[0.06]">
            <SettingRow
              label="결제 승인 요청 알림"
              description="결제 승인이 필요한 건이 발생하면 알림을 보냅니다"
              checked={settings.paymentApproval}
              onCheckedChange={toggle("paymentApproval")}
            />
            <SettingRow
              label="위험 알림"
              description="즉시 확인이 필요한 위험 수준 이벤트를 알립니다"
              checked={settings.dangerAlert}
              onCheckedChange={toggle("dangerAlert")}
            />
            <SettingRow
              label="주의 알림"
              description="검토가 권장되는 주의 수준 이벤트를 알립니다"
              checked={settings.cautionAlert}
              onCheckedChange={toggle("cautionAlert")}
            />
            <SettingRow
              label="정보 알림"
              description="참고용 정보성 이벤트를 알립니다"
              checked={settings.infoAlert}
              onCheckedChange={toggle("infoAlert")}
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <button
            type="button"
            className="rounded-lg bg-[#8290a5] px-6 py-3 text-sm font-black text-[#050608] transition hover:bg-[#a3afc1]"
          >
            설정 저장
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}
