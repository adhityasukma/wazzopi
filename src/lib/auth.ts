import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signSession,
  verifySession,
  type Role,
  type SessionPayload,
} from "./jwt";

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const decoded = await verifySession(token);
  if (!decoded) return null;

  // Verifikasi ke database: pastikan user dengan id atau email ini masih ada di database
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: decoded.id },
          { email: decoded.email.toLowerCase().trim() },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      // User telah dihapus dari database (misal: dihapus oleh admin).
      // Bersihkan cookie jika berada di konteks yang mengizinkan mutasi cookie (Server Action / Route Handler)
      try {
        store.delete(SESSION_COOKIE);
      } catch {
        // Pada saat render Server Component, cookies() bersifat read-only
      }
      return null;
    }

    // Kembalikan data terkini dari database
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as Role,
    };
  } catch (err) {
    console.error("[getSession Database Check Error]:", err);
    return null;
  }
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
  try {
    const store = await cookies();
    store.delete(SESSION_COOKIE);
  } catch {
    // Abaikan jika dipanggil di luar konteks mutasi cookie
  }
}

/** Admin & Karyawan */
export async function requireStaff() {
  const s = await getSession();
  if (!s || (s.role !== "ADMIN" && s.role !== "KARYAWAN")) {
    await destroySession();
    redirect("/admin/login");
  }
  return s;
}

/** Hanya Administrator */
export async function requireAdmin() {
  const s = await getSession();
  if (!s || (s.role !== "ADMIN" && s.role !== "KARYAWAN")) {
    await destroySession();
    redirect("/admin/login");
  }
  if (s.role !== "ADMIN") redirect("/admin/forbidden");
  return s;
}

export async function requireCustomer() {
  const s = await getSession();
  if (!s) {
    await destroySession();
    redirect("/login");
  }
  return s;
}
