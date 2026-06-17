type DataCardProps = {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function DataCard({ title, action, children, className = "" }: DataCardProps) {
  return (
    <article className={`rounded-2xl border border-white/[0.08] bg-[#111722] p-5 shadow-2xl shadow-black/40 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-black text-[#fbfbdc]">{title}</h2>
        {action}
      </div>
      {children}
    </article>
  );
}
