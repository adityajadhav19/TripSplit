
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/session";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const groupCode =
            typeof body.groupCode === "string"
                ? body.groupCode.trim().toUpperCase()
                : "";
        const name =
            typeof body.name === "string" ? body.name.trim() : "";
        const password =
            typeof body.password === "string" ? body.password : "";

        if (
            !/^[A-F0-9]{10}$/.test(groupCode) ||
            !name ||
            name.length > 50 ||
            !password ||
            Buffer.byteLength(password, "utf8") > 72
        ) {
            return NextResponse.json(
                { error: "Enter a valid group ID, name, and password." },
                { status: 400 }
            );
        }

        const group = await prisma.group.findUnique({
            where: { groupCode },
        });

        if (!group || !(await bcrypt.compare(password, group.passwordHash))) {
            return NextResponse.json(
                { error: "Invalid group ID or password." },
                { status: 401 }
            );
        }

        const normalizedName = name
            .trim()
            .replace(/\s+/g, " ")
            .normalize("NFKC")
            .toLowerCase();

        const member = await prisma.member.upsert({
            where: {
                groupId_normalizedName: {
                    groupId: group.id,
                    normalizedName,
                },
            },
            update: {},
            create: {
                groupId: group.id,
                name: name.trim().replace(/\s+/g, " ").normalize("NFKC"),
                normalizedName,
            },
        });

        const token = await createSessionToken(
            member.id,
            group.id,
            group.groupCode
        );

        const response = NextResponse.json({
            message: "Joined successfully",
            groupCode: group.groupCode,
        });

        response.cookies.set("trip_session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return response;
    } catch (error) {
        console.error("Join group failed:", error);
        return NextResponse.json(
            { error: "Unable to join group." },
            { status: 500 }
        );
    }
}
