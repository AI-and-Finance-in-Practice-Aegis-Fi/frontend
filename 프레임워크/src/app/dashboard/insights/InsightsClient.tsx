"use client";

import { useState } from "react";

import type { DeptAnomaly, SaasSubscription } from "@/lib/api";
import { formatKRW } from "@/lib/api";
import { downloadReportAsPdf } from "@/lib/pdf";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Factor {
  label: string;
  percent: number;
  color: string;
}

export interface Stat {
  label: string;
  value: string;
  helper: string;
  tone: string;
  icon: string;
}

export interface Insight {
  title: string;
  description: string;
}

export interface Recommendation {
  title: string;
  body: string;
  pills: string[];
  accent: string;
  sub: SaasSubscription;
}

export interface Saving {
  title: string;
  label: string;
  value: string;
  helper: string;
  tone: string;
}

interface Props {
  stats: Stat[];
  insights: Insight[];
  recommendations: Recommendation[];
  savings: Saving[];
  anomalies: DeptAnomaly[];
  factors: Factor[];
  totalSpend: number;
  wastedAmount: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function semiArcPoint(cx: number, cy: number, r: number, fraction: number) {
  const angle = Math.PI * (1 - fraction);
  return {
    x: +(cx + r * Math.cos(angle)).toFixed(1),
    y: +(cy - r * Math.sin(angle)).toFixed(1),
  };
}

function semiArcPath(cx: number, cy: number, r: number, f1: number, f2: number): string {
  const p1 = semiArcPoint(cx, cy, r, f1);
  const p2 = semiArcPoint(cx, cy, r, f2);
  const large = f2 - f1 > 0.5 ? 1 : 0;
  return `M${p1.x} ${p1.y} A${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`;
}

function buildInsightsReport(
  insights: Insight[],
  recommendations: Recommendation[],
  savings: Saving[],
  anomalies: DeptAnomaly[],
): string {
  const anomalyLines = anomalies
    .filter((a) => a.is_anomaly)
    .map((a) => `• ${a.department_name}: 초과 지출 ${formatKRW(a.excess_amount)} (Z-score ${a.z_score.toFixed(2)})`)
    .join("\n") || "이상 감지 없음";

  return `■ 이번 달 핵심 인사이트
${insights.map((i) => `• ${i.title}${i.description ? "\n  " + i.description : ""}`).join("\n")}

■ SaaS 구독 최적화 요약
${recommendations.length > 0 ? recommendations.map((r) => `• ${r.title}\n  ${r.body}`).join("\n") : "최적화 대상 없음"}

■ 절감 가능 금액 분석
${savings.map((s) => `• ${s.title}: ${s.value} (${s.helper})`).join("\n")}

■ 이상 지출 부서 현황
${anomalyLines}

■ 핵심 한 줄 요약
${savings[2]?.value ?? "-"} 절감 가능 — 고위험 구독 ${recommendations.length}건 즉시 조치를 권장합니다.`;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <article className={`rounded-2xl border border-white/10 bg-[#111722] shadow-2xl shadow-black/30 ${className}`}>
      {children}
    </article>
  );
}

