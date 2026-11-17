"use client";

import { useState } from "react";

export type Expense = {
  id: string;
  description: string;
  amount: number;
  expenseDate: string;
  createdById?: string | null;
  editedAt?: string | null;
  payer: { id: string; name: string };
  shares: { memberId: string; amount: number }[];
};

export type Member = {
  id: string;
  name: string;
  isGroupCreator?: boolean;
};

type RecentExpensesProps = {
  expenses?: Expense[];
  members?: Member[];
  groupCode: string;
  currentMemberId: string;
  onChanged: () => void;
};

function money(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(paise / 100);
}

function formatDate(dateString?: string) {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function RecentExpenses({
  expenses = [],
  members = [],
  groupCode,
  currentMemberId,
  onChanged,
}: RecentExpensesProps) {
  const [editing, setEditing] = useState<Expense | null>(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [payerId, setPayerId] = useState("");
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [expenseDate, setExpenseDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  const groupCreatorId = members.find((member) => member.isGroupCreator)?.id;

  function canManage(expense: Expense) {
    return currentMemberId === groupCreatorId ||
      (!!expense.createdById && expense.createdById === currentMemberId);
  }

  function startEditing(expense: Expense) {
    setEditing(expense);
    setDescription(expense.description);
    setAmount((expense.amount / 100).toFixed(2));
    setPayerId(expense.payer.id);
    setParticipantIds(expense.shares.map((share) => share.memberId));
    const date = new Date(expense.expenseDate);
    setExpenseDate(
      new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10)
    );
    setError("");
  }

  function closeEditor() {
    if (saving) return;
    setEditing(null);
    setError("");
  }

  function toggleParticipant(id: string) {
    setParticipantIds((current) =>
      current.includes(id)
        ? current.filter((memberId) => memberId !== id)
        : [...current, id]
    );
  }

  async function saveExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    if (!/^\d+(\.\d{1,2})?$/.test(amount) || Number(amount) <= 0) {
      setError("Enter a valid amount with up to two decimal places.");
      return;
    }
    if (!description.trim() || participantIds.length === 0 || !payerId) {
      setError("Complete all fields and select at least one participant.");
      return;
    }

    const amountPaise = Math.round(Number(amount) * 100);
    if (!Number.isSafeInteger(amountPaise) || amountPaise <= 0 || amountPaise > 100_000_000) {
      setError("Enter a valid amount.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        `/api/groups/${encodeURIComponent(groupCode)}/expenses/${encodeURIComponent(editing.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: description.trim(),
            amountPaise,
            payerId,
            participantIds,
            expenseDate: new Date(`${expenseDate}T12:00:00`).toISOString(),
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update expense.");
      setEditing(null);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update expense.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteExpense(expense: Expense) {
    if (!window.confirm(`Delete "${expense.description}" permanently? This cannot be undone.`)) return;

    setDeletingId(expense.id);
    try {
      const response = await fetch(
        `/api/groups/${encodeURIComponent(groupCode)}/expenses/${encodeURIComponent(expense.id)}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to delete expense.");
      onChanged();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Unable to delete expense.");
    } finally {
      setDeletingId("");
    }
  }

  if (!Array.isArray(expenses) || expenses.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
        <h3 className="text-sm font-bold text-slate-700">No expenses yet</h3>
        <p className="mt-1 text-sm font-medium text-slate-500">
          When someone pays for something, add it here to keep track.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-6 divide-y divide-slate-100/80 rounded-2xl border border-slate-100 bg-slate-50/50">
        {expenses.map((expense) => {
          const payerName = expense.payer?.name || "Unknown";
          const manageable = canManage(expense);
          return (
            <div key={expense.id} className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-slate-50 sm:p-5">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white font-bold text-emerald-700 shadow-sm ring-1 ring-slate-200/60">
                  {payerName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="break-words font-semibold text-slate-900">{expense.description}</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    Paid by <span className="font-semibold text-slate-700">{payerName}</span> · {formatDate(expense.expenseDate)}
                    {expense.editedAt ? " · Edited" : ""}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {expense.shares?.length ?? 0} {(expense.shares?.length ?? 0) === 1 ? "person" : "people"}
                  </p>
                </div>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <p className="whitespace-nowrap font-bold text-slate-900">{money(expense.amount)}</p>
                {manageable && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEditing(expense)}
                      className="rounded-lg px-2.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                      aria-label={`Edit ${expense.description}`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteExpense(expense)}
                      disabled={deletingId === expense.id}
                      className="rounded-lg px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      aria-label={`Delete ${expense.description}`}
                    >
                      {deletingId === expense.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center overflow-y-auto bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeEditor();
        }}>
          <div role="dialog" aria-modal="true" aria-labelledby="edit-expense-title" className="w-full max-w-xl rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="edit-expense-title" className="text-xl font-bold text-slate-900">Edit expense</h2>
                <p className="mt-1 text-sm text-slate-500">Changes will update the group settlement.</p>
              </div>
              <button type="button" onClick={closeEditor} disabled={saving} className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">×</button>
            </div>

            {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <form onSubmit={saveExpense} className="mt-5 max-h-[70dvh] space-y-4 overflow-y-auto">
              <label className="block text-sm font-semibold text-slate-700">
                Description
                <input required maxLength={100} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Amount (₹)
                <input required type="number" min="0.01" max="1000000" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Expense date
                <input required type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Who paid?
                <select required value={payerId} onChange={(e) => setPayerId(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal">
                  {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                </select>
              </label>
              <fieldset>
                <legend className="text-sm font-semibold text-slate-700">Who shares this cost?</legend>
                <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-xl bg-slate-50 p-2">
                  {members.map((member) => (
                    <label key={member.id} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-700">
                      <input type="checkbox" checked={participantIds.includes(member.id)} onChange={() => toggleParticipant(member.id)} />
                      {member.name}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row">
                <button type="button" onClick={closeEditor} disabled={saving} className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 sm:w-1/3">Cancel</button>
                <button type="submit" disabled={saving || members.length === 0} className="w-full flex-1 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : "Save changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
