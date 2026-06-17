type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
};

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-white/[0.08] bg-[#141b27] p-5 shadow-xl shadow-black/30">
      <p className="text-xs font-bold text-zinc-500">{label}</p>
      <p className="mt-3 text-2xl font-black text-[#fbfbdc]">{value}</p>
      {helper ? <p className="mt-3 text-xs font-semibold text-[#8290a5]">{helper}</p> : null}
    </article>
  );
}
