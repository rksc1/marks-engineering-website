import { createHash, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

export const ADMIN_COOKIE = "marks_admin_session";

export function getAdminSessionValue() {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;

  if (!password || !secret) {
    return null;
  }

  return createHash("sha256").update(`${password}:${secret}`).digest("hex");
}

export async function isAdminAuthenticated() {
  const expected = getAdminSessionValue();
  const cookieStore = await cookies();
  const actual = cookieStore.get(ADMIN_COOKIE)?.value;

  if (!expected || !actual || expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}
