import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

export const CUSTOMER_COOKIE = "marks_customer_session";

export type CustomerSession = {
  id: string;
  name: string;
  email: string;
  phone: string;
  exp: number;
};

export function createCustomerSessionValue(session: Omit<CustomerSession, "exp">) {
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
  const payload = Buffer.from(JSON.stringify({ ...session, exp: expiresAt })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export async function getCustomerSession() {
  const cookieStore = await cookies();
  const value = cookieStore.get(CUSTOMER_COOKIE)?.value;
  if (!value) return null;

  const [payload, signature] = value.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as CustomerSession;
    if (!session.id || !session.email || !session.phone || session.exp < Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

function sign(payload: string) {
  const secret = process.env.CUSTOMER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) return "";
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  if (!a || !b || a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
