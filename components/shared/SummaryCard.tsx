
import type { ReactNode } from "react";

export type SummaryMetric = {
  label: string;
  value: string | number;
  detail?: string;
};

type Props = {
  title: string;
  value: string;
  description?: string;
  icon: ReactNode;
  metrics: SummaryMetric[];
  className?: string;
};

export default function SummaryCard({
  title,
  value,
  description,
  icon,
  metrics,
  className = "",
}: Props) {
  return (
    <section
      className={`group relative mt-7 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-800 to-emerald-950 p-6 text-white shadow-lg shadow-emerald-950/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-950/20 sm:mt-9 sm:p-8 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-emerald-400/10 blur-2xl transition-transform duration-500 group-hover:scale-125"
      />

      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10 transition-colors duration-300 group-hover:bg-white/15">
            {icon}
          </div>

          <p className="text-sm font-medium text-emerald-100">
            {title}
          </p>
        </div>

        <p className="mt-5 break-words text-3xl font-bold tracking-tight sm:text-4xl">
          {value}
        </p>

        {description && (
          <p className="mt-2 text-sm text-emerald-100/80">
            {description}
          </p>
        )}

        <div className="my-6 border-t border-white/15" />

        <div
          className={`grid gap-4 sm:gap-8 ${
            metrics.length === 1 ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="min-w-0 rounded-2xl bg-white/[0.06] p-3 transition-colors duration-200 hover:bg-white/10 sm:p-4"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-100/75">
                {metric.label}
              </p>

              <p className="mt-2 break-words text-xl font-bold sm:text-2xl">
                {metric.value}
                {metric.detail && (
                  <span className="ml-1.5 text-sm font-medium text-emerald-100/80">
                    {metric.detail}
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
