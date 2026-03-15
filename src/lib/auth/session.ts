import * as jose from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const secretKey =
  process.env.SESSION_SECRET || "default-secret-key-at-least-32-chars-long";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: jose.JWTPayload) {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decrypt(input: string): Promise<jose.JWTPayload> {
  const { payload } = await jose.jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function login(user: { id: string; email: string; role: string }) {
  // Verify user exists and get role (In a real app, verify password here)
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await encrypt({ user, expires });

  // Save the session in a cookie
  const cookieStore = await cookies();
  cookieStore.set("session", session, { expires, httpOnly: true });
}

export async function logout() {
  // Destroy the session
  const cookieStore = await cookies();
  cookieStore.set("session", "", { expires: new Date(0) });
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  try {
    return await decrypt(session);
  } catch (_e) {
    return null;
  }
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const res = NextResponse.next();
  res.cookies.set("session", await encrypt(parsed), {
    httpOnly: true,
    expires: expires,
  });
  return res;
}
