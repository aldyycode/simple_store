export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  accent = "ink",
}) {
  const accents = {
    ink: "bg-ink/5 text-ink dark:bg-white/10 dark:text-white",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
    sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
  };

  return (
    <div
      className="rounded-2xl border border-line bg-white p-5 transition
      hover:border-ink/20 hover:shadow-sm
      dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-muted dark:text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-ink tracking-tight dark:text-white">
            {value}
          </p>
        </div>

        {Icon && (
          <div
            className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${accents[accent]}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
