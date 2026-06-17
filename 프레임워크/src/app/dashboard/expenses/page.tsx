import { DashboardShell } from "@/components/dashboard/DashboardShell";

const aiResults = [
  { label: "정책 위반", value: "3건", helper: "즉시 검토 필요", tone: "text-rose-300" },
  { label: "정상 결제", value: "847건", helper: "전월 대비 +5%", tone: "text-cyan-200" },
  { label: "승인 대기", value: "1건", helper: "검토 대기 중", tone: "text-zinc-300" },
];

const payments = [
  {
    date: "06-13 14:32",
    employee: "김태훈",
    department: "마케팅",
    merchant: "Adobe Creative",
    category: "디자인",
    amount: "320,000원",
    status: "정상",
    action: "-",
  },
  {
    date: "06-13 13:11",
    employee: "박소현",
    department: "영업팀",
    merchant: "스시 오마카세",
    category: "접대",
    amount: "890,000원",
    status: "한도초과",
    action: "조치",
  },
  {
    date: "06-13 11:48",
    employee: "최민준",
    department: "개발팀",
    merchant: "AWS Korea",
    category: "클라우드",
    amount: "1,240,000원",
    status: "정상",
    action: "-",
  },
  {
    date: "06-13 10:22",
    employee: "정유미",
    department: "인사팀",
    merchant: "GS25 편의점",
    category: "편의점",
    amount: "58,000원",
    status: "검토 중",
    action: "검토",
  },
  {
    date: "06-13 09:05",
    employee: "이지수",
    department: "재무팀",
    merchant: "Notion",
    category: "SaaS",
    amount: "180,000원",
    status: "정상",
    action: "-",
  },
];

const departmentUsage = [
  { label: "영업팀", value: 92 },
  { label: "마케팅팀", value: 78 },
  { label: "개발팀", value: 55 },
  { label: "인사팀", value: 41 },
  { label: "재무팀", value: 29 },
];

const categorySpend = [
  { label: "클라우드", value: 92, amount: "₩42.3M" },
  { label: "소프트웨어", value: 78, amount: "₩28.1M" },
  { label: "식비", value: 55, amount: "₩19.8M" },
  { label: "출장", value: 41, amount: "₩14.2M" },
  { label: "기타", value: 29, amount: "₩6.4M" },
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

function getProgressColor(value: number) {
  if (value >= 80) return "bg-rose-200";
  if (value >= 60) return "bg-orange-300";
  if (value >= 40) return "bg-cyan-300";
  return "bg-yellow-100";
}

function ProgressRow({
  label,
  value,
  amount,
}: {
  label: string;
  value: number;
  amount?: string;
}) {
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
  return "border-amber-300/20 bg-amber-300/10 text-amber-200";
}

export default function ExpensesPage() {
  return (
    <DashboardShell
      activeHref="/dashboard/expenses"
      title="법인카드 결제"
      description="2026년 6월 13일 기준"
    >
      <Card className="mt-7 p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_1.3fr] lg:divide-x lg:divide-white/10">
          <div className="lg:pr-8">
            <p className="text-xs font-bold text-zinc-500">이번 달 총 사용액</p>
            <p className="mt-3 text-3xl font-black text-[#fbfbdc]">₩124,380,000</p>
            <p className="mt-3 text-sm font-semibold text-zinc-400">예산 대비 68% 사용 중</p>
            <p className="mt-1 text-xs font-semibold text-[#8290a5]">지난달 대비 +5% (5,290,000원)</p>
            <div className="mt-7 flex items-center gap-4">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-700/70">
                <div className="h-full w-[68%] rounded-full bg-[#f1cbd3]" />
              </div>
              <span className="text-xs font-bold text-zinc-500">68%</span>
            </div>
          </div>

          <div className="lg:pl-8">
            <h2 className="text-base font-black text-[#fbfbdc]">AI 감지 결과</h2>
            <div className="mt-4 grid gap-3">
              {aiResults.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-white/[0.06] bg-black/15 px-4 py-3"
                >
                  <span className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-[#141b27] text-xs text-[#8290a5]">
                    △
                  </span>
                  <div>
                    <p className="text-xs font-bold text-zinc-500">{item.label}</p>
                    <p className={`mt-1 text-lg font-black ${item.tone}`}>{item.value}</p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <span className="text-xs font-semibold text-zinc-500">{item.helper}</span>
                    <span className="text-zinc-600">›</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          className="rounded-lg border border-white/10 bg-[#111722] px-4 py-2 text-xs font-bold text-zinc-300 transition hover:bg-white/5"
        >
          CSV 내보내기
        </button>
        <button
          type="button"
          className="rounded-lg bg-[#f1d9df] px-4 py-2 text-xs font-black text-[#130b10] transition hover:bg-[#f7e6eb]"
        >
          + 구독 추가
        </button>
      </div>

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
              {payments.map((payment) => (
                <tr key={`${payment.date}-${payment.employee}`} className="border-b border-white/[0.06] last:border-0">
                  <td className="px-5 py-4 text-zinc-400">{payment.date}</td>
                  <td className="px-4 py-4 font-semibold text-[#fbfbdc]">{payment.employee}</td>
                  <td className="px-4 py-4 text-zinc-400">{payment.department}</td>
                  <td className="px-4 py-4 text-zinc-300">{payment.merchant}</td>
                  <td className="px-4 py-4 text-zinc-400">{payment.category}</td>
                  <td className="px-4 py-4 text-zinc-300">{payment.amount}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-md border px-2 py-1 text-[11px] font-black ${statusClass(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {payment.action === "-" ? (
                      <span className="text-zinc-500">-</span>
                    ) : (
                      <button
                        type="button"
                        className="rounded-md border border-white/10 px-3 py-1 text-[11px] font-bold text-zinc-300 hover:bg-white/5"
                      >
                        {payment.action}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

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
            {categorySpend.map((item) => (
              <ProgressRow key={item.label} label={item.label} value={item.value} amount={item.amount} />
            ))}
          </div>
        </Card>
      </section>

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
              박소현(영업팀)의 스시 오마카세 결제가 정책 허용 한도(700,000원)를 초과했습니다.
              <br />
              해당 항목을 수정하거나 예외 승인 시 유사 사례를 자동 관리할 수 있습니다.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-lg bg-[#f1d9df] px-5 py-2.5 text-xs font-black text-[#130b10] transition hover:bg-[#f7e6eb]"
              >
                정책 수정
              </button>
              <button
                type="button"
                className="rounded-lg border border-white/10 px-5 py-2.5 text-xs font-bold text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                예외 승인
              </button>
            </div>
          </div>
        </div>
      </Card>
    </DashboardShell>
  );
}
