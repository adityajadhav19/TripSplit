"use client";
import { Suspense } from "react";
import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
type Member = { id: string; name: string };

function money(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(paise / 100);
}

export default function NewExpensePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm font-medium text-slate-500">
            Loading expense form...
          </p>
        </main>
      }
    >
      <NewExpenseContent />
    </Suspense>
  );
}

function NewExpenseContent() {
  const { groupCode } = useParams<{ groupCode: string }>();
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [payerId, setPayerId] = useState("");
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadGroup() {
      try {
        const response = await fetch(
          `/api/groups/${encodeURIComponent(groupCode)}`,
          { cache: "no-store" }
        );
        const data = await response.json();

        if (response.status === 401) {
          router.replace("/");
          return;
        }
        if (!response.ok) throw new Error(data.error || "Unable to load trip.");

        if (!cancelled) {
          setMembers(data.group.members);
          setPayerId(data.group.members[0]?.id ?? "");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load trip.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadGroup();
    return () => {
      cancelled = true;
    };
  }, [groupCode, router]);

  function toggleParticipant(id: string) {
    setParticipantIds((current) =>
      current.includes(id)
        ? current.filter((memberId) => memberId !== id)
        : [...current, id]
    );
  }

  async function submitExpense(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!/^\d+(\.\d{1,2})?$/.test(amount) || Number(amount) <= 0) {
      setError("Enter a valid amount with up to two decimal places.");
      return;
    }

    if (participantIds.length === 0) {
      setError("Select at least one participant.");
      return;
    }

    const amountPaise = Math.round(Number(amount) * 100);

    if (!Number.isSafeInteger(amountPaise)) {
      setError("Enter a valid amount.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/groups/${encodeURIComponent(groupCode)}/expenses`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description,
            amountPaise,
            payerId,
            participantIds,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save expense.");

      router.push(`/trip/${groupCode}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save expense.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600"></div>
          <p className="text-sm font-medium text-slate-500">Loading trip details...</p>
        </div>
      </main>
    );
  }

  const inputClasses =
    "w-full rounded-xl border-0 bg-slate-50 px-4 py-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm transition-all";

  return (
    <main className="min-h-screen bg-slate-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-slate-50 to-slate-100 px-5 py-12 text-slate-900 font-sans selection:bg-emerald-200">
      <div className="mx-auto max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Back Button */}
        <button
          onClick={() => router.push(`/trip/${groupCode}`)}
          className="group mb-8 flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span> 
          Back to trip
        </button>

        {/* Form Card */}
        <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/60 ring-1 ring-slate-200 sm:p-10">
          
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500"></span>
            </span>
            New Expense
          </div>
          
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
            Add an expense
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Keep track of who paid and who shares the cost.
          </p>

          {error && (
            <div role="alert" className="mt-6 flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
              <span className="flex size-6 items-center justify-center rounded-full bg-red-100 text-red-600">!</span>
              {error}
            </div>
          )}

          <form onSubmit={submitExpense} className="mt-8 space-y-6">
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-semibold text-slate-700">
                What was this for?
              </label>
              <input
                id="description"
                required
                maxLength={100}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Dinner at the beach, Taxi"
                className={inputClasses}
              />
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Total Amount
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <span className="text-slate-400 font-medium text-lg">₹</span>
                </div>
                <input
                  id="amount"
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={`${inputClasses} pl-8 text-lg font-semibold`}
                />
              </div>
              {Number(amount) > 0 && Number.isFinite(Number(amount)) && (
                <p className="mt-2 text-sm font-medium text-emerald-600">
                  Total logged: {money(Math.round(Number(amount) * 100))}
                </p>
              )}
            </div>

            {/* Payer */}
            <div>
              <label htmlFor="payer" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Who paid?
              </label>
              <select
                id="payer"
                required
                value={payerId}
                onChange={(e) => setPayerId(e.target.value)}
                className={`${inputClasses} cursor-pointer`}
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Participants */}
            <div className="pt-2">
              <div className="mb-3 flex items-center justify-between gap-3">
                <label className="text-sm font-semibold text-slate-700">Who shares this cost?</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setParticipantIds(members.map((m) => m.id))}
                    className="rounded-lg px-2.5 py-1 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => setParticipantIds([])}
                    className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="space-y-1 rounded-2xl bg-slate-50 p-2 ring-1 ring-inset ring-slate-200/60">
                {members.map((member) => {
                  const isSelected = participantIds.includes(member.id);
                  return (
                    <label
                      key={member.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-all ${
                        isSelected 
                          ? "bg-emerald-50 ring-1 ring-inset ring-emerald-200/50" 
                          : "hover:bg-slate-100/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleParticipant(member.id)}
                        className="size-5 cursor-pointer accent-emerald-600 transition-all"
                      />
                      <span className={`text-sm font-medium ${isSelected ? "text-emerald-900" : "text-slate-700"}`}>
                        {member.name}
                      </span>
                    </label>
                  );
                })}
              </div>

              {participantIds.length > 0 && (
                <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3">
                  <span className="text-sm font-medium text-slate-600">
                    Split between {participantIds.length} {participantIds.length === 1 ? 'person' : 'people'}
                  </span>
                  <span className="font-bold text-slate-900">
                    {money(
                      Math.floor(
                        Math.round(Number(amount || 0) * 100) /
                          participantIds.length
                      )
                    )} <span className="text-xs font-medium text-slate-500">/ea</span>
                  </span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving || members.length === 0}
              className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-4 text-base font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-600/30 disabled:opacity-70 disabled:hover:bg-emerald-600"
            >
              {saving ? "Saving expense..." : "Save Expense"}
            </button>
            
          </form>
        </div>
      </div>
    </main>
  );
}