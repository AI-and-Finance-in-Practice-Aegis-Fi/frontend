"use client";

import { useState } from "react";

import type { PendingApproval } from "@/lib/api";
import { decideApproval, formatDate, formatKRW } from "@/lib/api";

type ActionState = "idle" | "submitting" | "done" | "error";

function ReasonDialog({
  label,
  onConfirm,
  onCancel,
}: {
  label: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0e1420] p-6 shadow-2xl">
        <h3 className="text-base font-black text-[#fbfbdc]">{label}</h3>
        <label className="mt-4 block">
          <span className="text-xs font-bold text-zinc-500">사유 *</span>
          <textarea
            autoFocus
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="처리 사유를 입력하세요."
            className="mt-1.5 w-full resize-none rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/20"
          />
        </label>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-white/10 py-2.5 text-xs font-bold text-zinc-400 hover:bg-white/5"
          >
            취소
          </button>
          <button
            type="button"
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason.trim())}
            className="flex-1 rounded-lg bg-[#f1d9df] py-2.5 text-xs font-black text-[#130b10] hover:bg-[#f7e6eb] disabled:opacity-50"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

function ApprovalRow({
  item,
  onDecide,
}: {
  item: PendingApproval;
  onDecide: (id: number, decision: boolean, reason: string) => Promise<void>;
}) {
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [dialog, setDialog] = useState<"approve" | "reject" | null>(null);

  async function handleDecide(decision: boolean, reason: string) {
    setDialog(null);
    setActionState("submitting");
    try {
      await onDecide(item.approval_id, decision, reason);
      setActionState("done");
    } catch {
      setActionState("error");
    }
  }

  if (actionState === "done") return null;

  return (
    <>
      {dialog && (
        <ReasonDialog
          label={dialog === "approve" ? "예외 승인 처리" : "결제 반려 처리"}
          onConfirm={(reason) => handleDecide(dialog === "approve", reason)}
          onCancel={() => setDialog(null)}
        />
      )}

      <div className="grid gap-3 border-b border-white/[0.06] py-4 last:border-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-black text-[#fbfbdc]">{item.employee_name}</span>
            <span className="text-xs text-zinc-500">{item.department_name}</span>
            <span className="rounded-md border border-rose-300/20 bg-rose-400/10 px-1.5 py-0.5 text-[11px] font-black text-rose-300">
              차단됨
            </span>
          </div>
          <p className="mt-1 truncate text-sm font-semibold text-zinc-300">
            {item.merchant_name}
            <span className="ml-2 font-black text-[#fbfbdc]">{formatKRW(item.amount)}</span>
          </p>
          {item.approval_reason && (
            <p className="mt-1 truncate text-xs text-zinc-500">AI 사유: {item.approval_reason}</p>
          )}
          <p className="mt-1 text-[11px] text-zinc-600">{formatDate(item.requested_at)}</p>
        </div>

        <div className="flex shrink-0 gap-2">
          {actionState === "error" && (
            <span className="text-xs text-rose-400">처리 실패</span>
          )}
          <button
            type="button"
            disabled={actionState === "submitting"}
            onClick={() => setDialog("reject")}
            className="rounded-lg border border-white/10 px-4 py-2 text-[11px] font-bold text-zinc-300 transition hover:bg-white/5 disabled:opacity-40"
          >
            반려
          </button>
          <button
            type="button"
            disabled={actionState === "submitting"}
            onClick={() => setDialog("approve")}
            className="rounded-lg bg-[#8fc5d4]/20 px-4 py-2 text-[11px] font-black text-[#8fc5d4] transition hover:bg-[#8fc5d4]/30 disabled:opacity-40"
          >
            {actionState === "submitting" ? "처리 중..." : "예외 승인"}
          </button>
        </div>
      </div>
    </>
  );
}

export default function PendingApprovalsCard({
  initialItems,
}: {
  initialItems: PendingApproval[];
}) {
  const [items, setItems] = useState<PendingApproval[]>(initialItems);

  async function handleDecide(approvalId: number, decision: boolean, reason: string) {
    await decideApproval(approvalId, decision, reason);
    setItems((prev) => prev.filter((i) => i.approval_id !== approvalId));
  }

  if (items.length === 0) return null;

  return (
    <article className="mt-7 rounded-2xl border border-rose-300/20 bg-[#111722] shadow-2xl shadow-black/30">
      <div className="flex items-center gap-3 border-b border-white/[0.08] px-5 py-4">
        <span className="flex size-5 items-center justify-center rounded-full bg-rose-400/20 text-[11px] font-black text-rose-300">
          !
        </span>
        <h2 className="text-base font-black text-[#fbfbdc]">승인 대기 결제</h2>
        <span className="ml-auto rounded-full bg-rose-400/15 px-2.5 py-0.5 text-xs font-black text-rose-300">
          {items.length}건
        </span>
      </div>
      <div className="px-5">
        {items.map((item) => (
          <ApprovalRow key={item.approval_id} item={item} onDecide={handleDecide} />
        ))}
      </div>
    </article>
  );
}
