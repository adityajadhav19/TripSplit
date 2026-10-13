
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
    const cookieStore = await cookies();
    const token = cookieStore.get("trip_session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Please join the group first." },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(token);

    if (
      !session ||
      session.groupCode !== groupCode.toUpperCase() ||
      typeof session.groupId !== "string" ||
      typeof session.memberId !== "string"
    ) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const group = await prisma.group.findUnique({
      where: { id: session.groupId },
      select: {
        id: true,
        name: true,
        groupCode: true,
        createdAt: true,
        members: {
          select: { id: true, name: true },
          orderBy: { createdAt: "asc" },
        },
        expenses: {
          select: {
            id: true,
            description: true,
            amount: true,
            expenseDate: true,
            payer: { select: { id: true, name: true } },
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

    if (
      !group ||
      !group.members.some((member) => member.id === session.memberId)
    ) {
      return NextResponse.json(
        { error: "Group not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ group });
  } catch (error) {
    console.error("Get group failed:", error);
    return NextResponse.json(
      { error: "Unable to load group." },
      { status: 500 }
    );
  }
}
