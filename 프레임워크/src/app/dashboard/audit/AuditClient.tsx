"use client";

import { useMemo, useState } from "react";

import type { AuditLog } from "@/lib/api";
import { formatTime } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────────────

type SortOrder = "desc" | "asc";
type WeekOption = "all" | "this" | "last" | "2weeks" | "3weeks" | "1month";
type EventFilter = "전체" | "결제 승인" | "결제 차단" | "이상 감지" | "정책 변경";
type AiState = "idle" | "loading" | "done";

interface AnomalyResult {
  department_id: number;
  z_score: number;
  is_anomaly: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const CAT_COLORS: Record<string, string> = {
  "결제 승인": "#f3cbd3",
  "결제 차단": "#8fc5d4",
  "이상 감지": "#96a8d8",
  "정책 변경": "#f4eecb",
};

const WEEK_LABELS: Record<WeekOption, string> = {
  all: "전체 기간",
  this: "이번 주",
  last: "저번 주",
  "2weeks": "2주 전",
  "3weeks": "3주 전",
  "1month": "최근 1개월",
};

const EVENT_FILTERS: EventFilter[] = ["전체", "결제 승인", "결제 차단", "이상 감지", "정책 변경"];

function eventTypeLabel(eventType: string): { type: string; tone: string } {
  if (eventType.includes("APPROVED")) return { type: "결제 승인", tone: "bg-yellow-200/20 text-yellow-100" };
  if (eventType.includes("BLOCKED")) return { type: "결제 차단", tone: "bg-rose-300/20 text-rose-100" };
  if (eventType.includes("ANOMALY")) return { type: "이상 감지", tone: "bg-cyan-300/20 text-cyan-100" };
  if (eventType.includes("POLICY")) return { type: "정책 변경", tone: "bg-rose-300/20 text-rose-100" };
  return { type: eventType, tone: "bg-blue-300/20 text-blue-100" };
}

function getWeekRange(week: WeekOption): { start: Date | null; end: Date | null } {
  if (week === "all") return { start: null, end: null };
  const now = new Date();
  const daysFromMon = (now.getDay() + 6) % 7;
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - daysFromMon);
  thisMonday.setHours(0, 0, 0, 0);
  if (week === "this") return { start: thisMonday, end: now };

  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(thisMonday.getDate() - 7);
  const lastSunday = new Date(thisMonday.getTime() - 1);

  if (week === "last") return { start: lastMonday, end: lastSunday };
  if (week === "2weeks") {
    const s = new Date(thisMonday); s.setDate(thisMonday.getDate() - 14);
    return { start: s, end: new Date(lastMonday.getTime() - 1) };
  }
  if (week === "3weeks") {
    const s = new Date(thisMonday); s.setDate(thisMonday.getDate() - 21);
    const e = new Date(thisMonday); e.setDate(thisMonday.getDate() - 14); e.setMilliseconds(-1);
    return { start: s, end: e };
  }
  // 1month
  const s = new Date(now); s.setDate(now.getDate() - 30); s.setHours(0, 0, 0, 0);
  return { start: s, end: now };
}

function fmtMD(d: Date) {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function getWeekRangeLabel(week: WeekOption): string {
  if (week === "all") return "날짜 범위: 전체 기간";
  const { start, end } = getWeekRange(week);
  if (!start || !end) return "날짜 범위: 전체 기간";
  return `날짜 범위: ${fmtMD(start)} ~ ${fmtMD(end)}`;
}

function buildConicGradient(counts: Record<string, number>): string {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return "conic-gradient(#243041 0deg 360deg)";
  let deg = 0;
  const parts = Object.entries(counts).map(([label, count]) => {
    const angle = (count / total) * 360;
    const part = `${CAT_COLORS[label] ?? "#888"} ${deg.toFixed(1)}deg ${(deg + angle).toFixed(1)}deg`;
    deg += angle;
    return part;
  });
  return `conic-gradient(${parts.join(", ")})`;
}

function buildChartPoints(logs: AuditLog[]): { points: string; circlePts: { x: number; y: number }[] } {
  const now = new Date();
  const dayMap = new Map<string, number>();
  const keys: string[] = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now); d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dayMap.set(key, 0); keys.push(key);
  }
  for (const log of logs) {
    const key = log.created_at.slice(0, 10);
    if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
  }
  const values = keys.map((k) => dayMap.get(k) ?? 0);
  const maxVal = Math.max(...values, 1);
  const xs = [20, 75, 125, 178, 232, 292, 350, 400];
  const circlePts = values.map((v, i) => ({ x: xs[i], y: 130 - Math.round((v / maxVal) * 110) }));
  const points = circlePts.map((p) => `${p.x},${p.y}`).join(" ");
  return { points, circlePts };
}

