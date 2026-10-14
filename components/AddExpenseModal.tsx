"use client";

import { useState, useEffect, type FormEvent } from "react";

type Member = {
  id: string;
  name: string;
};

type AddExpenseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groupCode: string;
  members: Member[];
};

function money(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(paise / 100);
}

export default function AddExpenseModal({
  isOpen,
  onClose,
  onSuccess,
  groupCode,
  members,
}: AddExpenseModalProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [payerId, setPayerId] = useState("");
  const [participantIds, setParticipantIds] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDescription("");
      setAmount("");
      setError("");
      setPayerId(members[0]?.id || "");
      setParticipantIds(members.map((member) => member.id));
    }
  }, [isOpen, members]);

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

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

    if (!description.trim()) {
      setError("Enter an expense description.");
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(amount) || Number(amount) <= 0) {
      setError("Enter a valid amount with up to two decimal places.");
      return;
    }

    if (participantIds.length === 0) {
      setError("Select at least one participant to share the cost.");
      return;
    }

    if (!payerId || !members.some((member) => member.id === payerId)) {
      setError("Select who paid for this expense.");
      return;
    }

    const amountPaise = Math.round(Number(amount) * 100);

    if (
      !Number.isSafeInteger(amountPaise) ||
      amountPaise <= 0 ||
      amountPaise > 100_000_000
    ) {
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
            description: description.trim(),
            amountPaise,
            payerId,
            participantIds,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save expense.");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save expense."
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClasses =
    "w-full min-w-0 rounded-xl border-0 bg-slate-50 px-4 py-3.5 text-base text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 transition-all focus:bg-white focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm";

  const allSelected =
    members.length > 0 && participantIds.length === members.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-900/40 p-0 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-expense-title"
        className="relative flex max-h-[95dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-slate-200 animate-in slide-in-from-bottom-4 duration-200 sm:max-h-[90dvh] sm:max-w-xl sm:rounded-3xl sm:animate-in sm:zoom-in-95"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 border-b border-slate-100 px-5 pb-5 pt-6 sm:px-8 sm:pb-6 sm:pt-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 sm:right-6 sm:top-6"
          >
            ×
          </button>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
            </span>
            New Expense
          </div>

          <h2
            id="add-expense-title"
            className="mt-3 pr-8 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl"
          >
            Add an expense
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Record a payment and split it with your group.
          </p>
        </div>

        {/* Scrollable Form */}
        <form
          onSubmit={submitExpense}
          className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 sm:space-y-6 sm:px-8 sm:py-6"
        >
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-600/20 sm:p-4"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
                !
              </span>
              <p className="min-w-0 break-words">{error}</p>
            </div>
          )}

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
              What was this for?
            </label>
            <input
              id="description"
              required
              maxLength={100}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="e.g. Dinner, Taxi, Hotel"
              className={inputClasses}
            />
          </div>

          {/* Amount */}
          <div>
            <label
              htmlFor="amount"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
              Total Amount
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <span className="text-lg font-medium text-slate-400">₹</span>
              </div>

              <input
                id="amount"
                type="number"
                inputMode="decimal"
                min="0.01"
                max="1000000"
                step="0.01"
                required
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
                className={`${inputClasses} pl-9 text-lg font-semibold`}
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
            <label
              htmlFor="payer"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
              Who paid?
            </label>

            <select
              id="payer"
              required
              value={payerId}
              onChange={(event) => setPayerId(event.target.value)}
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
          <div className="pt-1">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <label className="text-sm font-semibold text-slate-700">
                Who shares this cost?
              </label>

              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setParticipantIds(members.map((member) => member.id))
                  }
                  disabled={allSelected}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-40"
                >
                  Select All
                </button>

                <button
                  type="button"
                  onClick={() => setParticipantIds([])}
                  disabled={participantIds.length === 0}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="max-h-40 space-y-1 overflow-y-auto rounded-2xl bg-slate-50 p-2 ring-1 ring-inset ring-slate-200/60 sm:max-h-48">
              {members.length === 0 ? (
                <p className="p-3 text-sm text-slate-500">
                  No group members found.
                </p>
              ) : (
                members.map((member) => {
                  const isSelected = participantIds.includes(member.id);

                  return (
                    <label
                      key={member.id}
                      className={`flex min-w-0 cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors ${
                        isSelected
                          ? "bg-emerald-50 ring-1 ring-inset ring-emerald-200/50"
                          : "hover:bg-slate-100/70"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleParticipant(member.id)}
                        className="size-5 shrink-0 cursor-pointer accent-emerald-600"
                      />

                      <span
                        className={`min-w-0 break-words text-sm font-medium ${
                          isSelected ? "text-emerald-900" : "text-slate-700"
                        }`}
                      >
                        {member.name}
                      </span>

                      {isSelected && (
                        <span className="ml-auto shrink-0 text-xs font-semibold text-emerald-700">
                          Included
                        </span>
                      )}
                    </label>
                  );
                })
              )}
            </div>

            {participantIds.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-100 px-4 py-3">
                <span className="text-sm font-medium text-slate-600">
                  Split between {participantIds.length}{" "}
                  {participantIds.length === 1 ? "person" : "people"}
                </span>

                <span className="font-bold text-slate-900">
                  {money(
                    Math.floor(
                      Math.round(Number(amount || 0) * 100) /
                        participantIds.length
                    )
                  )}
                  <span className="ml-1 text-xs font-medium text-slate-500">
                    / person
                  </span>
                </span>
              </div>
            )}
          </div>
        </form>

        {/* Sticky Actions */}
        <div className="shrink-0 border-t border-slate-100 bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-8 sm:py-5">
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50 sm:w-1/3 sm:py-4 sm:text-base"
            >
              Cancel
            </button>

            <button
              type="submit"
              form=""
              disabled={saving || members.length === 0}
              onClick={() => {
                const form = document.querySelector<HTMLFormElement>(
                  '[role="dialog"] form'
                );
                form?.requestSubmit();
              }}
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-600/30 disabled:cursor-not-allowed disabled:opacity-70 sm:py-4 sm:text-base"
            >
              {saving ? "Saving..." : "Save Expense"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
