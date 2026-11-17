import { SignJWT, jwtVerify } from "jose";

const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 15;
const secret = process.env.SESSION_SECRET;

if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
  throw new Error("SESSION_SECRET must be at least 32 bytes.");
}

const key = new TextEncoder().encode(secret);

export type SessionPayload = {
  memberId: string;
  groupId: string;
  groupCode: string;
};

export const SESSION_MAX_AGE = SESSION_DURATION_SECONDS;

export async function createSessionToken(
  memberId: string,
  groupId: string,
  groupCode: string
): Promise<string> {
  return new SignJWT({ memberId, groupId, groupCode })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION_SECONDS)
    .sign(key);
}

export async function renewSessionToken(
  session: SessionPayload
): Promise<string> {
  return createSessionToken(session.memberId, session.groupId, session.groupCode);
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });

    const { memberId, groupId, groupCode } = payload;

    if (
      typeof memberId !== "string" ||
      !memberId ||
      typeof groupId !== "string" ||
      !groupId ||
      typeof groupCode !== "string" ||
      !/^[A-F0-9]{10}$/.test(groupCode)
    ) {
      return null;
    }

    return { memberId, groupId, groupCode };
  } catch {
    return null;
  }
}
