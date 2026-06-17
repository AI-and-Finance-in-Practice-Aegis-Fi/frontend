function getProgressColor(value: number) {
  if (value >= 80) return "bg-red-400";
  if (value >= 60) return "bg-orange-400";
  if (value >= 40) return "bg-emerald-400";
  return "bg-blue-400";
}

type ProgressBarProps = {
  label: string;
  value: number;
};

export function ProgressBar({ label, value }: ProgressBarProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-xs font-semibold">
        <span className="text-zinc-400">{label}</span>
        <span className="text-[#fbfbdc]">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-700/70">
        <div
          className={`h-full rounded-full ${getProgressColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
