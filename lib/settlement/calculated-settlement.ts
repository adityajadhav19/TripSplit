import type {
  MemberBalance,
  SettlementExpense,
  SettlementMember,
  Transfer,
} from "./types";

const MAX_SAFE = Number.MAX_SAFE_INTEGER;

function addSafe(a: number, b: number, label: string): number {
  const result = a + b;

  if (!Number.isSafeInteger(result)) {
    throw new Error(`${label} exceeds the supported calculation range.`);
  }

  return result;
}

function assertPaise(value: number, label: string, allowZero = true) {
  if (
    !Number.isSafeInteger(value) ||
    value < 0 ||
    (!allowZero && value === 0)
  ) {
    throw new Error(`${label} is invalid.`);
  }
}

export function calculateSettlement(
  inputMembers: SettlementMember[],
  expenses: SettlementExpense[]
): {
  totalSpent: number;
  members: MemberBalance[];
  transfers: Transfer[];
} {
  const balances = new Map<string, MemberBalance>();

  for (const member of inputMembers) {
    if (balances.has(member.id)) {
      throw new Error("Duplicate group member.");
    }

    balances.set(member.id, {
      ...member,
      paid: 0,
      share: 0,
      balance: 0,
    });
  }

  let totalSpent = 0;

  for (const expense of expenses) {
    assertPaise(expense.amount, "Expense amount", false);

    if (!balances.has(expense.payerId)) {
      throw new Error("An expense references an invalid payer.");
    }

    const payer = balances.get(expense.payerId)!;
    payer.paid = addSafe(payer.paid, expense.amount, "Total paid");

    totalSpent = addSafe(totalSpent, expense.amount, "Total spending");

    let shareTotal = 0;
    const seenMembers = new Set<string>();

    for (const share of expense.shares) {
      assertPaise(share.amount, "Expense share");

      if (!balances.has(share.memberId)) {
        throw new Error("An expense references an invalid participant.");
      }

      if (seenMembers.has(share.memberId)) {
        throw new Error("An expense contains duplicate participant shares.");
      }

      seenMembers.add(share.memberId);

      const member = balances.get(share.memberId)!;
      member.share = addSafe(member.share, share.amount, "Total member share");
      shareTotal = addSafe(shareTotal, share.amount, "Expense share total");
    }

    if (shareTotal !== expense.amount) {
      throw new Error("An expense's shares do not equal its total.");
    }
  }

  const members = Array.from(balances.values()).map((member) => ({
    ...member,
    balance: member.paid - member.share,
  }));

  let balanceTotal = 0;

  for (const member of members) {
    if (!Number.isSafeInteger(member.balance)) {
      throw new Error("A member balance exceeds the supported range.");
    }

    balanceTotal = addSafe(
      balanceTotal,
      member.balance,
      "Combined member balances"
    );
  }

  if (balanceTotal !== 0) {
    throw new Error("Balances do not reconcile.");
  }

  const debtors = members
    .filter((member) => member.balance < 0)
    .map((member) => ({
      id: member.id,
      name: member.name,
      remaining: -member.balance,
    }))
    .sort((a, b) => b.remaining - a.remaining || a.id.localeCompare(b.id));

  const creditors = members
    .filter((member) => member.balance > 0)
    .map((member) => ({
      id: member.id,
      name: member.name,
      remaining: member.balance,
    }))
    .sort((a, b) => b.remaining - a.remaining || a.id.localeCompare(b.id));

  const transfers: Transfer[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = Math.min(debtor.remaining, creditor.remaining);

    if (!Number.isSafeInteger(amount) || amount <= 0) {
      throw new Error("Unable to generate a valid settlement transfer.");
    }

    transfers.push({
      fromId: debtor.id,
      from: debtor.name,
      toId: creditor.id,
      to: creditor.name,
      amount,
    });

    debtor.remaining -= amount;
    creditor.remaining -= amount;

    if (debtor.remaining === 0) debtorIndex++;
    if (creditor.remaining === 0) creditorIndex++;
  }

  if (
    debtorIndex !== debtors.length ||
    creditorIndex !== creditors.length
  ) {
    throw new Error("Settlement transfers do not clear all balances.");
  }

  return { totalSpent, members, transfers };
}