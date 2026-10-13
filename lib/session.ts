
import { SignJWT, jwtVerify } from "jose";

const secret = process.env.SESSION_SECRET;

if (!secret || secret.length < 32) {
  throw new Error("SESSION_SECRET must be at least 32 characters.");
}

const key = new TextEncoder().encode(secret);

export async function createSessionToken(
  memberId: string,
  groupId: string,
  groupCode: string
) {
  return new SignJWT({ memberId, groupId, groupCode })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch {
    return null;
  }
}
