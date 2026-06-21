// ── Types ──────────────────────────────────────────────────────────────────

export interface DepartmentBudget {
  department_id: number;
  department_name: string;
  monthly_budget_limit: number;
  current_spending: number;
  spend_rate: number;
}

export interface TodaySummary {
  total_spending: number;
  transaction_count: number;
  blocked_count: number;
  approved_count: number;
}

export interface SaasSummary {
  total_monthly_fee: number;
  total_wasted_amount: number;
  high_risk_count: number;
  ghost_account_count: number;
}

export interface DashboardSummary {
  today: TodaySummary;
  saas: SaasSummary;
  pending_approval_count: number;
  anomaly_count: number;
  department_budgets: DepartmentBudget[];
}

export interface RecentTransaction {
  transaction_id: number;
  employee_name: string;
  department_name: string;
  merchant_name: string;
  amount: number;
  category: string;
  is_approved: boolean | null;
  payment_time: string;
}

export interface Transaction {
  transaction_id: number;
  employee_name: string;
  department_name: string;
  merchant_name: string;
  amount: string;
  category: string;
  user_input_reason: string;
  is_approved: boolean | null;
  ai_risk_score: number | null;
  ai_risk_reason: string;
  payment_time: string;
}

export interface SaasSubscription {
  subscription_id: number;
  subscription_name: string;
  provider: string;
  monthly_fee: string;
  total_seats: number;
  used_seats: number;
  wasted_amount: string;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  renewal_date: string;
  department_id: number;
}

export interface GhostAccount {
  usage_id: number;
  employee_id: number;
  subscription_id: number;
  subscription_name: string;
  last_login_date: string;
  monthly_usage_count: number;
  is_ghost_account: boolean;
}

export interface PendingApproval {
  approval_id: number;
  transaction_id: number;
  employee_name: string;
  department_name: string;
  merchant_name: string;
  amount: number;
  approval_reason: string;
  requested_at: string;
}

export interface AuditLog {
  audit_id: number;
  event_type: string;
  event_data: Record<string, unknown>;
  current_hash: string;
  created_at: string;
}

export interface DeptAnomaly {
  department_id: number;
  department_name: string;
  current_spending: number;
  mean_spending: number;
  z_score: number;
  is_anomaly: boolean;
  excess_amount: number;
}

export interface Policy {
  policy_id: number;
  employee_id: number | null;
  department_id: number | null;
  restricted_category: string | null;
  single_payment_limit: number | null;
  is_blocked: boolean;
}

// ── Fetch helper ────────────────────────────────────────────────────────────

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status} for ${path}`);
  }
  return res.json() as Promise<T>;
}

// ── Exported fetch functions ────────────────────────────────────────────────

export function getDashboardSummary(): Promise<DashboardSummary> {
  return apiFetch<DashboardSummary>("/api/v1/dashboard/summary");
}

export function getRecentTransactions(limit = 5): Promise<RecentTransaction[]> {
  return apiFetch<RecentTransaction[]>(`/api/v1/dashboard/transactions/recent?limit=${limit}`);
}

export function getTransactions(limit = 100): Promise<Transaction[]> {
  return apiFetch<Transaction[]>(`/api/v1/transactions?limit=${limit}`);
}

export function getSaasSubscriptions(limit = 100): Promise<SaasSubscription[]> {
  return apiFetch<SaasSubscription[]>(`/api/v1/saas/subscriptions?limit=${limit}`);
}

export function getGhostAccounts(limit = 100): Promise<GhostAccount[]> {
  return apiFetch<GhostAccount[]>(`/api/v1/saas/ghost-accounts?limit=${limit}`);
}

export function getPendingApprovals(): Promise<PendingApproval[]> {
  return apiFetch<PendingApproval[]>("/api/v1/approvals/pending");
}

export function getAuditLog(limit = 30): Promise<AuditLog[]> {
  return apiFetch<AuditLog[]>(`/api/v1/audit-log?limit=${limit}`);
}

export function getPolicies(): Promise<Policy[]> {
  return apiFetch<Policy[]>("/api/v1/policies");
}

export function getAnomalyReport(): Promise<DeptAnomaly[]> {
  return apiFetch<DeptAnomaly[]>("/api/v1/reports/anomaly");
}

export async function decideApproval(
  approvalId: number,
  decision: boolean,
  reason: string,
): Promise<void> {
  const res = await fetch(`/api/approvals/${approvalId}/decide`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision, reason }),
  });
  if (!res.ok) throw new Error(`결정 처리 실패 (${res.status})`);
}

// ── Utility helpers ─────────────────────────────────────────────────────────

export function formatKRW(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return "₩" + Math.round(num).toLocaleString("ko-KR");
}

/** ISO UTC string → "MM-DD HH:mm" (KST = UTC+9) */
export function formatDate(iso: string): string {
  const d = new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000);
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  return `${mm}-${dd} ${hh}:${min}`;
}

/** ISO UTC string → "HH:mm" (KST = UTC+9) */
export function formatTime(iso: string): string {
  const d = new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${min}`;
}

/** Usage rate as integer 0-100 */
export function saasUsageRate(sub: SaasSubscription): number {
  if (sub.total_seats === 0) return 0;
  return Math.round((sub.used_seats / sub.total_seats) * 100);
}

/** Status string for a subscription */
export function saasStatus(sub: SaasSubscription): "정상" | "미사용" | "갱신 임박" {
  const rate = saasUsageRate(sub);
  if (rate < 20) return "미사용";
  // renewal within 30 days
  const renewalMs = new Date(sub.renewal_date).getTime();
  const nowMs = Date.now();
  const daysUntil = (renewalMs - nowMs) / (1000 * 60 * 60 * 24);
  if (daysUntil <= 30) return "갱신 임박";
  return "정상";
}
