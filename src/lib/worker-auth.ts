import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getWorkerById, getWorkerByPhone } from "./workers";
import { Worker } from "./worker-schema";

const WORKER_COOKIE = "worker_session";

export async function authenticateWorker(phone: string, pin: string): Promise<Worker | null> {
  const worker = await getWorkerByPhone(phone);
  if (!worker || worker.pin !== pin) {
    return null;
  }
  return worker;
}

export async function createWorkerSession(worker: Worker): Promise<void> {
  const cookieStore = await cookies();
  const sessionData = JSON.stringify({
    id: worker._id,
    name: worker.name,
    phone: worker.phone,
    role: worker.role,
  });

  cookieStore.set(WORKER_COOKIE, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getWorkerFromCookie(): Promise<Worker | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(WORKER_COOKIE);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    if (!session.id) {
      return null;
    }
    return await getWorkerById(session.id);
  } catch {
    return null;
  }
}

export async function destroyWorkerSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(WORKER_COOKIE);
}

export async function requireWorkerAuth(): Promise<Worker> {
  const worker = await getWorkerFromCookie();
  if (!worker) {
    redirect("/worker/login");
  }
  return worker;
}