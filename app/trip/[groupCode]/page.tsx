"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import AddExpenseModal from "@/components/AddExpenseModal";
import RecentExpenses, { type Expense } from "@/components/RecentExpenses";

// 1. Define our types
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

// 2. Shared Loading State (so we don't repeat ourselves)
function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600"></div>
        <p className="text-sm font-medium text-slate-500">Loading trip details...</p>
      </div>
    </main>
  );
}

// 3. Move the main logic into an inner component
function TripDashboardContent() {
  const params = useParams<{ groupCode: string }>();
  const groupCode = params?.groupCode || "";

  const [group, setGroup] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTripData = async () => {
    try {
      const response = await fetch(`/api/groups/${encodeURIComponent(groupCode)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load trip.");
      }

      setGroup(data.group);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
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

  if (error || !group) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="rounded-2xl bg-red-50 p-6 text-center ring-1 ring-inset ring-red-600/20">
          <p className="font-semibold text-red-700">{error || "Trip not found"}</p>
          <a href="/" className="mt-4 inline-block text-sm font-medium text-red-600 hover:underline">
            &larr; Back to home
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200">
      <header className="border-b border-slate-200 bg-white px-6 py-8">
        <div className="mx-auto max-w-4xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Trip Dashboard</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">{group.name}</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              ID: <span className="font-bold text-slate-700">{group.groupCode}</span>
            </p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            + Add Expense
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Recent Activity</h2>
          
          <RecentExpenses 
            expenses={group.expenses || []} 
            members={group.members} 
          />
          
        </div>
      </div>

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

// 4. Default Export wraps the content in <Suspense>
export default function TripDashboardPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <TripDashboardContent />
    </Suspense>
  );
}