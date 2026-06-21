"use client";

import { FormEvent, useState } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { DepartmentBudget, Policy } from "@/lib/api";
import { formatKRW } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────────────

type NotificationKey = "policyAlert" | "budgetAlert" | "renewalAlert" | "weeklyReport";

interface DeptRow {
  id: number;
  name: string;
  monthlyLimit: number;
  singleLimit: number | null;
  usage: number;
  percent: number;
  policy: string;
  approval: string;
}

interface CategoryRow {
  name: string;
  status: "허용" | "조건부" | "제한";
  policy: string;
  teams: string;
}

// ── Static data ────────────────────────────────────────────────────────────────

const STATUS_CYCLE: CategoryRow["status"][] = ["허용", "조건부", "제한"];

const DEFAULT_CATEGORIES: CategoryRow[] = [
  { name: "게임", status: "제한", policy: "허용되지 않음", teams: "영업팀 +2" },
  { name: "주류", status: "조건부", policy: "접대 목적만 허용", teams: "영업팀, 경영지원팀" },
  { name: "개인쇼핑", status: "제한", policy: "허용되지 않음", teams: "마케팅팀" },
  { name: "교육/도서", status: "허용", policy: "영수증 필수 첨부", teams: "인사팀, 개발팀" },
  { name: "교통", status: "허용", policy: "일반 교통비 허용", teams: "전체 부서" },
  { name: "숙박", status: "조건부", policy: "출장 시에만 허용", teams: "전체 부서" },
];

const APPROVAL_STEPS = [
  { title: "AI 자동 승인", description: "정책 위반 없고 사전 승인 기준 이하", mode: "자동" },
  { title: "1차 승인", description: "팀장 승인 (500,000원 이상)", mode: "수동" },
  { title: "2차 승인", description: "부장 승인 (2,000,000원 이상)", mode: "수동" },
  { title: "최종 승인", description: "CFO 또는 임원 승인", mode: "자동" },
];

