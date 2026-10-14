"use client";

export type Expense = {
  id: string;
  description: string;
  amount: number;
  expenseDate: string;
  payer: {
    id: string;
    name: string;
  };
  shares: {
    memberId: string;
    amount: number;
  }[];
};

export type Member = {
  id: string;
  name: string;
};

type RecentExpensesProps = {
  expenses?: Expense[];      // Made optional
  members?: Member[];        // Made optional
};

// Utility to format INR safely
function money(paise: number) {
  if (!paise || isNaN(paise)) return "₹0.00";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(paise / 100);
}

// Utility to format dates safely
function formatDate(dateString?: string) {
  if (!dateString) return "Recently"; // Fallback if API doesn't send a date

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  } catch (e) {
    return "Recently"; // Fallback if the date string is invalid
  }
}

export default function RecentExpenses({
  expenses = [],
  members = []
}: RecentExpensesProps) {

  // Helper to find a member's name safely
  const getMemberName = (id: string) => {
    if (!members || !Array.isArray(members)) return "Unknown";
    return members.find((m) => m.id === id)?.name || "Unknown";
  };


  // Safe check for empty state
  if (!Array.isArray(expenses) || expenses.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-12 px-6 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-slate-100 text-2xl shadow-sm ring-1 ring-slate-200">
          🧾
        </div>
        <h3 className="text-sm font-bold text-slate-700">No expenses yet</h3>
        <p className="mt-1 text-sm font-medium text-slate-500">
          When someone pays for something, add it here to keep track.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 divide-y divide-slate-100/80 rounded-2xl border border-slate-100 bg-slate-50/50">
      {expenses.map((expense) => {
        // Safe fallbacks for every property
        const payerName = expense.payer?.name || "Unknown";
        const description = expense.description || "Untitled Expense";
        const participantsCount = expense.shares?.length ?? 0;
        return (
          <div
            key={expense.id}
            className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50 sm:p-5"
          >
            <div className="flex items-center gap-4">
              {/* Avatar Initial */}
              <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-white font-bold text-emerald-700 shadow-sm ring-1 ring-slate-200/60">
                {payerName.charAt(0).toUpperCase()}
              </div>

              {/* Expense Details */}
              <div>
                <p className="font-semibold text-slate-900">{description}</p>
                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  Paid by <span className="font-semibold text-slate-700">{payerName}</span> • {formatDate(expense.expenseDate)}
                </p>
              </div>
            </div>

            {/* Amount */}
            <div className="text-right">
              <p className="font-bold text-slate-900">
                {money(expense.amount)}
              </p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                {participantsCount} {participantsCount === 1 ? 'person' : 'people'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}