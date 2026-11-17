import { NextResponse } from "next/server";
import { createSessionToken, SESSION_MAX_AGE, type SessionPayload } from "@/lib/session";

export async function refreshSessionCookie(
  response: NextResponse,
  session: SessionPayload
): Promise<NextResponse> {
  const token = await createSessionToken(
    session.memberId,
    session.groupId,
    session.groupCode
  );

  response.cookies.set("trip_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return response;
}
