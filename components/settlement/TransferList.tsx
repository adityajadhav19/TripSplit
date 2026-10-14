
import type { Transfer } from "@/lib/settlement/types";
import { money } from "@/lib/settlement/format-money";
import SectionHeading from "@/components/shared/SectionHeading";

export default function TransferList({
  transfers,
}: {
  transfers: Transfer[];
}) {
  return (
    <section className="mt-9 sm:mt-11">
      <SectionHeading
        eyebrow="Next steps"
        title="Who pays whom?"
        action={
          transfers.length > 0 ? (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
              {transfers.length}{" "}
              {transfers.length === 1 ? "payment" : "payments"}
            </span>
          ) : undefined
        }
      />

      {transfers.length === 0 ? (
        <div className="group mt-4 rounded-2xl border border-emerald-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md sm:p-7">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 transition-colors duration-200 group-hover:bg-emerald-100">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-6"
                aria-hidden="true"
              >
                <path d="m5 12 4 4L19 6" />
              </svg>
            </div>

            <div>
              <p className="text-lg font-bold text-emerald-900">
                Everyone is settled
              </p>
              <p className="mt-1 text-sm leading-6 text-zinc-500">
                There are no outstanding balances to settle right now.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {transfers.map((transfer, index) => (
            <article
              key={`${transfer.fromId}-${transfer.toId}-${index}`}
              className="group rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-950/[0.04] sm:p-5"
            >
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 ring-1 ring-rose-100 transition-all duration-200 group-hover:bg-rose-100 group-hover:ring-rose-200 sm:size-12">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="size-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  >
                    <path d="M7 17 17 7M7 7h10v10" />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-bold text-zinc-900 sm:text-base">
                    {transfer.from}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-zinc-500">
                    <span>Pays</span>
                    <span className="break-words font-semibold text-zinc-700">
                      {transfer.to}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-base font-bold tracking-tight text-zinc-900 transition-colors group-hover:text-emerald-800 sm:text-xl">
                    {money(transfer.amount)}
                  </p>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-zinc-400 sm:text-xs">
                    To transfer
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
