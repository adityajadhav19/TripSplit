"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import SettlementHeader from "@/components/settlement/SettlementHeader";
import SettlementSummary from "@/components/settlement/SettlementSummary";
import TransferList from "@/components/settlement/TransferList";
import MemberBalances from "@/components/settlement/MemberBalances";
import SettlementLoading from "@/components/settlement/SettlementLoading";

import type { SettlementData } from "@/lib/settlement/types";

function SettlementPageContent() {
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
          throw new Error(
            result.error || "Unable to calculate settlement."
          );
        }

        if (!cancelled) {
          setData(result);
          setError("");
        }
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

    if (groupCode) {
      loadSettlement();
    } else {
      setError("Invalid trip code.");
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [groupCode, router]);

  if (loading) return <SettlementLoading />;

  if (error || !data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f7f7f4] px-6">
        <p role="alert" className="text-center text-red-600">
          {error || "Settlement unavailable."}
        </p>
        <button
          type="button"
          onClick={() =>
            router.push(`/trip/${encodeURIComponent(groupCode)}`)
          }
          className="rounded-xl bg-zinc-900 px-5 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-lg active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          Back to trip
        </button>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f7f4] px-4 py-6 text-zinc-900 sm:px-6 sm:py-10">
      {/* Subtle background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-100/40 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-100/40 blur-3xl"
      />

      <div className="relative mx-auto max-w-3xl">
        <SettlementHeader
          groupName={data.group.name}
          groupCode={groupCode}
        />

        <SettlementSummary
          totalSpent={data.totalSpent}
          memberCount={data.members.length}
          transferCount={data.transfers.length}
        />

        <TransferList transfers={data.transfers} />

        <MemberBalances members={data.members} />

        <p className="mt-8 flex items-start gap-2 border-t border-zinc-200/80 pt-5 pb-4 text-xs leading-6 text-zinc-500 sm:text-sm">
          <span className="mt-0.5 shrink-0">ⓘ</span>
          <span>
            These are suggested repayments, not actual transfers. Confirm
            with your group before paying.
          </span>
        </p>
      </div>
    </main>
  );
}

export default function SettlementPage() {
  return (
    <Suspense fallback={<SettlementLoading />}>
      <SettlementPageContent />
    </Suspense>
  );
}