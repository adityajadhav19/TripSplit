
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/session";

export async function POST(
  request: NextRequest,
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
      typeof session.groupCode !== "string" ||
      session.groupCode !== groupCode.toUpperCase()
    ) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const amountPaise = body.amountPaise;
    const payerId = body.payerId;
    const participantIds = body.participantIds;

    if (
      !description ||
      description.length > 100 ||
      !Number.isSafeInteger(amountPaise) ||
      amountPaise <= 0 ||
      amountPaise > 100_000_000 ||
      typeof payerId !== "string" ||
      !Array.isArray(participantIds) ||
      participantIds.length === 0 ||
      participantIds.length > 100 ||
      !participantIds.every((id: unknown) => typeof id === "string") ||
      new Set(participantIds).size !== participantIds.length
    ) {
      return NextResponse.json(
        { error: "Invalid expense details or participants." },
        { status: 400 }
      );
    }

    const group = await prisma.group.findUnique({
      where: { id: session.groupId },
      select: {
        id: true,
        groupCode: true,
        members: { select: { id: true } },
      },
    });

    if (
      !group ||
      group.groupCode !== groupCode.toUpperCase() ||
      !group.members.some((m) => m.id === session.memberId)
    ) {
      return NextResponse.json({ error: "Group not found." }, { status: 404 });
    }

    const memberIds = new Set(group.members.map((m) => m.id));

    if (
      !memberIds.has(payerId) ||
      !participantIds.every((id: string) => memberIds.has(id))
    ) {
      return NextResponse.json(
        { error: "Payer and participants must belong to this group." },
        { status: 400 }
      );
    }

    // Divide into integer paise; distribute remainder one paisa at a time.
    const baseShare = Math.floor(amountPaise / participantIds.length);
    const remainder = amountPaise % participantIds.length;

    const shares = participantIds.map((memberId: string, index: number) => ({
      memberId,
      amount: baseShare + (index < remainder ? 1 : 0),
    }));

    const expense = await prisma.expense.create({
      data: {
        description,
        amount: amountPaise,
        groupId: group.id,
        payerId,
        shares: { create: shares },
      },
      select: {
        id: true,
        description: true,
        amount: true,
        payer: { select: { id: true, name: true } },
        shares: {
          select: { memberId: true, amount: true },
        },
      },
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    console.error("Create expense failed:", error);
    return NextResponse.json(
      { error: "Unable to create expense." },
      { status: 500 }
    );
  }
}