function StatIcon({ type }: { type: string }) {
  if (type === "alert")
    return (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <path d="M12 4.5 21 20H3L12 4.5Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M12 9v5M12 17h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  if (type === "check")
    return (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="m8.5 12 2.3 2.3 4.9-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <rect x="4" y="7" width="16" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 12h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function Overlay({ onClose }: { onClose: () => void }) {
  return <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />;
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function InsightsClient({
  stats,
  insights,
  recommendations,
  savings,
  anomalies,
  factors,
  wastedAmount,
}: Props) {
  const [showAnomalyDialog, setShowAnomalyDialog] = useState(false);
  const [guideTarget, setGuideTarget] = useState<Recommendation | null>(null);

  // Build SVG arc paths from dynamic factors
  const arcPaths: string[] = [];
  let cumulative = 0;
  for (const f of factors) {
    const frac = f.percent / 100;
    if (frac > 0) {
      arcPaths.push(semiArcPath(110, 115, 75, cumulative, cumulative + frac));
    }
    cumulative += frac;
  }

  function handleDownload() {
    const report = buildInsightsReport(insights, recommendations, savings, anomalies);
    downloadReportAsPdf("AI 금융 운영 리포트", report);
  }

  return (
    <>
      {/* ── Stats ── */}
      <section className="mt-7 grid gap-4 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-zinc-500">{stat.label}</p>
                <p className="mt-3 text-3xl font-black text-[#fbfbdc]">{stat.value}</p>
                <p className="mt-3 text-xs font-semibold text-zinc-500">{stat.helper}</p>
              </div>
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${stat.tone}`}>
                <StatIcon type={stat.icon} />
              </span>
            </div>
          </Card>
        ))}
      </section>

      {/* ── Insights + Factors ── */}
      <Card className="mt-6 p-6">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:divide-x lg:divide-white/10">
          <div className="lg:pr-8">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#f3cbd3]" />
              <h2 className="text-lg font-black text-[#fbfbdc]">이번 달 핵심 인사이트</h2>
            </div>
            <div className="mt-7 grid gap-6">
              {insights.map((item) => (
                <div key={item.title} className="grid grid-cols-[36px_minmax(0,1fr)] gap-4">
                  <span className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-[#141b27] text-xs text-[#8290a5]">
                    ◎
                  </span>
                  <div>
                    <p className="text-sm font-semibold leading-7 text-zinc-300">{item.title}</p>
                    {item.description ? (
                      <p className="mt-1 text-sm leading-7 text-zinc-500">{item.description}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:pl-8">
            <h2 className="text-base font-black text-[#fbfbdc]">지출 증가 요인 분석</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
              <svg viewBox="0 0 220 140" className="h-36 w-full" role="img" aria-label="지출 증가 요인 반원형 차트">
                {/* background */}
                <path d="M35 115a75 75 0 0 1 150 0" fill="none" stroke="#253244" strokeWidth="28" strokeLinecap="butt" />
                {arcPaths.map((d, i) => (
                  <path key={i} d={d} fill="none" stroke={factors[i]?.color ?? "#888"} strokeWidth="28" strokeLinecap="butt" />
                ))}
              </svg>
              <div className="grid gap-3">
                {factors.map((factor) => (
                  <div key={factor.label} className="grid grid-cols-[10px_1fr_42px] items-center gap-3 text-xs font-semibold">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: factor.color }} />
                    <span className="text-zinc-400">{factor.label}</span>
                    <span className="text-zinc-300">{factor.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAnomalyDialog(true)}
              className="mt-5 text-xs font-bold text-[#8290a5] hover:text-white"
            >
              자세히 보기 ›
            </button>
          </div>
        </div>
      </Card>

      {/* ── Recommendations ── */}
      <Card className="mt-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#f3cbd3]" />
              <h2 className="text-lg font-black text-[#fbfbdc]">SaaS 구독 최적화 요약</h2>
            </div>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-zinc-300">
              가장 즉각적인 절감 효과를 낼 수 있는 항목은 다음과 같습니다.
            </p>
          </div>
          <span className="w-fit rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-right text-[11px] font-bold text-zinc-400">
            AI Confidence
            <br />
            <span className="text-[#fbfbdc]">94%</span>
          </span>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {recommendations.length > 0 ? (
            recommendations.map((item) => (
              <article key={item.title} className={`rounded-xl border border-white/10 border-l-4 bg-black/15 p-5 ${item.accent}`}>
                <h3 className="text-sm font-black text-[#fbfbdc]">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-zinc-500">{item.body}</p>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {item.pills.map((pill) => (
                    <span key={pill} className="rounded-md bg-white/10 px-3 py-1.5 text-[11px] font-bold text-zinc-300">
                      {pill}
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => setGuideTarget(item)}
                    className="ml-auto rounded-md border border-white/10 px-3 py-1.5 text-[11px] font-bold text-zinc-400 hover:text-white"
                  >
                    조치 가이드 보기 ›
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="text-sm text-zinc-500">고위험 구독이 없습니다.</p>
          )}
        </div>
      </Card>

      {/* ── Savings ── */}
      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        {savings.map((item) => (
          <Card key={item.title} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-black text-[#fbfbdc]">{item.title}</h2>
                <p className="mt-3 text-xs font-bold text-zinc-500">{item.label}</p>
                <p className="mt-2 text-3xl font-black text-[#fbfbdc]">{item.value}</p>
                <p className="mt-3 text-xs font-semibold text-zinc-500">{item.helper}</p>
              </div>
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${item.tone}`}>
                <span className="size-3 rounded-full bg-[#8290a5]" />
              </span>
            </div>
          </Card>
        ))}
      </section>

      <div className="mt-5 flex flex-col gap-3 text-xs font-semibold text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
        <p>AI 분석은 참고 정보이며, 실제 의사결정은 담당자의 검토가 필요합니다.</p>
        <button type="button" onClick={handleDownload} className="text-[#8290a5] hover:text-white">
          리포트 다운로드
        </button>
      </div>

      {/* ── Anomaly Detail Dialog ── */}
      {showAnomalyDialog && (
        <>
          <Overlay onClose={() => setShowAnomalyDialog(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-white/10 bg-[#0e1420] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <h3 className="text-lg font-black text-[#fbfbdc]">지출 증가 요인 상세 분석</h3>
                <button type="button" onClick={() => setShowAnomalyDialog(false)} className="text-zinc-500 hover:text-white">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {/* Factor breakdown */}
                <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
                  <h4 className="text-sm font-black text-[#dbeef2] mb-3">요인별 비중</h4>
                  <div className="space-y-3">
                    {factors.map((f) => (
                      <div key={f.label} className="grid grid-cols-[1fr_48px] items-center gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="size-2 rounded-full" style={{ backgroundColor: f.color }} />
                              <span className="text-xs font-semibold text-zinc-400">{f.label}</span>
                            </div>
                            <span className="text-xs font-bold text-zinc-300">{f.percent}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-700/70">
                            <div className="h-full rounded-full" style={{ width: `${f.percent}%`, backgroundColor: f.color }} />
                          </div>
                        </div>
                        <div />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Anomaly departments */}
                <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
                  <h4 className="text-sm font-black text-[#dbeef2] mb-3">부서별 이상 지출 현황</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-left text-xs">
                      <thead className="border-b border-white/[0.08] text-zinc-500">
                        <tr>
                          <th className="py-2 pr-4 font-semibold">부서명</th>
                          <th className="py-2 pr-4 font-semibold">실제 지출</th>
                          <th className="py-2 pr-4 font-semibold">평균 대비</th>
                          <th className="py-2 pr-4 font-semibold">초과 금액</th>
                          <th className="py-2 font-semibold">판정</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...anomalies]
                          .sort((a, b) => Math.abs(b.z_score) - Math.abs(a.z_score))
                          .map((a) => (
                            <tr key={a.department_id} className="border-b border-white/[0.04] last:border-0">
                              <td className="py-2.5 pr-4 font-semibold text-zinc-200">{a.department_name}</td>
                              <td className="py-2.5 pr-4 text-zinc-400">{formatKRW(a.current_spending)}</td>
                              <td className="py-2.5 pr-4 font-bold text-zinc-300">{a.z_score.toFixed(2)}</td>
                              <td className="py-2.5 pr-4 text-zinc-400">{a.excess_amount > 0 ? formatKRW(a.excess_amount) : "-"}</td>
                              <td className="py-2.5">
                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${a.is_anomaly ? "bg-rose-400/20 text-rose-200" : "bg-emerald-400/20 text-emerald-200"}`}>
                                  {a.is_anomaly ? "이상" : "정상"}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3 text-center">
                    <p className="text-xs font-bold text-zinc-500">이상 감지 부서</p>
                    <p className="mt-1 text-2xl font-black text-rose-200">{anomalies.filter((a) => a.is_anomaly).length}개</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3 text-center">
                    <p className="text-xs font-bold text-zinc-500">SaaS 낭비 추정</p>
                    <p className="mt-1 text-2xl font-black text-[#fbfbdc]">{formatKRW(wastedAmount)}</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-white/10 px-6 py-4">
                <button type="button" onClick={() => setShowAnomalyDialog(false)} className="w-full rounded-lg border border-white/10 py-2.5 text-xs font-bold text-zinc-400 hover:bg-white/5">닫기</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Action Guide Dialog ── */}
      {guideTarget && (
        <>
          <Overlay onClose={() => setGuideTarget(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-white/10 bg-[#0e1420] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <h3 className="text-lg font-black text-[#fbfbdc]">조치 가이드</h3>
                <button type="button" onClick={() => setGuideTarget(null)} className="text-zinc-500 hover:text-white">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
                  <h4 className="text-sm font-black text-[#fbfbdc]">{guideTarget.sub.subscription_name}</h4>
                  <p className="mt-2 text-xs leading-6 text-zinc-400">{guideTarget.body}</p>
                </div>

                <div className="space-y-3">
                  {[
                    { step: 1, title: "현황 확인", desc: `총 ${guideTarget.sub.total_seats}석 중 ${guideTarget.sub.used_seats}석 사용 중 (미사용 ${guideTarget.sub.total_seats - guideTarget.sub.used_seats}석)` },
                    { step: 2, title: "담당 부서장 승인 요청", desc: "좌석 축소 계획을 공유하고 사전 승인을 받으세요." },
                    { step: 3, title: "구독 플랜 변경 신청", desc: `${guideTarget.sub.provider} 관리 콘솔에서 좌석 수 변경을 신청하세요.` },
                    { step: 4, title: "비용 절감 효과 모니터링", desc: "다음 갱신일 이후 청구 금액을 확인하여 절감 효과를 검증하세요." },
                  ].map((s) => (
                    <div key={s.step} className="flex gap-4 rounded-xl border border-white/[0.06] bg-black/20 p-4">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#8fc5d4]/20 text-xs font-black text-[#8fc5d4]">
                        {s.step}
                      </span>
                      <div>
                        <p className="text-sm font-black text-[#fbfbdc]">{s.title}</p>
                        <p className="mt-1 text-xs leading-5 text-zinc-500">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
                  <p className="text-xs font-bold text-zinc-500">갱신일</p>
                  <p className="mt-1 text-sm font-black text-[#fbfbdc]">{guideTarget.sub.renewal_date}</p>
                  <p className="mt-3 text-xs font-bold text-zinc-500">월 절감 예상</p>
                  <p className="mt-1 text-sm font-black text-emerald-300">{formatKRW(parseFloat(guideTarget.sub.wasted_amount))}</p>
                </div>
              </div>
              <div className="border-t border-white/10 px-6 py-4">
                <button type="button" onClick={() => setGuideTarget(null)} className="w-full rounded-lg border border-white/10 py-2.5 text-xs font-bold text-zinc-400 hover:bg-white/5">닫기</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
