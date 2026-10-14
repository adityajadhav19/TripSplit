
import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  meta?: ReactNode;
  className?: string;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  action,
  meta,
  className = "",
}: Props) {
  return (
    <header className={`relative ${className}`}>
      {action && (
        <div className="absolute right-0 top-0">
          {action}
        </div>
      )}

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        <p
          className={`text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 sm:text-sm ${
            action ? "pr-36 sm:pr-40" : ""
          }`}
        >
          {eyebrow}
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          {title}
        </h1>

        {meta && <div className="mt-2">{meta}</div>}

        {description && (
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500 sm:text-base">
            {description}
          </p>
        )}
      </div>
    </header>
  );
}
