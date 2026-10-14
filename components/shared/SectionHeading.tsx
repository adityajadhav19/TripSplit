
import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className = "",
}: Props) {
  return (
    <div
      className={`flex flex-wrap items-end justify-between gap-3 ${className}`}
    >
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
