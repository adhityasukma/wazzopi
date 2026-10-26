import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession, type SessionPayload } from "./jwt";

export async function getSession() {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

export async function createSession(payload: SessionPayload) {
  const token = await signSession(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Admin & Karyawan */
export async function requireStaff() {
  const s = await getSession();
  if (!s || (s.role !== "ADMIN" && s.role !== "KARYAWAN")) redirect("/admin/login");
  return s;
}

/** Hanya Administrator */
export async function requireAdmin() {
  const s = await getSession();
  if (!s || (s.role !== "ADMIN" && s.role !== "KARYAWAN")) redirect("/admin/login");
  if (s.role !== "ADMIN") redirect("/admin/forbidden");
  return s;
}

export async function requireCustomer() {
  const s = await getSession();
  if (!s) redirect("/login");
  return s;
}
