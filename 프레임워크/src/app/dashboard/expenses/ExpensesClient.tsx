"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";

import type { DepartmentBudget, Transaction } from "@/lib/api";
import { formatDate, formatKRW } from "@/lib/api";
import { downloadReportAsPdf } from "@/lib/pdf";

// ── Types ──────────────────────────────────────────────────────────────────────

type DetectionType = "warning" | "success" | "pending";
type AiState = "idle" | "loading" | "done";
type ActionStatus = "idle" | "submitting" | "done" | "error";

interface AnomalyResult {
  department_id: number;
  department_name: string;
  z_score: number;
  is_anomaly: boolean;
}

interface AddForm {
  employee_name: string;
  department_name: string;
  merchant_name: string;
  category: string;
  amount: string;
  user_input_reason: string;
}

const CATEGORIES = ["Food", "Transport", "Entertainment", "Office", "Other"];

// ── Helpers ────────────────────────────────────────────────────────────────────

function approvalStatusLabel(v: boolean | null | undefined): "정상" | "한도초과" | "검토 중" {
  if (v === true) return "정상";
  if (v === false) return "한도초과";
  return "검토 중";
}

function approvalAction(v: boolean | null | undefined): "조치" | "검토" | "-" {
  if (v === false) return "조치";
  if (v === null) return "검토";
  return "-";
}

function downloadCSV(transactions: Transaction[]) {
  const today = new Date();
  const d = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const headers = ["일시", "직원", "부서", "가맹점", "카테고리", "금액", "상태", "AI리스크점수", "AI사유"];
  const rows = transactions.map((t) => [
    formatDate(t.payment_time),
    t.employee_name,
    t.department_name,
    t.merchant_name,
    t.category,
    t.amount,
    approvalStatusLabel(t.is_approved),
    t.ai_risk_score ?? "",
    t.ai_risk_reason ?? "",
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `expenses_${d}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function generateMockAnomalyReport(violationCount: number): string {
  return `■ 이상 탐지 요약
이번 달 정책 위반 결제가 ${violationCount}건 감지되었습니다. 사내 결제 정책 기준을 벗어난 거래가 포함되어 있으며, 즉각적인 검토와 정책 개선 조치가 필요합니다.

■ 가능한 원인 분석
1. 정책 기준 한도를 초과한 단일 결제 또는 제한 카테고리 결제가 포함되어 있습니다.
2. AI 리스크 스코어 분석 결과, 일부 결제에서 비정상 패턴이 감지되었습니다.

■ 권고 조치
1. 정책 위반 결제 ${violationCount}건에 대한 상세 내역을 즉시 검토하세요.
2. 반복적인 위반 패턴이 있는 부서나 직원에 대해 정책 한도 조정을 진행하세요.
3. 예외 승인이 필요한 건은 공식 승인 절차를 통해 처리하세요.

■ 핵심 한 줄 요약
이번 달 정책 위반 결제 ${violationCount}건이 감지되었으며, 즉각적인 검토와 정책 개선 조치를 통해 재무 리스크를 관리해야 합니다.`;
}

async function fetchAnomalyAiReport(violationCount: number): Promise<string> {
  try {
    const anomalyRes = await fetch("/api/v1/reports/anomaly?anomaly_only=true");
    if (!anomalyRes.ok) throw new Error("anomaly fetch failed");
    const anomalies = (await anomalyRes.json()) as AnomalyResult[];
    if (anomalies.length === 0) throw new Error("no anomalies");
    const top = [...anomalies].sort((a, b) => Math.abs(b.z_score) - Math.abs(a.z_score))[0];
    const reportRes = await fetch(`/api/v1/reports/anomaly-explain/${top.department_id}`, { method: "POST" });
    if (!reportRes.ok) throw new Error("report fetch failed");
    const data = (await reportRes.json()) as { report: string };
    return data.report;
  } catch {
    return generateMockAnomalyReport(violationCount);
  }
}

async function submitExceptionApproval(transactionId: number, reason: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/v1/approvals/${transactionId}/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    return res.ok || res.status === 201;
  } catch {
    return false;
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

function getProgressColor(value: number) {
  if (value >= 80) return "bg-rose-200";
  if (value >= 60) return "bg-orange-300";
  if (value >= 40) return "bg-cyan-300";
  return "bg-yellow-100";
}

function ProgressRow({ label, value, amount }: { label: string; value: number; amount?: string }) {
  return (
    <div className="grid grid-cols-[82px_minmax(0,1fr)_52px] items-center gap-3 text-xs font-semibold">
      <span className="text-zinc-400">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-slate-700/70">
        <div className={`h-full rounded-full ${getProgressColor(value)}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-right text-zinc-500">{amount ?? `${value}%`}</span>
    </div>
  );
}

function statusClass(status: string) {
  if (status === "정상") return "border-cyan-300/20 bg-cyan-300/10 text-cyan-200";
  if (status === "한도초과") return "border-rose-300/20 bg-rose-400/10 text-rose-300";
  if (status === "승인 요청") return "border-amber-300/20 bg-amber-300/10 text-amber-200";
  return "border-slate-500/20 bg-slate-500/10 text-yellow-200";
}

function detectionTone(type: DetectionType) {
  if (type === "warning") return { badge: "bg-rose-500/10 text-rose-300", status: "text-rose-400" };
  if (type === "success") return { badge: "bg-cyan-500/10 text-cyan-300", status: "text-cyan-300" };
  return { badge: "bg-slate-500/20 text-yellow-200", status: "text-yellow-200" };
}

function DetectionIcon({ type }: { type: DetectionType }) {
  if (type === "warning") return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path d="M12 4.5 21 20H3L12 4.5Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" />
      <path d="M12 9.5v4.5M12 17.2h.01" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" />
    </svg>
  );
  if (type === "success") return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path d="m7 12 3.2 3.2L17.5 8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <path d="M12 8v4.6l3 2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" />
    </svg>
  );
}

