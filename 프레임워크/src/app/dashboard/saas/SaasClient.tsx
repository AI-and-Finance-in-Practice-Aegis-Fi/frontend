"use client";

import { FormEvent, useMemo, useState } from "react";

import type { SaasSubscription } from "@/lib/api";
import { formatKRW, saasStatus, saasUsageRate } from "@/lib/api";
import { downloadReportAsPdf } from "@/lib/pdf";

// ── Types ──────────────────────────────────────────────────────────────────────

type AiState = "idle" | "loading" | "done";

interface AddForm {
  subscription_name: string;
  provider: string;
  department_id: number;
  total_seats: number;
  monthly_fee: string;
  renewal_date: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function computeReduction(sub: SaasSubscription): { cut: number; saving: number; perSeatFee: number } {
  const unused = sub.total_seats - sub.used_seats;
  const rate = sub.risk_level === "HIGH" ? 0.3 : sub.risk_level === "MEDIUM" ? 0.1 : 0;
  const cut = Math.min(unused, Math.round(sub.total_seats * rate));
  const perSeatFee = sub.total_seats > 0 ? parseFloat(sub.monthly_fee) / sub.total_seats : 0;
  const saving = Math.round(cut * perSeatFee);
  return { cut, saving, perSeatFee: Math.round(perSeatFee) };
}

function downloadCSV(subs: SaasSubscription[], deptMap: Record<number, string>) {
  const today = new Date();
  const d = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const headers = ["서비스명", "공급사", "담당부서", "전체좌석", "사용좌석", "월구독료", "낭비금액", "갱신일", "상태", "위험도"];
  const rows = subs.map((s) => [
    s.subscription_name,
    s.provider,
    deptMap[s.department_id] ?? `부서${s.department_id}`,
    s.total_seats,
    s.used_seats,
    s.monthly_fee,
    s.wasted_amount,
    s.renewal_date,
    saasStatus(s),
    s.risk_level,
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `saas_subscriptions_${d}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function generateMockReport(sub: SaasSubscription): string {
  const unused = sub.total_seats - sub.used_seats;
  const utilization = sub.total_seats > 0 ? Math.round((sub.used_seats / sub.total_seats) * 100) : 0;
  const { cut, saving, perSeatFee } = computeReduction(sub);
  const wastedAmt = parseFloat(sub.wasted_amount);
  const band =
    utilization >= 90
      ? "90% 이상 구간이므로 Low 기준에 해당합니다"
      : utilization >= 70
        ? "70~89% 구간이므로 Medium 기준에 해당합니다"
        : utilization >= 50
          ? "50~69% 구간이므로 High 기준에 해당합니다"
          : "50% 미만 구간이므로 Critical 기준에 해당합니다";

  return `■ 현황 요약
${sub.subscription_name}(${sub.provider})은 전체 ${sub.total_seats}석 중 ${sub.used_seats}석만 사용 중으로 활용률이 ${utilization}%입니다. 사내 관리 기준(70%)을 하회하고 있으며, 월 낭비 금액은 ${formatKRW(wastedAmt)}, 연간 환산 ${formatKRW(wastedAmt * 12)}으로 추정됩니다.

■ 위험도 기준
현재 활용률 ${utilization}%는 ${band}. 최종 위험 등급은 ${sub.risk_level}이며, 즉각적인 비용 최적화 조치가 필요합니다.

■ 문제점 분석
주요 낭비 원인은 미사용 시트 ${unused}석입니다. 활용률이 사내 관리 기준(70%)을 크게 하회하고 있어 좌석 축소를 통한 비용 절감 조치가 필요합니다.

■ 즉시 실행 권고안
1. ${cut}석 감축 권고: ${cut}석 × ${formatKRW(perSeatFee)} = 월 ${formatKRW(saving)} / 연 ${formatKRW(saving * 12)} 절감
2. 부서 책임자에게 미사용 좌석 현황을 공유하고 실제 필요 좌석 수를 재확인하세요.
3. 미사용 계정 접근 권한을 회수하고 필요 인원에게 재배정을 진행하세요.

■ 핵심 한 줄 요약
현재 상태를 유지할 경우 연간 ${formatKRW(wastedAmt * 12)}의 비용 낭비가 예상되며, 미사용 시트 ${unused}석 중 ${cut}석 회수만으로도 연간 ${formatKRW(saving * 12)}의 비용 절감이 가능합니다.`;
}

async function fetchAiReport(subscriptionId: number, sub: SaasSubscription): Promise<string> {
  try {
    const res = await fetch(`/api/v1/reports/saas-optimize/${subscriptionId}`, { method: "POST" });
    if (!res.ok) throw new Error("API error");
    const data = (await res.json()) as { report: string };
    return data.report;
  } catch {
    return generateMockReport(sub);
  }
}

function parseAiSections(report: string): { title: string; content: string }[] {
  return report
    .split(/(?=■ )/)
    .filter((s) => s.trim().startsWith("■"))
    .map((s) => {
      const nl = s.indexOf("\n");
      const title = (nl === -1 ? s : s.slice(0, nl)).replace("■ ", "").trim();
      const content = nl === -1 ? "" : s.slice(nl + 1).trim();
      return { title, content };
    });
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <article className={`rounded-2xl border border-white/10 bg-[#111722] shadow-2xl shadow-black/30 ${className}`}>
      {children}
    </article>
  );
}

function ProgressLine({ value }: { value: number }) {
  const color =
    value >= 80 ? "bg-rose-200" : value >= 60 ? "bg-orange-300" : value >= 40 ? "bg-emerald-300" : "bg-blue-300";
  return (
    <div className="flex min-w-[130px] items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-700/70">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="w-8 text-right text-[11px] font-semibold text-zinc-500">{value}%</span>
    </div>
  );
}

function statusClass(status: string) {
  if (status === "미사용") return "text-rose-300";
  if (status === "갱신 임박") return "text-amber-200";
  return "text-[#fbfbdc]";
}

function Overlay({ onClose }: { onClose: () => void }) {
  return <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const TAB_LABELS = ["전체", "미사용", "갱신 임박", "중복 의심"];

// ── Main component ─────────────────────────────────────────────────────────────

export default function SaasClient({
  initialSubscriptions,
  deptMap,
}: {
  initialSubscriptions: SaasSubscription[];
  deptMap: Record<number, string>;
}) {
  const [subscriptions, setSubscriptions] = useState<SaasSubscription[]>(initialSubscriptions);
  const [activeTab, setActiveTab] = useState(0);

  // Add dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addForm, setAddForm] = useState<AddForm>({
    subscription_name: "",
    provider: "",
    department_id: 0,
    total_seats: 10,
    monthly_fee: "",
    renewal_date: "",
  });

  // AI flow
  const [aiState, setAiState] = useState<AiState>("idle");
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [aiDismissed, setAiDismissed] = useState(false);

  const deptOptions = useMemo(
    () => Object.entries(deptMap).map(([id, name]) => ({ id: Number(id), name })),
    [deptMap],
  );

  const counts = useMemo(() => {
    const unused = subscriptions.filter((s) => saasStatus(s) === "미사용").length;
    const renewal = subscriptions.filter((s) => saasStatus(s) === "갱신 임박").length;
    const highRisk = subscriptions.filter((s) => s.risk_level === "HIGH").length;
    return [subscriptions.length, unused, renewal, highRisk];
  }, [subscriptions]);

  const filteredSubs = useMemo(() => {
    if (activeTab === 1) return subscriptions.filter((s) => saasStatus(s) === "미사용");
    if (activeTab === 2) return subscriptions.filter((s) => saasStatus(s) === "갱신 임박");
    if (activeTab === 3) return subscriptions.filter((s) => s.risk_level === "HIGH");
    return subscriptions;
  }, [subscriptions, activeTab]);

  const topWasted = useMemo(
    () =>
      [...subscriptions]
        .filter((s) => s.risk_level === "HIGH")
        .sort((a, b) => parseFloat(b.wasted_amount) - parseFloat(a.wasted_amount))[0] ?? null,
    [subscriptions],
  );

  const reduction = useMemo(() => (topWasted ? computeReduction(topWasted) : null), [topWasted]);

  // ── Handlers ──────────────────────────────────────────────────────────────────

  function openAddDialog() {
    setAddForm({
      subscription_name: "",
      provider: "",
      department_id: deptOptions[0]?.id ?? 1,
      total_seats: 10,
      monthly_fee: "",
      renewal_date: "",
    });
    setShowAddDialog(true);
  }

  function handleAddSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!addForm.subscription_name.trim() || !addForm.monthly_fee) return;
    const fee = parseFloat(addForm.monthly_fee);
    const newSub: SaasSubscription = {
      subscription_id: -Date.now(),
      subscription_name: addForm.subscription_name.trim(),
      provider: addForm.provider.trim(),
      monthly_fee: String(fee),
      total_seats: addForm.total_seats,
      used_seats: 0,
      wasted_amount: String(fee),
      risk_level: "LOW",
      renewal_date: addForm.renewal_date,
      department_id: addForm.department_id,
    };
    setSubscriptions((prev) => [...prev, newSub]);
    setShowAddDialog(false);
  }