function parseAiSections(report: string): { title: string; content: string }[] {
  return report
    .split(/(?=■ )/)
    .filter((s) => s.trim().startsWith("■"))
    .map((s) => {
      const nl = s.indexOf("\n");
      return {
        title: (nl === -1 ? s : s.slice(0, nl)).replace("■ ", "").trim(),
        content: nl === -1 ? "" : s.slice(nl + 1).trim(),
      };
    });
}

async function fetchAnomalyAiReport(): Promise<string> {
  try {
    const res = await fetch("/api/v1/reports/anomaly?anomaly_only=true");
    if (!res.ok) throw new Error("failed");
    const anomalies = (await res.json()) as AnomalyResult[];
    if (!anomalies.length) throw new Error("empty");
    const top = [...anomalies].sort((a, b) => Math.abs(b.z_score) - Math.abs(a.z_score))[0];
    const rpt = await fetch(`/api/v1/reports/anomaly-explain/${top.department_id}`, { method: "POST" });
    if (!rpt.ok) throw new Error("failed");
    const data = (await rpt.json()) as { report: string };
    return data.report;
  } catch {
    return `■ 이상 탐지 요약
최근 감사 로그에서 이상 패턴이 감지되었습니다. 권한 변경 및 정책 위반 이벤트가 평소 대비 증가하는 추세로 추가 검토가 필요합니다.

■ 가능한 원인 분석
1. 특정 부서에서의 결제 패턴 변화 또는 예외적인 고액 결제가 발생했을 가능성이 있습니다.
2. 정책 경계 수준의 거래가 반복적으로 발생하고 있어 모니터링이 필요합니다.

■ 권고 조치
1. 차단 및 이상 감지 이벤트에 대한 상세 내역을 즉시 검토하세요.
2. 반복 패턴을 보이는 사용자 또는 부서에 대해 정책을 재검토하세요.
3. 정기적인 감사 체인 무결성 검증을 진행하세요.

■ 핵심 한 줄 요약
이상 패턴 감지 건수가 증가 추세에 있으며, Aegis-Fi 기반 자동 모니터링을 통한 즉각적인 검토와 정책 점검이 필요합니다.`;
  }
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

function Dropdown({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} aria-hidden="true" />
      <div className="absolute right-0 top-full z-40 mt-1 min-w-[160px] rounded-xl border border-white/10 bg-[#0e1420] py-1 shadow-2xl">
        {children}
      </div>
    </>
  );
}

function DropdownItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-4 py-2.5 text-left text-xs font-bold transition hover:bg-white/5 ${active ? "text-[#fbfbdc]" : "text-zinc-400"}`}
    >
      {label}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AuditClient({ initialLogs }: { initialLogs: AuditLog[] }) {
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedWeek, setSelectedWeek] = useState<WeekOption>("all");
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [filterType, setFilterType] = useState<EventFilter>("전체");
  const [showCount, setShowCount] = useState(20);

  // Dropdown open states
  const [weekOpen, setWeekOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Dialogs
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [chainValid, setChainValid] = useState<boolean | null>(null);
  const [chainLoading, setChainLoading] = useState(false);
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiState, setAiState] = useState<AiState>("idle");

  // Unique users extracted from logs
  const allUsers = useMemo(() => {
    const users = new Set<string>(["시스템"]);
    for (const log of initialLogs) {
      const data = log.event_data as Record<string, unknown>;
      const id = data.employee_id as number | undefined;
      if (id != null) users.add(`직원 #${id}`);
    }
    return ["all", ...users];
  }, [initialLogs]);

  // Filtered + sorted logs
  const filteredLogs = useMemo(() => {
    let result = [...initialLogs];
    const { start, end } = getWeekRange(selectedWeek);
    if (start) result = result.filter((l) => new Date(l.created_at) >= start);
    if (end) result = result.filter((l) => new Date(l.created_at) <= end);
    if (selectedUser !== "all") {
      result = result.filter((l) => {
        const data = l.event_data as Record<string, unknown>;
        const id = data.employee_id as number | undefined;
        const user = id != null ? `직원 #${id}` : "시스템";
        return user === selectedUser;
      });
    }
    if (filterType !== "전체") {
      result = result.filter((l) => eventTypeLabel(l.event_type).type === filterType);
    }
    if (sortOrder === "asc") result = result.reverse();
    return result;
  }, [initialLogs, selectedWeek, selectedUser, filterType, sortOrder]);

  // Stats derived from filteredLogs
  const stats = useMemo(() => {
    const catCounts: Record<string, number> = { "결제 승인": 0, "결제 차단": 0, "이상 감지": 0, "정책 변경": 0 };
    for (const log of filteredLogs) {
      const { type } = eventTypeLabel(log.event_type);
      if (type in catCounts) catCounts[type]++;
    }
    const total = filteredLogs.length;
    const important = filteredLogs.filter((l) => l.event_type.includes("BLOCKED") || l.event_type.includes("ANOMALY")).length;
    const violation = filteredLogs.filter((l) => l.event_type.includes("BLOCKED")).length;
    const riskPct = total > 0 ? ((important / total) * 100) : 0;
    const riskDeg = Math.round((important / Math.max(total, 1)) * 360);
    return { catCounts, total, important, violation, riskPct, riskDeg };
  }, [filteredLogs]);

  const { points: chartPoints, circlePts } = useMemo(() => buildChartPoints(filteredLogs), [filteredLogs]);

  const visibleLogs = sortOrder === "desc" ? filteredLogs.slice(0, showCount) : filteredLogs.slice(0, showCount);

  // ── Handlers ──────────────────────────────────────────────────────────────────

  async function openStatsDialog() {
    setShowStatsDialog(true);
    if (chainValid === null && !chainLoading) {
      setChainLoading(true);
      try {
        const res = await fetch("/api/v1/audit-log/verify");
        const data = (await res.json()) as { is_valid: boolean };
        setChainValid(data.is_valid);
      } catch {
        setChainValid(false);
      } finally {
        setChainLoading(false);
      }
    }
  }

  async function openAiDialog() {
    if (aiState !== "idle") { setShowAiDialog(true); return; }
    setAiState("loading");
    setShowAiDialog(true);
    const report = await fetchAnomalyAiReport();
    setAiReport(report);
    setAiState("done");
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Filter bar ── */}
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        {/* Week selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setWeekOpen((o) => !o); setUserOpen(false); setFilterOpen(false); }}
            className={`rounded-lg border px-3 py-2 text-xs font-bold transition hover:bg-white/5 hover:text-white ${selectedWeek !== "all" ? "border-white/20 bg-white/5 text-white" : "border-white/10 bg-[#111722] text-zinc-400"}`}
          >
            {getWeekRangeLabel(selectedWeek)} ⌄
          </button>
          <Dropdown open={weekOpen} onClose={() => setWeekOpen(false)}>
            {(Object.entries(WEEK_LABELS) as [WeekOption, string][]).map(([key, label]) => (
              <DropdownItem
                key={key}
                label={label}
                active={selectedWeek === key}
                onClick={() => { setSelectedWeek(key); setWeekOpen(false); setShowCount(20); }}
              />
            ))}
          </Dropdown>
        </div>

        {/* User selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setUserOpen((o) => !o); setWeekOpen(false); setFilterOpen(false); }}
            className={`rounded-lg border px-3 py-2 text-xs font-bold transition hover:bg-white/5 hover:text-white ${selectedUser !== "all" ? "border-white/20 bg-white/5 text-white" : "border-white/10 bg-[#111722] text-zinc-400"}`}
          >
            {selectedUser === "all" ? "전체 사용자" : selectedUser} ⌄
          </button>
          <Dropdown open={userOpen} onClose={() => setUserOpen(false)}>
            <DropdownItem label="전체 사용자" active={selectedUser === "all"} onClick={() => { setSelectedUser("all"); setUserOpen(false); }} />
            {allUsers.filter((u) => u !== "all").map((u) => (
              <DropdownItem key={u} label={u} active={selectedUser === u} onClick={() => { setSelectedUser(u); setUserOpen(false); }} />
            ))}
          </Dropdown>
        </div>

        {/* Event type filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setFilterOpen((o) => !o); setWeekOpen(false); setUserOpen(false); }}
            className={`rounded-lg border px-3 py-2 text-xs font-bold transition hover:bg-white/5 hover:text-white ${filterType !== "전체" ? "border-white/20 bg-white/5 text-white" : "border-white/10 bg-[#111722] text-zinc-400"}`}
          >
            {filterType === "전체" ? "이벤트 유형" : filterType} ⌄
          </button>
          <Dropdown open={filterOpen} onClose={() => setFilterOpen(false)}>
            {EVENT_FILTERS.map((f) => (
              <DropdownItem key={f} label={f} active={filterType === f} onClick={() => { setFilterType(f); setFilterOpen(false); setShowCount(20); }} />
            ))}
          </Dropdown>
        </div>

        {/* Reset */}
        {(selectedWeek !== "all" || selectedUser !== "all" || filterType !== "전체") && (
          <button
            type="button"
            onClick={() => { setSelectedWeek("all"); setSelectedUser("all"); setFilterType("전체"); setShowCount(20); }}
            className="rounded-lg border border-white/10 bg-[#111722] px-3 py-2 text-xs font-bold text-zinc-500 transition hover:text-zinc-300"
          >
            초기화
          </button>
        )}
      </div>

      {/* ── Summary card ── */}
      <Card className="mt-5 p-6">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr_1fr_1.15fr] xl:items-center xl:divide-x xl:divide-white/10">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-[#141b27] text-[#8290a5]">
                <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                  <path d="M12 4 19 7v5.5c0 4.1-2.8 6.4-7 7.5-4.2-1.1-7-3.4-7-7.5V7l7-3Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
                </svg>
              </span>
              <h2 className="text-base font-black text-[#fbfbdc]">최근 보안 활동 요약</h2>
            </div>
          </div>
          {[
            { label: "총 활동", value: `${stats.total}건`, helper: "조회된 전체 활동" },
            { label: "중요 이벤트", value: `${stats.important}건`, helper: "즉시 검토가 필요한 이벤트" },
            { label: "정책 위반 관련", value: `${stats.violation}건`, helper: "정책 위반 또는 예외 승인" },
          ].map((item) => (
            <div key={item.label} className="xl:px-6">
              <p className="text-xs font-bold text-zinc-500">{item.label}</p>
              <p className="mt-2 text-3xl font-black text-[#fbfbdc]">{item.value}</p>
              <p className="mt-2 text-xs font-semibold text-zinc-500">{item.helper}</p>
            </div>
          ))}
          <div className="xl:px-6">
            <div className="grid grid-cols-[92px_minmax(0,1fr)] items-center gap-4">
              <div
                className="relative flex size-20 items-center justify-center rounded-full"
                style={{ background: `conic-gradient(#8fb7ca 0deg ${stats.riskDeg}deg, #243041 ${stats.riskDeg}deg 360deg)` }}
              >
                <div className="flex size-16 flex-col items-center justify-center rounded-full bg-[#111722]">
                  <span className="text-lg font-black text-[#fbfbdc]">{stats.riskPct.toFixed(1)}%</span>
                  <span className="text-[10px] font-bold text-zinc-500">위험도 지수</span>
                </div>
              </div>
              <p className="text-xs font-semibold leading-6 text-zinc-500">
                {WEEK_LABELS[selectedWeek]} 기준
                <br />
                {stats.riskPct < 10 ? "위험도가 낮습니다." : stats.riskPct < 30 ? "주의가 필요합니다." : "위험도가 높습니다."}
                <br />
                계속해서 모니터링이 필요합니다.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Timeline card ── */}
      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-black text-[#fbfbdc]">
            활동 타임라인
            {stats.total > 0 && <span className="ml-2 text-sm font-semibold text-zinc-500">({stats.total}건)</span>}
          </h2>
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((o) => !o)}
              className="rounded-lg border border-white/10 bg-black/15 px-3 py-2 text-xs font-bold text-zinc-400 transition hover:text-white"
            >
              {sortOrder === "desc" ? "최신순" : "오래된순"} ⌄
            </button>
            <Dropdown open={sortOpen} onClose={() => setSortOpen(false)}>
              <DropdownItem label="최신순" active={sortOrder === "desc"} onClick={() => { setSortOrder("desc"); setSortOpen(false); }} />
              <DropdownItem label="오래된순" active={sortOrder === "asc"} onClick={() => { setSortOrder("asc"); setSortOpen(false); }} />
            </Dropdown>
          </div>
        </div>

        <div className="relative mt-6">
          <div className="absolute left-[60px] top-2 hidden h-[calc(100%-26px)] w-px bg-[#334155] sm:block" />
          {visibleLogs.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-500">조건에 맞는 활동이 없습니다.</p>
          )}
          {visibleLogs.map((log) => {
            const { type, tone } = eventTypeLabel(log.event_type);
            const data = log.event_data as Record<string, unknown>;
            const employeeId = data.employee_id as number | undefined;
            const merchantName = data.merchant_name as string | undefined;
            const category = data.category as string | undefined;
            const reason = data.reason as string | undefined;
            const user = employeeId != null ? `직원 #${employeeId}` : "시스템";
            const event = [merchantName, category].filter(Boolean).join(" · ") || type;
            const desc = reason ?? type;
            return (
              <div
                key={log.audit_id}
                className="grid gap-4 border-b border-white/[0.06] py-4 last:border-0 sm:grid-cols-[48px_24px_64px_minmax(0,1fr)_110px_110px] sm:items-center"
              >
                <span className="text-xs font-semibold text-zinc-500">{formatTime(log.created_at)}</span>
                <span className="relative hidden size-3 rounded-full bg-[#7f9dbb] ring-4 ring-[#111722] sm:block" />
                <span className={`flex size-10 items-center justify-center rounded-full text-xs font-black ${tone}`}>
                  {user.slice(0, 2)}
                </span>
                <div>
                  <p className="text-sm font-black text-[#fbfbdc]">{user}</p>
                  <p className="mt-2 text-sm font-bold text-zinc-300">{event}</p>
                  <p className="mt-1 text-xs text-zinc-500">{desc}</p>
                </div>
                <span className="w-fit rounded-md border border-white/15 px-2.5 py-1 text-xs font-bold text-zinc-300">
                  {type}
                </span>
                <span className="text-xs font-semibold text-zinc-500 sm:text-right">-</span>
              </div>
            );
          })}
        </div>

        {filteredLogs.length > showCount && (
          <button
            type="button"
            onClick={() => setShowCount((c) => c + 20)}
            className="mt-6 w-full rounded-lg border border-white/10 px-4 py-3 text-sm font-bold text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            더 많은 활동 보기 ({filteredLogs.length - showCount}건 더) ⌄
          </button>
        )}
        {filteredLogs.length > 0 && filteredLogs.length <= showCount && showCount > 20 && (
          <p className="mt-4 text-center text-xs text-zinc-600">모든 활동을 표시했습니다.</p>
        )}
      </Card>

      {/* ── Bottom section ── */}
      <section className="mt-6 grid gap-5 xl:grid-cols-2">
        {/* Activity summary donut */}
        <Card className="p-6">
          <h2 className="text-lg font-black text-[#fbfbdc]">활동 유형 분포</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center">
            <div
              className="relative mx-auto flex size-36 items-center justify-center rounded-full"
              style={{ background: buildConicGradient(stats.catCounts) }}
            >
              <div className="flex size-24 flex-col items-center justify-center rounded-full bg-[#111722] text-center">
                <span className="text-xs font-bold text-zinc-500">필터 기준</span>
                <span className="text-3xl font-black text-[#fbfbdc]">{stats.total}건</span>
                <span className="text-xs font-bold text-zinc-500">총 활동</span>
              </div>
            </div>
            <div className="grid gap-3">
              {Object.entries(stats.catCounts).map(([label, count]) => {
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={label} className="grid grid-cols-[12px_1fr_42px_40px] items-center gap-3 text-xs font-semibold">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: CAT_COLORS[label] }} />
                    <span className="text-zinc-400">{label}</span>
                    <span className="text-zinc-300">{pct}%</span>
                    <span className="text-zinc-500">({count}건)</span>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={openStatsDialog}
                className="mt-4 rounded-lg border border-white/10 px-4 py-2.5 text-xs font-bold text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                전체 통계 보기
              </button>
            </div>
          </div>
        </Card>

        {/* AI anomaly card */}
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-[#f1d9df]/15 text-[#f1d9df]">✧</span>
              <h2 className="text-lg font-black text-[#fbfbdc]">AI 이상 활동 분석</h2>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-black ${stats.riskPct >= 30 ? "bg-rose-400/20 text-rose-200" : stats.riskPct >= 10 ? "bg-amber-400/20 text-amber-200" : "bg-cyan-400/20 text-cyan-200"}`}>
              {stats.riskPct >= 30 ? "위험" : stats.riskPct >= 10 ? "주의" : "정상"}
            </span>
          </div>
          <p className="mt-5 text-sm leading-7 text-zinc-500">
            {stats.important > 0
              ? `중요 이벤트 ${stats.important}건이 감지되었습니다. 추가 검토를 권장합니다.`
              : "현재 이상 활동이 감지되지 않았습니다. 정상 범위입니다."}
          </p>
          <svg viewBox="0 0 420 150" className="mt-5 h-36 w-full" role="img" aria-label="이상 활동 추이">
            <defs>
              <linearGradient id="auditArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#f3cbd3" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#f3cbd3" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`M${circlePts[0].x} ${circlePts[0].y} ${circlePts.slice(1).map((p) => `L${p.x} ${p.y}`).join(" ")} L${circlePts[circlePts.length - 1].x} 140 L${circlePts[0].x} 140Z`}
              fill="url(#auditArea)"
            />
            <polyline points={chartPoints} fill="none" stroke="#d8b8c0" strokeWidth="3" />
            {circlePts.map((p) => (
              <circle key={`${p.x}-${p.y}`} cx={p.x} cy={p.y} r="3" fill="#f3cbd3" />
            ))}
          </svg>
          <button
            type="button"
            onClick={openAiDialog}
            disabled={aiState === "loading"}
            className="mt-4 rounded-lg bg-[#f1d9df] px-5 py-2.5 text-xs font-black text-[#130b10] transition hover:bg-[#f7e6eb] disabled:opacity-50"
          >
            {aiState === "loading" ? "AI 분석 중..." : "자세히 보기"}
          </button>
        </Card>
      </section>

      {/* ── Stats Dialog ── */}
      {showStatsDialog && (
        <>
          <Overlay onClose={() => setShowStatsDialog(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-white/10 bg-[#0e1420] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <h3 className="text-lg font-black text-[#fbfbdc]">전체 통계</h3>
                <button type="button" onClick={() => setShowStatsDialog(false)} className="text-zinc-500 hover:text-white">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* Event type breakdown */}
                <div>
                  <h4 className="text-xs font-bold text-zinc-500 mb-3">이벤트 유형별 분포</h4>
                  <div className="space-y-3">
                    {Object.entries(stats.catCounts).map(([label, count]) => {
                      const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                      return (
                        <div key={label} className="grid grid-cols-[100px_1fr_40px] items-center gap-3 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: CAT_COLORS[label] }} />
                            <span className="text-zinc-400 font-semibold">{label}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-700/70">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: CAT_COLORS[label] }} />
                          </div>
                          <span className="text-right font-bold text-zinc-300">{count}건</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Summary stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "전체 이벤트", value: `${stats.total}건` },
                    { label: "위험 이벤트", value: `${stats.important}건` },
                    { label: "위험도 지수", value: `${stats.riskPct.toFixed(1)}%` },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-white/[0.06] bg-black/20 p-3 text-center">
                      <p className="text-xs font-bold text-zinc-500">{s.label}</p>
                      <p className="mt-1 text-lg font-black text-[#fbfbdc]">{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Chain verify */}
                <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
                  <h4 className="text-xs font-bold text-zinc-500">감사 체인 무결성 검증</h4>
                  {chainLoading && <p className="mt-2 text-xs text-zinc-500">검증 중...</p>}
                  {!chainLoading && chainValid === null && <p className="mt-2 text-xs text-zinc-500">불러오는 중...</p>}
                  {!chainLoading && chainValid === true && (
                    <p className="mt-2 text-xs font-bold text-cyan-300">✓ 체인 무결성이 확인되었습니다.</p>
                  )}
                  {!chainLoading && chainValid === false && (
                    <p className="mt-2 text-xs font-bold text-rose-300">⚠ 체인 무결성에 문제가 감지되었습니다.</p>
                  )}
                </div>
              </div>
              <div className="border-t border-white/10 px-6 py-4">
                <button type="button" onClick={() => setShowStatsDialog(false)} className="w-full rounded-lg border border-white/10 py-2.5 text-xs font-bold text-zinc-400 hover:bg-white/5">닫기</button>
              </div>
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
                <h3 className="text-lg font-black text-[#fbfbdc]">AI 이상 활동 분석 보고서</h3>
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
              <div className="border-t border-white/10 px-6 py-4">
                <button type="button" onClick={() => setShowAiDialog(false)} className="w-full rounded-lg border border-white/10 py-2.5 text-xs font-bold text-zinc-400 hover:bg-white/5">닫기</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
