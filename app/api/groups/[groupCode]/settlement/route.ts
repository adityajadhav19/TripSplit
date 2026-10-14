import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/session";
import { calculateSettlement } from "@/lib/settlement/calculated-settlement";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ groupCode: string }> }
) {
  try {
    const { groupCode } = await params;
    const normalizedCode = groupCode.toUpperCase();

    const token = (await cookies()).get("trip_session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Please join the trip." },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(token);

    if (
      !session ||
      typeof session.groupId !== "string" ||
      typeof session.memberId !== "string" ||
      typeof session.groupCode !== "string" ||
      session.groupCode !== normalizedCode
    ) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const group = await prisma.group.findFirst({
      where: {
        id: session.groupId,
        groupCode: normalizedCode,
        members: {
          some: { id: session.memberId },
        },
      },
      select: {
        name: true,
        groupCode: true,
        members: {
          select: { id: true, name: true },
          orderBy: { createdAt: "asc" },
        },
        expenses: {
          select: {
            id: true,
            description: true,
            amount: true,
            payerId: true,
            shares: {
              select: {
                memberId: true,
                amount: true,
              },
            },
          },
          orderBy: { expenseDate: "desc" },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Group not found." },
        { status: 404 }
      );
    }

    const settlement = calculateSettlement(group.members, group.expenses);

    return NextResponse.json({
      group: {
        name: group.name,
        groupCode: group.groupCode,
      },
      ...settlement,
    });
  } catch (error) {
    console.error("Settlement calculation failed:", error);

    return NextResponse.json(
      { error: "Unable to calculate settlement. Please try again." },
      { status: 500 }
    );
  }
}