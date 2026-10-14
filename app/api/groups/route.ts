
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/session";

function normalizeName(name: string) {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFKC");
}

export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown>;

    try {
      const parsed: unknown = await request.json();

      if (
        parsed === null ||
        typeof parsed !== "object" ||
        Array.isArray(parsed)
      ) {
        return NextResponse.json(
          { error: "Request body must be a JSON object." },
          { status: 400 }
        );
      }

      body = parsed as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const creatorName =
      typeof body.creatorName === "string"
        ? normalizeName(body.creatorName)
        : "";

    const normalizedName = creatorName.toLowerCase();

    const password =
      typeof body.password === "string" ? body.password : "";

    if (
      !name ||
      name.length > 80 ||
      !creatorName ||
      creatorName.length > 50 ||
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return NextResponse.json(
        {
          error:
            "Provide a group name, creator name, and password of 8–72 UTF-8 bytes.",
        },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const groupCode = randomBytes(5).toString("hex").toUpperCase();

    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        groupCode,
        passwordHash,
        members: {
          create: {
            name: creatorName,
            normalizedName,
          },
        },
      },
      select: {
        id: true,
        name: true,
        groupCode: true,
        createdAt: true,
        members: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const creator = group.members[0];

    if (!creator) {
      throw new Error("Group creator membership was not created.");
    }

    const token = await createSessionToken(
      creator.id,
      group.id,
      group.groupCode
    );

    const response = NextResponse.json(
      {
        message: "Group created successfully",
        group,
      },
      { status: 201 }
    );

    response.cookies.set("trip_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Create group failed:", error);

    return NextResponse.json(
      { error: "Unable to create group" },
      { status: 500 }
    );
  }
}
