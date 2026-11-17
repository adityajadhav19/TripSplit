import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/session";
import { refreshSessionCookie } from "@/lib/session-cookie";

type RouteContext = {
  params: Promise<{ groupCode: string; expenseId: string }>;
};

async function authorizeExpense(groupCode: string, expenseId: string) {
  const token = (await cookies()).get("trip_session")?.value;
  if (!token) {
    return { error: NextResponse.json({ error: "Please join the trip." }, { status: 401 }) } as const;
  }

  const session = await verifySessionToken(token);
  const normalizedCode = groupCode.toUpperCase();

  if (!session || session.groupCode !== normalizedCode) {
    return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) } as const;
  }

  const group = await prisma.group.findFirst({
    where: {
      id: session.groupId,
      groupCode: normalizedCode,
      members: { some: { id: session.memberId } },
    },
    select: {
      id: true,
      members: {
        where: { id: session.memberId },
        select: { id: true, isGroupCreator: true },
      },
    },
  });

  if (!group || group.members.length !== 1) {
    return { error: NextResponse.json({ error: "Group not found." }, { status: 404 }) } as const;
  }

  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, groupId: group.id },
    select: { id: true, createdById: true },
  });

  if (!expense) {
    return { error: NextResponse.json({ error: "Expense not found." }, { status: 404 }) } as const;
  }

  const isGroupCreator = group.members[0].isGroupCreator;
  const isExpenseCreator = expense.createdById === session.memberId;

  if (!isGroupCreator && !isExpenseCreator) {
    return { error: NextResponse.json({ error: "You can only manage expenses you created." }, { status: 403 }) } as const;
  }

  return { session, groupId: group.id, expense } as const;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { groupCode, expenseId } = await params;
    const auth = await authorizeExpense(groupCode, expenseId);
    if ("error" in auth) return auth.error;

    let body: Record<string, unknown>;
    try {
      const parsed: unknown = await request.json();
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
      }
      body = parsed as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }

    const description = typeof body.description === "string" ? body.description.trim() : "";
    const amountPaise = body.amountPaise;
    const payerId = body.payerId;
    const participantIds = body.participantIds;
    const expenseDate = body.expenseDate === undefined ? undefined : new Date(String(body.expenseDate));

    if (
      !description ||
      description.length > 100 ||
      typeof amountPaise !== "number" ||
      !Number.isSafeInteger(amountPaise) ||
      amountPaise <= 0 ||
      amountPaise > 100_000_000 ||
      typeof payerId !== "string" ||
      !Array.isArray(participantIds) ||
      participantIds.length === 0 ||
      participantIds.length > 100 ||
      !participantIds.every((id: unknown) => typeof id === "string" && id.length > 0) ||
      new Set(participantIds).size !== participantIds.length ||
      (expenseDate !== undefined && Number.isNaN(expenseDate.getTime()))
    ) {
      return NextResponse.json({ error: "Invalid expense details or participants." }, { status: 400 });
    }

    const members = await prisma.member.findMany({
      where: { groupId: auth.groupId },
      select: { id: true },
    });
    const memberIds = new Set(members.map((member) => member.id));

    if (!memberIds.has(payerId) || !participantIds.every((id: string) => memberIds.has(id))) {
      return NextResponse.json({ error: "Payer and participants must belong to this group." }, { status: 400 });
    }

    const baseShare = Math.floor(amountPaise / participantIds.length);
    const remainder = amountPaise % participantIds.length;
    const shares = participantIds.map((memberId: string, index: number) => ({
      memberId,
      amount: baseShare + (index < remainder ? 1 : 0),
    }));

    const expense = await prisma.$transaction(async (tx) => {
      await tx.expenseShare.deleteMany({ where: { expenseId } });
      return tx.expense.update({
        where: { id: expenseId },
        data: {
          description,
          amount: amountPaise,
          payerId,
          ...(expenseDate ? { expenseDate } : {}),
          editedAt: new Date(),
          shares: { create: shares },
        },
        select: {
          id: true,
          description: true,
          amount: true,
          expenseDate: true,
          editedAt: true,
          createdById: true,
          payer: { select: { id: true, name: true } },
          shares: { select: { memberId: true, amount: true } },
        },
      });
    });

    const response = NextResponse.json({ expense });
    return refreshSessionCookie(response, auth.session);
  } catch (error) {
    console.error("Update expense failed:", error);
    return NextResponse.json({ error: "Unable to update expense." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { groupCode, expenseId } = await params;
    const auth = await authorizeExpense(groupCode, expenseId);
    if ("error" in auth) return auth.error;

    await prisma.expense.delete({
      where: { id: expenseId },
    });

    const response = NextResponse.json({ message: "Expense deleted successfully." });
    return refreshSessionCookie(response, auth.session);
  } catch (error) {
    console.error("Delete expense failed:", error);
    return NextResponse.json({ error: "Unable to delete expense." }, { status: 500 });
  }
}
