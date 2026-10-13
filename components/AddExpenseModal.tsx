"use client";

import { useState, useEffect, type FormEvent } from "react";

type Member = { id: string; name: string };

function money(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(paise / 100);
}

type AddExpenseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groupCode: string;
  members: Member[];
};

export default function AddExpenseModal({
  isOpen,
  onClose,
  onSuccess,
  groupCode,
  members,
}: AddExpenseModalProps) {
  // Form State
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [payerId, setPayerId] = useState("");
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  
  // Submission State
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setDescription("");
      setAmount("");
      setError("");
      // Default to the first member paying, and everyone participating
      setPayerId(members[0]?.id || "");
      setParticipantIds(members.map((m) => m.id));
    }
  }, [isOpen, members]);

  if (!isOpen) return null;

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
      setError("Select at least one participant to share the cost.");
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

      // Trigger the parent page to refresh its data, then close the modal
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save expense.");
    } finally {
      setSaving(false);
    }
  }

  const inputClasses =
    "w-full rounded-xl border-0 bg-slate-50 px-4 py-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm transition-all";

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose} // Close when clicking the backdrop
    >
      <div 
        className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 sm:p-10 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the card from closing the modal
      >
        {/* Close Button (X) */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500"></span>
          </span>
          New Expense
        </div>
        
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
          Add an expense
        </h2>
        
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

            <div className="max-h-48 overflow-y-auto space-y-1 rounded-2xl bg-slate-50 p-2 ring-1 ring-inset ring-slate-200/60">
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

          {/* Actions */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 rounded-xl bg-slate-100 px-4 py-4 text-base font-bold text-slate-700 transition-colors hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || members.length === 0}
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-4 text-base font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-600/30 disabled:opacity-70 disabled:hover:bg-emerald-600"
            >
              {saving ? "Saving..." : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}