  async function handleApplyClick() {
    if (!topWasted) return;
    setAiState("loading");
    setShowAiDialog(true);
    const report = await fetchAiReport(topWasted.subscription_id, topWasted);
    setAiReport(report);
    setAiState("done");
  }

  function handleConfirmApply() {
    if (!topWasted || !reduction || reduction.cut <= 0) return;
    const perSeat = topWasted.total_seats > 0 ? parseFloat(topWasted.monthly_fee) / topWasted.total_seats : 0;
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.subscription_id !== topWasted.subscription_id) return s;
        const newTotal = s.total_seats - reduction.cut;
        const newWasted = Math.max(0, newTotal - s.used_seats) * perSeat;
        return { ...s, total_seats: newTotal, wasted_amount: String(Math.round(newWasted)) };
      }),
    );
    setShowConfirmDialog(false);
    setAiDismissed(true);
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Action buttons */}
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => downloadCSV(filteredSubs, deptMap)}
          className="rounded-lg border border-white/10 bg-[#111722] px-4 py-2 text-xs font-bold text-zinc-300 transition hover:bg-white/5"
        >
          CSV 내보내기
        </button>
        <button
          type="button"
          onClick={openAddDialog}
          className="rounded-lg bg-[#f1d9df] px-4 py-2 text-xs font-black text-[#130b10] transition hover:bg-[#f7e6eb]"
        >
          + 구독 추가
        </button>
      </div>

      {/* Tabs */}
      <nav className="mt-7 flex gap-8 border-b border-white/10 text-sm font-bold">
        {TAB_LABELS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setActiveTab(i)}
            className={`pb-3 transition ${
              activeTab === i
                ? "border-b border-[#fbfbdc] text-[#fbfbdc]"
                : "border-b border-transparent text-zinc-500 hover:text-zinc-200"
            }`}
          >
            {label} ({counts[i]})
          </button>
        ))}
      </nav>

      {/* Table */}
      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-white/[0.08] text-xs text-zinc-500">
              <tr>
                <th className="px-5 py-4 font-semibold">서비스명</th>
                <th className="px-4 py-4 font-semibold">담당 부서</th>
                <th className="px-4 py-4 font-semibold">좌석 수</th>
                <th className="px-4 py-4 font-semibold">사용률</th>
                <th className="px-4 py-4 font-semibold">월 구독료</th>
                <th className="px-4 py-4 font-semibold">갱신일</th>
                <th className="px-4 py-4 font-semibold">상태</th>
                <th className="px-5 py-4 text-right font-semibold">관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubs.map((item) => {
                const usage = saasUsageRate(item);
                const status = saasStatus(item);
                const deptName = deptMap[item.department_id] ?? `부서 ${item.department_id}`;
                return (
                  <tr key={item.subscription_id} className="border-b border-white/[0.06] last:border-0">
                    <td className="max-w-[200px] px-5 py-4 font-semibold text-[#fbfbdc]"><span className="block truncate">{item.subscription_name}</span></td>
                    <td className="max-w-[120px] px-4 py-4 text-zinc-400"><span className="block truncate">{deptName}</span></td>
                    <td className="px-4 py-4 text-zinc-400">{item.total_seats}석</td>
                    <td className="px-4 py-4">
                      <ProgressLine value={usage} />
                    </td>
                    <td className="px-4 py-4 text-zinc-300">{formatKRW(parseFloat(item.monthly_fee))}</td>
                    <td className="px-4 py-4 text-zinc-400">{item.renewal_date}</td>
                    <td className={`px-4 py-4 text-xs font-black ${statusClass(status)}`}>{status}</td>
                    <td className="px-5 py-4 text-right text-lg font-black text-zinc-500">...</td>
                  </tr>
                );
              })}
              {filteredSubs.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-sm text-zinc-500">
                    해당 조건의 구독이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* AI Optimization Card */}
      {!aiDismissed && (
        <Card className="mt-5 p-6">
          <div className="grid gap-5 sm:grid-cols-[64px_minmax(0,1fr)] sm:items-start">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#7aa0aa]/30 text-[#dbeef2]">
              <svg viewBox="0 0 24 24" className="size-7" aria-hidden="true">
                <path
                  d="M12 3v5M12 16v5M3 12h5M16 12h5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
                <path
                  d="m6.5 6.5 3.5 3.5M14 14l3.5 3.5M17.5 6.5 14 10M10 14l-3.5 3.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-[#fbfbdc]">AI 최적화 제안</h2>
              {topWasted ? (
                <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
                  {topWasted.subscription_name} {topWasted.total_seats}석 중{" "}
                  {topWasted.total_seats - topWasted.used_seats}석이 미사용 상태입니다.
                  <br />
                  좌석 축소 시 월 {formatKRW(parseFloat(topWasted.wasted_amount))} 절감 가능합니다.
                </p>
              ) : (
                <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
                  현재 고위험 구독이 없습니다. 모든 구독이 효율적으로 사용되고 있습니다.
                </p>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleApplyClick}
                  disabled={!topWasted || aiState === "loading"}
                  className="rounded-lg bg-[#f1d9df] px-5 py-2.5 text-xs font-black text-[#130b10] transition hover:bg-[#f7e6eb] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {aiState === "loading" ? "AI 분석 중..." : "적용하기"}
                </button>
                <button
                  type="button"
                  onClick={() => setAiDismissed(true)}
                  className="rounded-lg border border-white/10 px-5 py-2.5 text-xs font-bold text-zinc-400 transition hover:bg-white/5 hover:text-white"
                >
                  나중에
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ── Add Subscription Dialog ── */}
      {showAddDialog && (
        <>
          <Overlay onClose={() => setShowAddDialog(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0e1420] p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-black text-[#fbfbdc]">구독 추가</h3>
                <button
                  type="button"
                  onClick={() => setShowAddDialog(false)}
                  className="text-zinc-500 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <label className="block">
                  <span className="text-xs font-bold text-zinc-500">서비스명 *</span>
                  <input
                    required
                    value={addForm.subscription_name}
                    onChange={(e) => setAddForm((f) => ({ ...f, subscription_name: e.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/20"
                    placeholder="예: Slack, Notion"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-zinc-500">공급사 (Provider)</span>
                  <input
                    value={addForm.provider}
                    onChange={(e) => setAddForm((f) => ({ ...f, provider: e.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/20"
                    placeholder="예: Slack Technologies"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-zinc-500">담당 부서</span>
                  <select
                    value={addForm.department_id}
                    onChange={(e) => setAddForm((f) => ({ ...f, department_id: Number(e.target.value) }))}
                    className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-[#0e1420] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-white/20"
                  >
                    {deptOptions.map(({ id, name }) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-bold text-zinc-500">좌석 수</span>
                    <input
                      type="number"
                      min={1}
                      value={addForm.total_seats}
                      onChange={(e) => setAddForm((f) => ({ ...f, total_seats: Number(e.target.value) }))}
                      className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-white/20"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-zinc-500">월 구독료 (원) *</span>
                    <input
                      required
                      type="number"
                      min={0}
                      value={addForm.monthly_fee}
                      onChange={(e) => setAddForm((f) => ({ ...f, monthly_fee: e.target.value }))}
                      className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/20"
                      placeholder="0"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-xs font-bold text-zinc-500">갱신일</span>
                  <input
                    type="date"
                    value={addForm.renewal_date}
                    onChange={(e) => setAddForm((f) => ({ ...f, renewal_date: e.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-white/20"
                  />
                </label>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddDialog(false)}
                    className="flex-1 rounded-lg border border-white/10 py-2.5 text-xs font-bold text-zinc-400 hover:bg-white/5"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-[#f1d9df] py-2.5 text-xs font-black text-[#130b10] hover:bg-[#f7e6eb]"
                  >
                    저장
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ── AI Report Dialog ── */}
      {showAiDialog && (
        <>
          <Overlay onClose={() => setShowAiDialog(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-white/10 bg-[#0e1420] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <h3 className="text-lg font-black text-[#fbfbdc]">AI 최적화 분석 보고서</h3>
                <button
                  type="button"
                  onClick={() => setShowAiDialog(false)}
                  className="text-zinc-500 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {aiState === "loading" && (
                  <div className="flex items-center justify-center py-16">
                    <span className="text-sm text-zinc-500">AI가 분석 중입니다...</span>
                  </div>
                )}
                {aiState === "done" && aiReport && (
                  <div className="space-y-4">
                    {parseAiSections(aiReport).map(({ title, content }) => (
                      <div key={title} className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
                        <h4 className="text-sm font-black text-[#dbeef2]">■ {title}</h4>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-400">{content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {aiState === "done" && (
                <div className="flex flex-wrap gap-3 border-t border-white/10 px-6 py-4">
                  {reduction && reduction.cut > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAiDialog(false);
                        setShowConfirmDialog(true);
                      }}
                      className="rounded-lg bg-[#f1d9df] px-5 py-2.5 text-xs font-black text-[#130b10] transition hover:bg-[#f7e6eb]"
                    >
                      좌석 축소 적용
                    </button>
                  )}
                  {aiReport && (
                    <button
                      type="button"
                      onClick={() => downloadReportAsPdf("AI 최적화 분석 보고서", aiReport, topWasted?.subscription_name)}
                      className="rounded-lg border border-white/10 px-5 py-2.5 text-xs font-bold text-zinc-400 transition hover:bg-white/5 hover:text-white"
                    >
                      PDF 다운로드
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowAiDialog(false)}
                    className="rounded-lg border border-white/10 px-5 py-2.5 text-xs font-bold text-zinc-400 transition hover:bg-white/5 hover:text-white"
                  >
                    닫기
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Confirm Apply Dialog ── */}
      {showConfirmDialog && topWasted && reduction && (
        <>
          <Overlay onClose={() => setShowConfirmDialog(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0e1420] p-6 shadow-2xl">
              <h3 className="text-base font-black text-[#fbfbdc]">좌석 축소 확인</h3>
              <div className="mt-4 space-y-2 rounded-xl border border-white/[0.06] bg-black/20 p-4 text-sm">
                <p className="font-bold text-zinc-200">{topWasted.subscription_name}</p>
                <p className="text-zinc-400">
                  좌석:{" "}
                  <span className="text-zinc-200">{topWasted.total_seats}석</span>
                  {" → "}
                  <span className="font-bold text-emerald-300">{topWasted.total_seats - reduction.cut}석</span>
                </p>
                <p className="text-zinc-400">
                  축소 좌석: <span className="text-zinc-200">{reduction.cut}석</span>
                </p>
                <p className="text-zinc-400">
                  예상 절감:{" "}
                  <span className="font-bold text-[#dbeef2]">
                    월 {formatKRW(reduction.saving)} / 연 {formatKRW(reduction.saving * 12)}
                  </span>
                </p>
              </div>
              <p className="mt-3 text-xs text-zinc-600">현재 화면에만 반영되며, 실제 DB에는 적용되지 않습니다.</p>
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 rounded-lg border border-white/10 py-2.5 text-xs font-bold text-zinc-400 hover:bg-white/5"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApply}
                  className="flex-1 rounded-lg bg-[#f1d9df] py-2.5 text-xs font-black text-[#130b10] hover:bg-[#f7e6eb]"
                >
                  적용 확인
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
