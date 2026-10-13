
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/session";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ groupCode: string }> }
) {
  try {
    const { groupCode } = await params;
    const token = (await cookies()).get("trip_session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Please join the trip." }, { status: 401 });
    }

    const session = await verifySessionToken(token);

    if (
      !session ||
      typeof session.groupId !== "string" ||
      typeof session.memberId !== "string" ||
      session.groupCode !== groupCode.toUpperCase()
    ) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const group = await prisma.group.findUnique({
      where: { id: session.groupId },
      select: {
        id: true,
        name: true,
        groupCode: true,
        members: {
          select: { id: true, name: true },
        },
        expenses: {
          select: {
            amount: true,
            payerId: true,
            shares: {
              select: { memberId: true, amount: true },
            },
          },
        },
      },
    });

    if (
      !group ||
      group.groupCode !== groupCode.toUpperCase() ||
      !group.members.some((m) => m.id === session.memberId)
    ) {
      return NextResponse.json({ error: "Group not found." }, { status: 404 });
    }

    const balances = new Map(
      group.members.map((member) => [
        member.id,
        { ...member, paid: 0, share: 0, balance: 0 },
      ])
    );

    for (const expense of group.expenses) {
      const payer = balances.get(expense.payerId);
      if (!payer) {
        return NextResponse.json(
          { error: "Expense references an invalid payer." },
          { status: 500 }
        );
      }

      payer.paid += expense.amount;

      let shareTotal = 0;
      for (const share of expense.shares) {
        const member = balances.get(share.memberId);
        if (!member || !Number.isSafeInteger(share.amount) || share.amount < 0) {
          return NextResponse.json(
            { error: "Expense contains an invalid share." },
            { status: 500 }
          );
        }

        member.share += share.amount;
        shareTotal += share.amount;
      }

      if (shareTotal !== expense.amount) {
        return NextResponse.json(
          { error: "An expense's shares do not equal its total." },
          { status: 500 }
        );
      }
    }

    const members = Array.from(balances.values()).map((member) => ({
      ...member,
      balance: member.paid - member.share,
    }));

    const balanceTotal = members.reduce((sum, member) => sum + member.balance, 0);

    if (balanceTotal !== 0) {
      return NextResponse.json(
        { error: "Balances do not reconcile. Check the recorded expenses." },
        { status: 500 }
      );
    }

    const debtors = members
      .filter((m) => m.balance < 0)
      .map((m) => ({ id: m.id, name: m.name, remaining: -m.balance }))
      .sort((a, b) => b.remaining - a.remaining);

    const creditors = members
      .filter((m) => m.balance > 0)
      .map((m) => ({ id: m.id, name: m.name, remaining: m.balance }))
      .sort((a, b) => b.remaining - a.remaining);

    const transfers: {
      fromId: string;
      from: string;
      toId: string;
      to: string;
      amount: number;
    }[] = [];

    let debtorIndex = 0;
    let creditorIndex = 0;

    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex];
      const creditor = creditors[creditorIndex];
      const amount = Math.min(debtor.remaining, creditor.remaining);

      if (amount > 0) {
        transfers.push({
          fromId: debtor.id,
          from: debtor.name,
          toId: creditor.id,
          to: creditor.name,
          amount,
        });
      }

      debtor.remaining -= amount;
      creditor.remaining -= amount;

      if (debtor.remaining === 0) debtorIndex++;
      if (creditor.remaining === 0) creditorIndex++;
    }

    return NextResponse.json({
      group: { name: group.name, groupCode: group.groupCode },
      totalSpent: group.expenses.reduce((sum, e) => sum + e.amount, 0),
      members,
      transfers,
    });
  } catch (error) {
    console.error("Settlement calculation failed:", error);
    return NextResponse.json(
      { error: "Unable to calculate settlement." },
      { status: 500 }
    );
  }
}