function Overlay({ onClose }: { onClose: () => void }) {
  return <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />;
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ExpensesClient({
  initialTransactions,
  departmentBudgets,
  totalSpend,
  totalBudget,
  spendRate,
  departmentUsage,
}: {
  initialTransactions: Transaction[];
  departmentBudgets: DepartmentBudget[];
  totalSpend: number;
  totalBudget: number;
  spendRate: number;
  departmentUsage: { label: string; value: number }[];
}) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  // Add payment dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addForm, setAddForm] = useState<AddForm>({
    employee_name: "",
    department_name: departmentBudgets[0]?.department_name ?? "",
    merchant_name: "",
    category: "Food",
    amount: "",
    user_input_reason: "",
  });

  // Action dialog (per-row 조치/검토)
  const [actionTarget, setActionTarget] = useState<Transaction | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [actionStatus, setActionStatus] = useState<ActionStatus>("idle");

  // Exception approval dialog (AI card 예외 승인)
  const [showExceptionDialog, setShowExceptionDialog] = useState(false);
  const [exceptionTargetId, setExceptionTargetId] = useState<number | null>(null);
  const [exceptionReason, setExceptionReason] = useState("");
  const [exceptionStatus, setExceptionStatus] = useState<ActionStatus>("idle");

  // AI policy report dialog
  const [aiState, setAiState] = useState<AiState>("idle");
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [showAiDialog, setShowAiDialog] = useState(false);

  // Derived stats
  const stats = useMemo(() => {
    const violationCount = transactions.filter((t) => t.is_approved === false).length;
    const normalCount = transactions.filter((t) => t.is_approved === true).length;
    const pendingCount = transactions.filter((t) => t.is_approved === null).length;

    const categoryMap = new Map<string, number>();
    for (const t of transactions) {
      const amt = parseFloat(t.amount);
      categoryMap.set(t.category, (categoryMap.get(t.category) ?? 0) + amt);
    }
    const sorted = [...categoryMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxAmt = sorted[0]?.[1] ?? 1;
    const categorySpend = sorted.map(([label, amt]) => ({
      label,
      value: Math.round((amt / maxAmt) * 100),
      amount: formatKRW(amt),
    }));

    const violations = transactions.filter((t) => t.is_approved === false);

    return { violationCount, normalCount, pendingCount, categorySpend, violations };
  }, [transactions]);

  const aiResults: { label: string; value: string; helper: string; type: DetectionType }[] = [
    { label: "정책 위반", value: `${stats.violationCount}건`, helper: "즉시 검토 필요", type: "warning" },
    { label: "정상 결제", value: `${stats.normalCount}건`, helper: "정상 처리됨", type: "success" },
    { label: "승인 대기", value: `${stats.pendingCount}건`, helper: "검토 대기 중", type: "pending" },
  ];

  // ── Handlers ──────────────────────────────────────────────────────────────────

  function handleAddSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!addForm.merchant_name.trim() || !addForm.amount) return;
    const newTx: Transaction = {
      transaction_id: -Date.now(),
      employee_name: addForm.employee_name.trim(),
      department_name: addForm.department_name,
      merchant_name: addForm.merchant_name.trim(),
      amount: addForm.amount,
      category: addForm.category,
      user_input_reason: addForm.user_input_reason,
      is_approved: null,
      ai_risk_score: null,
      ai_risk_reason: "",
      payment_time: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    setShowAddDialog(false);
    setAddForm({ employee_name: "", department_name: departmentBudgets[0]?.department_name ?? "", merchant_name: "", category: "Food", amount: "", user_input_reason: "" });
  }

  function openActionDialog(tx: Transaction) {
    setActionTarget(tx);
    setActionReason("");
    setActionStatus("idle");
  }

  async function handleActionSubmit() {
    if (!actionTarget || !actionReason.trim()) return;
    setActionStatus("submitting");
    const ok = await submitExceptionApproval(actionTarget.transaction_id, actionReason.trim());
    if (ok) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.transaction_id === actionTarget.transaction_id ? { ...t, is_approved: null } : t,
        ),
      );
      setActionStatus("done");
    } else {
      setActionStatus("error");
    }
  }

  function openExceptionDialog() {
    setExceptionTargetId(stats.violations[0]?.transaction_id ?? null);
    setExceptionReason("");
    setExceptionStatus("idle");
    setShowExceptionDialog(true);
  }

  async function handleExceptionSubmit() {
    if (!exceptionTargetId || !exceptionReason.trim()) return;
    setExceptionStatus("submitting");
    const ok = await submitExceptionApproval(exceptionTargetId, exceptionReason.trim());
    if (ok) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.transaction_id === exceptionTargetId ? { ...t, is_approved: null } : t,
        ),
      );
      setExceptionStatus("done");
    } else {
      setExceptionStatus("error");
    }
  }

  async function handlePolicyAnalysis() {
    setAiState("loading");
    setShowAiDialog(true);
    const report = await fetchAnomalyAiReport(stats.violationCount);
    setAiReport(report);
    setAiState("done");
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Top card ── */}
      <Card className="mt-7 p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_1.3fr] lg:divide-x lg:divide-white/10">
          <div className="lg:pr-8">
            <p className="text-xs font-bold text-zinc-500">이번 달 총 사용액</p>
            <p className="mt-3 text-3xl font-black text-[#fbfbdc]">{formatKRW(totalSpend)}</p>
            <p className="mt-3 text-sm font-semibold text-zinc-400">예산 대비 {spendRate}% 사용 중</p>
            <p className="mt-1 text-xs font-semibold text-[#8290a5]">예산 총액 {formatKRW(totalBudget)}</p>
            <div className="mt-7 flex items-center gap-4">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-700/70">
                <div className="h-full rounded-full bg-[#f1cbd3]" style={{ width: `${spendRate}%` }} />
              </div>
              <span className="text-xs font-bold text-zinc-500">{spendRate}%</span>
            </div>
          </div>
          <div className="lg:pl-8">
            <h2 className="text-lg font-black text-[#fbfbdc]">AI 감지 결과</h2>
            <div className="mt-5">
              {aiResults.map((item) => {
                const tone = detectionTone(item.type);
                return (
                  <div key={item.label} className="flex min-h-[70px] items-center gap-4 border-b border-white/10 py-4 last:border-b-0">
                    <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${tone.badge}`}>
                      <DetectionIcon type={item.type} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-300">{item.label}</p>
                      <p className="mt-1 text-3xl font-black leading-none text-[#ffffe3]">{item.value}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-4 text-right">
                      <span className={`text-sm font-semibold ${tone.status}`}>{item.helper}</span>
                      <span className="text-xl font-light text-slate-500">›</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Action buttons ── */}
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => downloadCSV(transactions)}
          className="rounded-lg border border-white/10 bg-[#111722] px-4 py-2 text-xs font-bold text-zinc-300 transition hover:bg-white/5"
        >
          CSV 내보내기
        </button>
        <button
          type="button"
          onClick={() => {
            setAddForm({ employee_name: "", department_name: departmentBudgets[0]?.department_name ?? "", merchant_name: "", category: "Food", amount: "", user_input_reason: "" });
            setShowAddDialog(true);
          }}
          className="rounded-lg bg-[#f1d9df] px-4 py-2 text-xs font-black text-[#130b10] transition hover:bg-[#f7e6eb]"
        >
          + 결제 추가
        </button>
      </div>

      {/* ── Payment table ── */}
      <Card className="mt-5 overflow-hidden">
        <div className="border-b border-white/[0.08] px-5 py-4">
          <h2 className="text-lg font-black text-[#fbfbdc]">결제 내역</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b border-white/[0.08] text-xs text-zinc-500">
              <tr>
                <th className="px-5 py-4 font-semibold">일시</th>
                <th className="px-4 py-4 font-semibold">직원</th>
                <th className="px-4 py-4 font-semibold">부서</th>
                <th className="px-4 py-4 font-semibold">가맹점</th>
                <th className="px-4 py-4 font-semibold">카테고리</th>
                <th className="px-4 py-4 font-semibold">금액</th>
                <th className="px-4 py-4 font-semibold">상태</th>
                <th className="px-5 py-4 font-semibold">조치</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 50).map((t) => {
                const status = approvalStatusLabel(t.is_approved);
                const action = approvalAction(t.is_approved);
                return (
                  <tr key={t.transaction_id} className="border-b border-white/[0.06] last:border-0">
                    <td className="px-5 py-4 text-zinc-400">{formatDate(t.payment_time)}</td>
                    <td className="px-4 py-4 font-semibold text-[#fbfbdc]">{t.employee_name}</td>
                    <td className="px-4 py-4 text-zinc-400">{t.department_name}</td>
                    <td className="px-4 py-4 text-zinc-300">{t.merchant_name}</td>
                    <td className="px-4 py-4 text-zinc-400">{t.category}</td>
                    <td className="px-4 py-4 text-zinc-300">{formatKRW(parseFloat(t.amount))}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-md border px-2 py-1 text-[11px] font-black ${statusClass(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {action === "-" ? (
                        <span className="text-zinc-500">-</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openActionDialog(t)}
                          className="rounded-md border border-white/10 px-3 py-1 text-[11px] font-bold text-zinc-300 hover:bg-white/5"
                        >
                          {action}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Stats cards ── */}
      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-lg font-black text-[#fbfbdc]">부서별 카드 사용 현황</h2>
          <div className="mt-6 grid gap-4">
            {departmentUsage.map((item) => (
              <ProgressRow key={item.label} {...item} />
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-lg font-black text-[#fbfbdc]">카테고리별 지출</h2>
          <div className="mt-6 grid gap-4">
            {stats.categorySpend.map((item) => (
              <ProgressRow key={item.label} label={item.label} value={item.value} amount={item.amount} />
            ))}
          </div>
        </Card>
      </section>

      {/* ── AI 비용 분석 카드 ── */}
      <Card className="mt-5 p-6">
        <div className="grid gap-5 sm:grid-cols-[54px_minmax(0,1fr)] sm:items-start">
          <div className="flex size-12 items-center justify-center rounded-full bg-[#f1d9df]/15 text-[#f1d9df]">
            <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
              <path d="M12 3v5M12 16v5M3 12h5M16 12h5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
              <path d="m6.5 6.5 3.5 3.5M14 14l3.5 3.5M17.5 6.5 14 10M10 14l-3.5 3.5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-black text-[#fbfbdc]">AI 비용 분석 결과</h2>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-zinc-400">
              {stats.violationCount > 0
                ? `정책 위반 결제 ${stats.violationCount}건이 감지되었습니다. 해당 항목을 수정하거나 예외 승인 시 유사 사례를 자동 관리할 수 있습니다.`
                : "현재 정책 위반 결제가 없습니다. 모든 결제가 정상 처리되고 있습니다."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handlePolicyAnalysis}
                disabled={aiState === "loading"}
                className="rounded-lg bg-[#f1d9df] px-5 py-2.5 text-xs font-black text-[#130b10] transition hover:bg-[#f7e6eb] disabled:opacity-50"
              >
                {aiState === "loading" ? "AI 분석 중..." : "정책 수정"}
              </button>
              <button
                type="button"
                onClick={openExceptionDialog}
                disabled={stats.violations.length === 0}
                className="rounded-lg border border-white/10 px-5 py-2.5 text-xs font-bold text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                예외 승인
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Add Payment Dialog ── */}
      {showAddDialog && (
        <>
          <Overlay onClose={() => setShowAddDialog(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0e1420] p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-black text-[#fbfbdc]">결제 추가</h3>
                <button type="button" onClick={() => setShowAddDialog(false)} className="text-zinc-500 hover:text-white">✕</button>
              </div>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-bold text-zinc-500">직원명 *</span>
                    <input
                      required
                      value={addForm.employee_name}
                      onChange={(e) => setAddForm((f) => ({ ...f, employee_name: e.target.value }))}
                      className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/20"
                      placeholder="홍길동"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-zinc-500">부서</span>
                    <select
                      value={addForm.department_name}
                      onChange={(e) => setAddForm((f) => ({ ...f, department_name: e.target.value }))}
                      className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-[#0e1420] px-3 py-2.5 text-sm text-zinc-100 outline-none"
                    >
                      {departmentBudgets.map((d) => (
                        <option key={d.department_id} value={d.department_name}>{d.department_name}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="block">
                  <span className="text-xs font-bold text-zinc-500">가맹점 *</span>
                  <input
                    required
                    value={addForm.merchant_name}
                    onChange={(e) => setAddForm((f) => ({ ...f, merchant_name: e.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/20"
                    placeholder="스타벅스"
                  />
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-bold text-zinc-500">카테고리</span>
                    <select
                      value={addForm.category}
                      onChange={(e) => setAddForm((f) => ({ ...f, category: e.target.value }))}
                      className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-[#0e1420] px-3 py-2.5 text-sm text-zinc-100 outline-none"
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-zinc-500">금액 (원) *</span>
                    <input
                      required
                      type="number"
                      min={1}
                      value={addForm.amount}
                      onChange={(e) => setAddForm((f) => ({ ...f, amount: e.target.value }))}
                      className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/20"
                      placeholder="0"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-xs font-bold text-zinc-500">결제 사유</span>
                  <input
                    value={addForm.user_input_reason}
                    onChange={(e) => setAddForm((f) => ({ ...f, user_input_reason: e.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/20"
                    placeholder="팀 미팅 비용"
                  />
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddDialog(false)} className="flex-1 rounded-lg border border-white/10 py-2.5 text-xs font-bold text-zinc-400 hover:bg-white/5">취소</button>
                  <button type="submit" className="flex-1 rounded-lg bg-[#f1d9df] py-2.5 text-xs font-black text-[#130b10] hover:bg-[#f7e6eb]">저장</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ── Action Dialog (조치/검토 per-row) ── */}
      {actionTarget && (
        <>
          <Overlay onClose={() => setActionTarget(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0e1420] p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-black text-[#fbfbdc]">
                  {actionTarget.is_approved === false ? "예외 승인 요청" : "결제 검토"}
                </h3>
                <button type="button" onClick={() => setActionTarget(null)} className="text-zinc-500 hover:text-white">✕</button>
              </div>
              <div className="space-y-1.5 rounded-xl border border-white/[0.06] bg-black/20 p-4 text-sm">
                <p className="text-zinc-400">가맹점: <span className="text-zinc-200">{actionTarget.merchant_name}</span></p>
                <p className="text-zinc-400">금액: <span className="text-zinc-200">{formatKRW(parseFloat(actionTarget.amount))}</span></p>
                <p className="text-zinc-400">직원: <span className="text-zinc-200">{actionTarget.employee_name} · {actionTarget.department_name}</span></p>
                {actionTarget.ai_risk_reason && (
                  <p className="text-zinc-400 pt-1">AI 사유: <span className="text-rose-300 text-xs">{actionTarget.ai_risk_reason}</span></p>
                )}
              </div>
              {actionStatus === "done" ? (
                <p className="mt-4 text-center text-sm font-bold text-cyan-300">예외 승인 요청이 접수되었습니다.</p>
              ) : (
                <>
                  <label className="mt-4 block">
                    <span className="text-xs font-bold text-zinc-500">승인 사유 *</span>
                    <textarea
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      rows={3}
                      placeholder="예외 승인 사유를 입력하세요."
                      className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/20 resize-none"
                    />
                  </label>
                  {actionStatus === "error" && (
                    <p className="mt-2 text-xs text-rose-400">요청 처리 중 오류가 발생했습니다.</p>
                  )}
                  <div className="mt-4 flex gap-3">
                    <button type="button" onClick={() => setActionTarget(null)} className="flex-1 rounded-lg border border-white/10 py-2.5 text-xs font-bold text-zinc-400 hover:bg-white/5">취소</button>
                    <button
                      type="button"
                      onClick={handleActionSubmit}
                      disabled={!actionReason.trim() || actionStatus === "submitting"}
                      className="flex-1 rounded-lg bg-[#f1d9df] py-2.5 text-xs font-black text-[#130b10] hover:bg-[#f7e6eb] disabled:opacity-50"
                    >
                      {actionStatus === "submitting" ? "처리 중..." : "예외 승인 요청"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Exception Approval Dialog (AI 카드 예외 승인) ── */}
      {showExceptionDialog && (
        <>
          <Overlay onClose={() => setShowExceptionDialog(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0e1420] p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-base font-black text-[#fbfbdc]">예외 승인 요청</h3>
                <button type="button" onClick={() => setShowExceptionDialog(false)} className="text-zinc-500 hover:text-white">✕</button>
              </div>
              {exceptionStatus === "done" ? (
                <p className="py-4 text-center text-sm font-bold text-cyan-300">예외 승인 요청이 접수되었습니다.</p>
              ) : (
                <>
                  <label className="block">
                    <span className="text-xs font-bold text-zinc-500">대상 거래 선택</span>
                    <select
                      value={exceptionTargetId ?? ""}
                      onChange={(e) => setExceptionTargetId(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-[#0e1420] px-3 py-2.5 text-sm text-zinc-100 outline-none"
                    >
                      {stats.violations.map((t) => (
                        <option key={t.transaction_id} value={t.transaction_id}>
                          {t.merchant_name} · {formatKRW(parseFloat(t.amount))} · {t.employee_name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="mt-4 block">
                    <span className="text-xs font-bold text-zinc-500">예외 승인 사유 *</span>
                    <textarea
                      value={exceptionReason}
                      onChange={(e) => setExceptionReason(e.target.value)}
                      rows={3}
                      placeholder="예외 승인이 필요한 사유를 입력하세요."
                      className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/20 resize-none"
                    />
                  </label>
                  {exceptionStatus === "error" && (
                    <p className="mt-2 text-xs text-rose-400">요청 처리 중 오류가 발생했습니다.</p>
                  )}
                  <div className="mt-5 flex gap-3">
                    <button type="button" onClick={() => setShowExceptionDialog(false)} className="flex-1 rounded-lg border border-white/10 py-2.5 text-xs font-bold text-zinc-400 hover:bg-white/5">취소</button>
                    <button
                      type="button"
                      onClick={handleExceptionSubmit}
                      disabled={!exceptionReason.trim() || !exceptionTargetId || exceptionStatus === "submitting"}
                      className="flex-1 rounded-lg bg-[#f1d9df] py-2.5 text-xs font-black text-[#130b10] hover:bg-[#f7e6eb] disabled:opacity-50"
                    >
                      {exceptionStatus === "submitting" ? "처리 중..." : "승인 요청 제출"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── AI Policy Report Dialog ── */}
      {showAiDialog && (
        <>
          <Overlay onClose={() => setShowAiDialog(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-white/10 bg-[#0e1420] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <h3 className="text-lg font-black text-[#fbfbdc]">AI 비용 이상 분석 보고서</h3>
                <button type="button" onClick={() => setShowAiDialog(false)} className="text-zinc-500 hover:text-white">✕</button>
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
              <div className="flex flex-wrap gap-3 border-t border-white/10 px-6 py-4">
                <Link
                  href="/dashboard/settings"
                  className="rounded-lg bg-[#f1d9df] px-5 py-2.5 text-xs font-black text-[#130b10] transition hover:bg-[#f7e6eb]"
                  onClick={() => setShowAiDialog(false)}
                >
                  정책 설정 바로가기
                </Link>
                {aiState === "done" && aiReport && (
                  <button
                    type="button"
                    onClick={() => downloadReportAsPdf("AI 비용 이상 분석 보고서", aiReport)}
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
            </div>
          </div>
        </>
      )}
    </>
  );
}
