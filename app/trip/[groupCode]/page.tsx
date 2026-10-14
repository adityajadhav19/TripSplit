"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import AddExpenseModal from "@/components/AddExpenseModal";
import RecentExpenses, { type Expense } from "@/components/RecentExpenses";
import Link from "next/link";
import SummaryCard from "@/components/shared/SummaryCard";
import SectionHeading from "@/components/shared/SectionHeading";
import { money } from "@/lib/settlement/format-money";

type Member = {
  id: string;
  name: string;
};

type GroupData = {
  id: string;
  name: string;
  groupCode: string;
  members: Member[];
  expenses: Expense[];
};

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f4]">
      <div className="flex flex-col items-center gap-3">
        <div className="size-9 animate-spin rounded-full border-4 border-zinc-200 border-t-emerald-700" />
        <p className="text-sm font-medium text-zinc-500">
          Loading trip details...
        </p>
      </div>
    </main>
  );
}

function TripDashboardContent() {
  const params = useParams<{ groupCode: string }>();
  const groupCode = params?.groupCode || "";

  const [group, setGroup] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTripData = async () => {
    try {
      const response = await fetch(
        `/api/groups/${encodeURIComponent(groupCode)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load trip.");
      }

      setGroup(data.group);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupCode) {
      fetchTripData();
    }
  }, [groupCode]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !group) 
    {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f4] p-6">
        <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-lg shadow-zinc-200/40">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-50 text-xl text-red-600">
            !
          </div>

          <p className="mt-4 font-semibold text-zinc-900">
            {error || "Trip not found"}
          </p>

          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-600 transition-colors duration-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <span aria-hidden="true">←</span>
            Back to home
          </Link>
        </div>
      </main>
    );
  }
const totalSpent = group.expenses.reduce(
  (total, expense) => total + expense.amount,
  0
);
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f7f4] font-sans text-zinc-900 selection:bg-emerald-200">
      {/* Subtle background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-100/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-100/30 blur-3xl"
      />

      {/* Trip header */}
      <header className="relative border-b border-zinc-200/70 bg-white/70 px-4 py-6 backdrop-blur-sm sm:px-6 sm:py-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              Trip dashboard
            </p>

            <h1 className="mt-2 break-words text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              {group.name}
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Trip code:{" "}
              <span className="font-semibold tracking-wide text-zinc-700">
                {group.groupCode}
              </span>
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href={`/trip/${encodeURIComponent(groupCode)}/settlement`}
              className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 sm:w-auto"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
              >
                <path
                  d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              View settlement
            </Link>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-900/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-900 hover:shadow-lg active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 sm:w-auto"
            >
              <span className="text-lg leading-none transition-transform duration-200 group-hover:rotate-90">
                +
              </span>
              Add expense
            </button>
          </div>
        </div>
      </header>


      {/* Trip summary and recent activity */}
      <section className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <SummaryCard
          title="Total trip spending"
          value={money(totalSpent)}
          description="Combined spending recorded for this trip"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="size-5 text-emerald-100"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 10h18M7 15h3" />
            </svg>
          }
          metrics={[
            {
              label: "Expenses recorded",
              value: group.expenses.length,
              detail:
                group.expenses.length === 1 ? "expense" : "expenses",
            },
            {
              label: "Group members",
              value: group.members.length,
              detail:
                group.members.length === 1 ? "person" : "people",
            },
          ]}
          className="mt-0"
        />

        <div className="mt-8 rounded-3xl border border-zinc-200/80 bg-white/90 p-5 shadow-lg shadow-zinc-200/30 transition-shadow duration-300 hover:shadow-xl hover:shadow-zinc-200/40 sm:mt-10 sm:p-8">
          <div className="mb-6">
            <SectionHeading
              eyebrow="Your trip at a glance"
              title="Recent activity"
              description="Keep track of expenses shared with your group."
              action={
                <span className="inline-flex w-fit items-center rounded-full border border-zinc-200 bg-[#f7f7f4] px-3 py-1.5 text-xs font-medium text-zinc-600">
                  {group.members.length}{" "}
                  {group.members.length === 1 ? "member" : "members"}
                </span>
              }
            />
          </div>

          {group.expenses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-[#f7f7f4]/70 px-5 py-10 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="size-6"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 10h18M7 15h3" />
                </svg>
              </div>

              <h3 className="mt-4 font-semibold text-zinc-900">
                No expenses yet
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-zinc-500">
                Start tracking your trip spending by adding your first expense.
              </p>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-900 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              >
                <span aria-hidden="true">+</span>
                Add your first expense
              </button>
            </div>
          ) : (
            <RecentExpenses
              expenses={group.expenses}
              members={group.members}
            />
          )}
        </div>
      </section>


      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchTripData()}
        groupCode={groupCode}
        members={group.members}
      />
    </main>
  );
}

export default function TripDashboardPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <TripDashboardContent />
    </Suspense>
  );
}