type TopbarProps = {
  title: string;
  description: string;
};

export function Topbar({ title, description }: TopbarProps) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-black text-[#fbfbdc]">{title}</h1>
        <p className="mt-2 text-sm font-medium text-zinc-500">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg border border-white/[0.08] bg-[#111722] px-4 py-2 text-xs font-bold text-zinc-300 transition hover:bg-[#151d2a]"
        >
          데이터 동기화
        </button>
        <div className="flex size-10 items-center justify-center rounded-lg border border-white/[0.08] bg-[#111722] text-xs text-zinc-400">
          검색
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg border border-white/[0.08] bg-[#111722] text-xs text-zinc-400">
          알림
        </div>
      </div>
    </header>
  );
}
