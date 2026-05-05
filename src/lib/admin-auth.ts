import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

export const ADMIN_COOKIE = "marks_admin_session";

type AdminSession = {
  email: string;
  name: string;
  exp: number;
};

export function createAdminSessionValue(session: Omit<AdminSession, "exp">) {
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 8;
  const payload = Buffer.from(JSON.stringify({ ...session, exp: expiresAt })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export async function isAdminAuthenticated() {
  return Boolean(await getAdminSession());
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!value) return null;

  const [payload, signature] = value.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminSession;
    if (!session.email || !session.name || session.exp < Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, storedPassword: string) {
  if (storedPassword.startsWith("scrypt:")) {
    const [, salt, hash] = storedPassword.split(":");
    if (!salt || !hash) return false;
    const actual = scryptSync(password, salt, 64).toString("hex");
    return safeEqual(actual, hash);
  }

  return safeEqual(password, storedPassword);
}

function sign(payload: string) {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) return "";
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  if (!a || !b || a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
