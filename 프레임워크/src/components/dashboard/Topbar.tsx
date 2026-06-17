type TopbarProps = {
  title: string;
  description: string;
};

export function Topbar({ title, description }: TopbarProps) {
  return (
    <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-3xl font-black text-[#fbfbdc]">{title}</h1>
        <p className="mt-2 text-sm font-medium text-zinc-500">{description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-[#111722] px-4 text-sm font-black text-slate-200 shadow-xl shadow-black/25 transition hover:bg-[#151d2a] sm:h-14 sm:px-5 sm:text-base"
        >
          <span className="relative flex size-3 items-center justify-center rounded-full bg-[#f1d9df] shadow-[0_0_18px_rgba(241,217,223,0.75)]">
            <span className="absolute size-6 rounded-full bg-[#f1d9df]/20 blur-sm" />
          </span>
          실시간 동기화
        </button>
        <button
          type="button"
          aria-label="검색"
          className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-[#111722] text-slate-200 shadow-xl shadow-black/25 transition hover:bg-[#151d2a] sm:size-14"
        >
          <span className="relative block size-6 rounded-full border-[4px] border-current sm:size-7">
            <span className="absolute -bottom-2 -right-1 h-3 w-1 rounded-full bg-current rotate-[-45deg]" />
          </span>
        </button>
        <button
          type="button"
          aria-label="알림"
          className="relative flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-[#111722] text-slate-200 shadow-xl shadow-black/25 transition hover:bg-[#151d2a] sm:size-14"
        >
          <span className="absolute -right-2 -top-2 flex size-[22px] items-center justify-center rounded-full bg-[#f1d9df] text-xs font-black text-[#141018]">
            3
          </span>
          <svg viewBox="0 0 32 32" className="size-7 sm:size-8" aria-hidden="true">
            <path
              d="M9 23h14M11 23V13a5 5 0 0 1 10 0v10M14 26a2 2 0 0 0 4 0"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            />
            <path d="M16 6v2" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
          </svg>
        </button>
      </div>
    </header>
  );
}
