import type { MemberBalance } from "@/lib/settlement/types";
import { money } from "@/lib/settlement/format-money";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function MemberBalances({
  members,
}: {
  members: MemberBalance[];
}) {
  return (
    <section className="mt-10 sm:mt-12">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
          Breakdown
        </p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
          Individual balances
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          See what each member paid and their final position.
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
        {members.map((member, index) => {
          const positive = member.balance > 0;
          const negative = member.balance < 0;

          return (
            <div
              key={member.id}
              className="group flex min-w-0 items-center gap-3 border-b border-zinc-100 px-4 py-4 transition-colors duration-200 last:border-b-0 hover:bg-emerald-50/40 sm:gap-4 sm:px-5"
            >
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-1 transition-transform duration-200 group-hover:scale-105 sm:size-11 ${
                  positive
                    ? "bg-emerald-50 text-emerald-800 ring-emerald-100"
                    : negative
                      ? "bg-rose-50 text-rose-700 ring-rose-100"
                      : "bg-zinc-100 text-zinc-600 ring-zinc-200"
                }`}
              >
                {initials(member.name)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-semibold text-zinc-900 sm:text-base">
                  {member.name}
                </p>

                <p className="mt-1 break-words text-xs leading-5 text-zinc-500 sm:text-sm">
                  Paid {money(member.paid)}
                  <span className="mx-1 text-zinc-300">·</span>
                  Share {money(member.share)}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p
                  className={`text-sm font-bold tracking-tight sm:text-base ${
                    positive
                      ? "text-emerald-700"
                      : negative
                        ? "text-rose-600"
                        : "text-zinc-500"
                  }`}
                >
                  {positive ? "+" : ""}
                  {money(member.balance)}
                </p>

                <p
                  className={`mt-1 text-[11px] font-medium sm:text-xs ${
                    positive
                      ? "text-emerald-700/70"
                      : negative
                        ? "text-rose-600/70"
                        : "text-zinc-400"
                  }`}
                >
                  {positive ? "Gets back" : negative ? "Owes" : "Settled"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