const NOTIFICATION_ITEMS: Array<{ key: NotificationKey; label: string }> = [
  { key: "policyAlert", label: "정책 위반 알림" },
  { key: "budgetAlert", label: "예산 초과 알림" },
  { key: "renewalAlert", label: "SaaS 갱신 알림" },
  { key: "weeklyReport", label: "주간 리포트 이메일" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

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

function buildDeptRows(departments: DepartmentBudget[], policies: Policy[]): DeptRow[] {
  return departments.map((dept) => {
    const deptPolicies = policies.filter((p) => p.department_id === dept.department_id);
    const singleLimit = deptPolicies.find((p) => p.single_payment_limit != null)?.single_payment_limit ?? null;
    return {
      id: dept.department_id,
      name: dept.department_name,
      monthlyLimit: dept.monthly_budget_limit,
      singleLimit,
      usage: dept.current_spending,
      percent: Math.round(dept.spend_rate * 100),
      policy: deptPolicies.length > 0 ? "AI 정책 적용" : "-",
      approval: "AI 자동",
    };
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

function Overlay({ onClose }: { onClose: () => void }) {
  return <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />;
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props {
  departments: DepartmentBudget[];
  policies: Policy[];
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function SettingsClient({ departments, policies }: Props) {
  const today = new Date();
  const currentMonthLabel = `${today.getFullYear()}년 ${today.getMonth() + 1}월`;

  const [deptRows, setDeptRows] = useState<DeptRow[]>(() => buildDeptRows(departments, policies));
  const [categories, setCategories] = useState<CategoryRow[]>(DEFAULT_CATEGORIES);
  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({
    policyAlert: true,
    budgetAlert: true,
    renewalAlert: true,
    weeklyReport: false,
  });

  // Dialogs
  const [editTarget, setEditTarget] = useState<DeptRow | null>(null);
  const [editForm, setEditForm] = useState({ monthlyLimit: "", singleLimit: "" });
  const [showAddDept, setShowAddDept] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", monthlyLimit: "", singleLimit: "" });
  const [saveMsg, setSaveMsg] = useState("");

  function openEdit(row: DeptRow) {
    setEditTarget(row);
    setEditForm({
      monthlyLimit: String(row.monthlyLimit),
      singleLimit: row.singleLimit != null ? String(row.singleLimit) : "",
    });
  }

  function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    const newLimit = parseFloat(editForm.monthlyLimit) || editTarget.monthlyLimit;
    const newSingle = editForm.singleLimit ? parseFloat(editForm.singleLimit) : null;
    setDeptRows((prev) =>
      prev.map((r) =>
        r.id === editTarget.id
          ? { ...r, monthlyLimit: newLimit, singleLimit: newSingle, percent: Math.round((r.usage / newLimit) * 100) }
          : r,
      ),
    );
    setEditTarget(null);
    showToast("저장되었습니다.");
  }

  function handleAddSubmit(e: FormEvent) {
    e.preventDefault();
    if (!addForm.name) return;
    const newRow: DeptRow = {
      id: -Date.now(),
      name: addForm.name,
      monthlyLimit: parseFloat(addForm.monthlyLimit) || 0,
      singleLimit: addForm.singleLimit ? parseFloat(addForm.singleLimit) : null,
      usage: 0,
      percent: 0,
      policy: "-",
      approval: "AI 자동",
    };
    setDeptRows((prev) => [...prev, newRow]);
    setShowAddDept(false);
    setAddForm({ name: "", monthlyLimit: "", singleLimit: "" });
    showToast("부서가 추가되었습니다.");
  }

  function cycleStatus(idx: number) {
    setCategories((prev) =>
      prev.map((c, i) => {
        if (i !== idx) return c;
        const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(c.status) + 1) % STATUS_CYCLE.length];
        return { ...c, status: next };
      }),
    );
  }

  function toggleNotification(key: NotificationKey) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function showToast(msg: string) {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(""), 2500);
  }

  return (
    <DashboardShell
      activeHref="/dashboard/settings"
      title="정책 설정"
      description={`${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 기준`}
    >
      {/* Toast */}
      {saveMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-white/10 bg-[#111722] px-5 py-3 text-sm font-bold text-emerald-300 shadow-2xl">
          {saveMsg}
        </div>
      )}

      {/* ── Hero card ── */}
      <Card className="mt-7 overflow-hidden p-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-[#141b27] text-[#8290a5]">
                <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                  <path d="M12 4 19 7v5.5c0 4.1-2.8 6.4-7 7.5-4.2-1.1-7-3.4-7-7.5V7l7-3Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
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
          </div>
          <div className="relative mx-auto flex h-52 w-full max-w-[320px] items-center justify-center">
            <div className="absolute left-6 top-8 h-9 w-16 rounded-lg border border-[#8fc5d4]/25 bg-black/20" />
            <div className="absolute right-10 top-7 h-12 w-12 rounded-lg border border-[#8fc5d4]/25 bg-black/20" />
            <div className="absolute bottom-8 left-10 h-12 w-12 rounded-lg border border-[#8fc5d4]/25 bg-black/20" />
            <div className="absolute bottom-10 right-8 h-12 w-12 rounded-lg border border-[#8fc5d4]/25 bg-black/20" />
            <div className="absolute bottom-3 h-10 w-44 rounded-[50%] bg-[#8fc5d4]/10 blur-sm" />
            <div className="relative flex size-28 items-center justify-center rounded-[2rem] border border-[#8fc5d4]/40 bg-[#17313a] shadow-[0_0_45px_rgba(143,197,212,0.25)]">
              <svg viewBox="0 0 80 88" className="size-20 text-[#9de1dc]" aria-hidden="true">
                <path d="M40 6 67 18v24c0 18-11 30-27 39C24 72 13 60 13 42V18L40 6Z" fill="none" stroke="currentColor" strokeWidth="5" />
                <path d="m27 43 9 9 18-22" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" />
              </svg>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Dept table ── */}
      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-white/[0.08] px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-black text-[#fbfbdc]">부서별 한도 설정</h2>
            <p className="mt-2 text-sm text-zinc-500">각 부서의 월간 사용 한도와 1회 한도를 설정할 수 있습니다.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs font-bold text-zinc-400">
              {currentMonthLabel}
            </span>
            <button
              type="button"
              onClick={() => setShowAddDept(true)}
              className="rounded-lg bg-[#f1d9df] px-3 py-2 text-xs font-black text-[#130b10] hover:bg-[#f7e6eb]"
            >
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
              {deptRows.map((row) => (
                <tr key={row.id} className="border-b border-white/[0.06] last:border-0">
                  <td className="px-5 py-4 font-semibold text-[#fbfbdc]">{row.name}</td>
                  <td className="px-4 py-4 text-zinc-400">{formatKRW(row.monthlyLimit)}</td>
                  <td className="px-4 py-4 text-zinc-400">{row.singleLimit != null ? formatKRW(row.singleLimit) : "-"}</td>
                  <td className="px-4 py-4">
                    <div className="min-w-[160px]">
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-zinc-300">{formatKRW(row.usage)}</span>
                        <span className="text-xs font-semibold text-zinc-500">{row.percent}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-700/70">
                        <div className={`h-full rounded-full ${progressColor(row.percent)}`} style={{ width: `${Math.min(row.percent, 100)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-zinc-400">{row.policy}</td>
                  <td className="px-4 py-4 text-zinc-300">{row.approval}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(row)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-zinc-400 hover:text-white"
                    >
                      수정
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Category + Approval ── */}
      <section className="mt-6 grid gap-5 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] px-5 py-4">
            <div>
              <h2 className="text-lg font-black text-[#fbfbdc]">카테고리 정책 설정</h2>
              <p className="mt-2 text-sm text-zinc-500">카테고리 상태를 클릭하면 변경할 수 있습니다.</p>
            </div>
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
                {categories.map((item, idx) => (
                  <tr key={item.name} className="border-b border-white/[0.06] last:border-0">
                    <td className="px-5 py-3 font-semibold text-zinc-300">{item.name}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => cycleStatus(idx)}
                        className={`rounded-full px-3 py-1 text-xs font-black transition hover:opacity-80 ${statusClass(item.status)}`}
                      >
                        {item.status}
                      </button>
                    </td>
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
          </div>
          <div className="mt-5 grid gap-4">
            {APPROVAL_STEPS.map((step, index) => (
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

      {/* ── Notifications ── */}
      <Card className="mt-6 p-5">
        <h2 className="text-lg font-black text-[#fbfbdc]">알림 설정</h2>
        <p className="mt-2 text-sm text-zinc-500">정책 설정과 관련된 알림 수신 상태를 관리합니다.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {NOTIFICATION_ITEMS.map((item) => {
            const enabled = notifications[item.key];
            return (
              <div key={item.key} className="rounded-xl border border-white/[0.08] bg-black/15 p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-zinc-300">{item.label}</span>
                  <button
                    type="button"
                    onClick={() => toggleNotification(item.key)}
                    className={`min-w-14 rounded-full px-3 py-1.5 text-xs font-black text-white transition hover:opacity-85 ${enabled ? "bg-blue-500" : "bg-red-500"}`}
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
        <button
          type="button"
          onClick={() => showToast("알림 설정이 저장되었습니다.")}
          className="mt-5 rounded-lg bg-[#f1d9df] px-5 py-2.5 text-xs font-black text-[#130b10] transition hover:bg-[#f7e6eb]"
        >
          설정 저장
        </button>
      </Card>

      {/* ── Edit Dept Dialog ── */}
      {editTarget && (
        <>
          <Overlay onClose={() => setEditTarget(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0e1420] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <h3 className="text-base font-black text-[#fbfbdc]">부서 한도 수정</h3>
                <button type="button" onClick={() => setEditTarget(null)} className="text-zinc-500 hover:text-white">✕</button>
              </div>
              <form onSubmit={handleEditSubmit} className="px-6 py-5 space-y-4">
                <div>
                  <p className="text-xs font-bold text-zinc-500 mb-1">부서명</p>
                  <p className="text-sm font-black text-[#fbfbdc]">{editTarget.name}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500" htmlFor="edit-monthly">월 한도 (원)</label>
                  <input
                    id="edit-monthly"
                    type="number"
                    value={editForm.monthlyLimit}
                    onChange={(e) => setEditForm((f) => ({ ...f, monthlyLimit: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500" htmlFor="edit-single">1회 한도 (원, 비워두면 제한 없음)</label>
                  <input
                    id="edit-single"
                    type="number"
                    value={editForm.singleLimit}
                    onChange={(e) => setEditForm((f) => ({ ...f, singleLimit: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-white/30"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 rounded-lg bg-[#f1d9df] py-2.5 text-xs font-black text-[#130b10] hover:bg-[#f7e6eb]">저장</button>
                  <button type="button" onClick={() => setEditTarget(null)} className="flex-1 rounded-lg border border-white/10 py-2.5 text-xs font-bold text-zinc-400 hover:bg-white/5">취소</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ── Add Dept Dialog ── */}
      {showAddDept && (
        <>
          <Overlay onClose={() => setShowAddDept(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0e1420] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <h3 className="text-base font-black text-[#fbfbdc]">부서 추가</h3>
                <button type="button" onClick={() => setShowAddDept(false)} className="text-zinc-500 hover:text-white">✕</button>
              </div>
              <form onSubmit={handleAddSubmit} className="px-6 py-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500" htmlFor="add-name">부서명 *</label>
                  <input
                    id="add-name"
                    type="text"
                    required
                    value={addForm.name}
                    onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-white/30"
                    placeholder="예: 신사업팀"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500" htmlFor="add-monthly">월 한도 (원)</label>
                  <input
                    id="add-monthly"
                    type="number"
                    value={addForm.monthlyLimit}
                    onChange={(e) => setAddForm((f) => ({ ...f, monthlyLimit: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-white/30"
                    placeholder="5000000"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500" htmlFor="add-single">1회 한도 (원)</label>
                  <input
                    id="add-single"
                    type="number"
                    value={addForm.singleLimit}
                    onChange={(e) => setAddForm((f) => ({ ...f, singleLimit: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-white/30"
                    placeholder="500000"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 rounded-lg bg-[#f1d9df] py-2.5 text-xs font-black text-[#130b10] hover:bg-[#f7e6eb]">추가</button>
                  <button type="button" onClick={() => setShowAddDept(false)} className="flex-1 rounded-lg border border-white/10 py-2.5 text-xs font-bold text-zinc-400 hover:bg-white/5">취소</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
