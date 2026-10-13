
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type MemberBalance = {
  id: string;
  name: string;
  paid: number;
  share: number;
  balance: number;
};

type Transfer = {
  fromId: string;
  from: string;
  toId: string;
  to: string;
  amount: number;
};

type SettlementData = {
  group: { name: string; groupCode: string };
  totalSpent: number;
  members: MemberBalance[];
  transfers: Transfer[];
};

function money(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(paise / 100);
}

export default function SettlementPage() {
  const { groupCode } = useParams<{ groupCode: string }>();
  const router = useRouter();

  const [data, setData] = useState<SettlementData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadSettlement() {
      try {
        const response = await fetch(
          `/api/groups/${encodeURIComponent(groupCode)}/settlement`,
          { cache: "no-store" }
        );

        const result = await response.json();

        if (response.status === 401) {
          router.replace("/");
          return;
        }

        if (!response.ok) {
          throw new Error(result.error || "Unable to calculate settlement.");
        }

        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to calculate settlement."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSettlement();

    return () => {
      cancelled = true;
    };
  }, [groupCode, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f4]">
        <p className="text-zinc-500">Calculating balances...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f7f7f4] px-6">
        <p role="alert" className="text-center text-red-600">
          {error || "Settlement unavailable."}
        </p>
        <button
          onClick={() => router.push(`/trip/${groupCode}`)}
          className="rounded-xl bg-zinc-900 px-5 py-3 text-white"
        >
          Back to trip
        </button>
      </main>
    );
  }

  const settled = data.transfers.length === 0;

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-5 py-10 text-zinc-900">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => router.push(`/trip/${groupCode}`)}
          className="mb-6 text-sm text-zinc-600 hover:text-zinc-900"
        >
          ← Back to trip
        </button>

        <div>
          <p className="text-sm font-medium text-emerald-700">
            {data.group.name.toUpperCase()}
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            Settle up
          </h1>
          <p className="mt-3 text-zinc-500">
            Here's how to balance the expenses for everyone.
          </p>
        </div>

        <div className="mt-8 rounded-3xl bg-emerald-800 p-6 text-white sm:p-8">
          <p className="text-sm text-emerald-100">Total trip spending</p>
          <p className="mt-2 text-4xl font-semibold">
            {money(data.totalSpent)}
          </p>
          <p className="mt-3 text-sm text-emerald-100">
            {data.members.length} members · {data.transfers.length} suggested{" "}
            {data.transfers.length === 1 ? "payment" : "payments"}
          </p>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">Who pays whom?</h2>

          {settled ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-white p-7">
              <p className="text-lg font-semibold text-emerald-800">
                Everyone is settled.
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                There are no outstanding balances.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {data.transfers.map((transfer, index) => (
                <div
                  key={`${transfer.fromId}-${transfer.toId}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5"
                >
                  <div className="min-w-0">
                    <p className="font-semibold">{transfer.from}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      Pays {transfer.to}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-lg font-semibold">
                      {money(transfer.amount)}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Suggested transfer
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Individual balances</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            {data.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4 last:border-b-0"
              >
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Paid {money(member.paid)} · Share {money(member.share)}
                  </p>
                </div>

                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      member.balance > 0
                        ? "text-emerald-700"
                        : member.balance < 0
                          ? "text-red-600"
                          : "text-zinc-500"
                    }`}
                  >
                    {member.balance > 0 ? "+" : ""}
                    {money(member.balance)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {member.balance > 0
                      ? "Gets back"
                      : member.balance < 0
                        ? "Owes"
                        : "Settled"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-6 text-sm leading-6 text-zinc-500">
          These are suggested repayments, not actual transfers. Confirm with
          your group before paying.
        </p>
      </div>
    </main>
  );
}
