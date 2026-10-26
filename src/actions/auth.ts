"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/auth";
import type { Role } from "@/lib/jwt";

export type FormState = { error?: string; success?: string; fieldErrors?: Record<string, string> } | undefined;

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

async function authenticate(formData: FormData) {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0].message } as const;
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase().trim() } });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.password))) {
    return { error: "Email atau password salah" } as const;
  }
  return { user } as const;
}

export async function adminLogin(_: FormState, formData: FormData): Promise<FormState> {
  const res = await authenticate(formData);
  if ("error" in res) return { error: res.error };
  const { user } = res;
  if (user.role !== "ADMIN" && user.role !== "KARYAWAN") {
    return { error: "Akun ini tidak memiliki akses ke admin panel" };
  }
  await createSession({ id: user.id, name: user.name, email: user.email, role: user.role as Role });
  redirect(user.role === "ADMIN" ? "/admin" : "/admin/products/new");
}

export async function customerLogin(_: FormState, formData: FormData): Promise<FormState> {
  const res = await authenticate(formData);
  if ("error" in res) return { error: res.error };
  const { user } = res;
  await createSession({ id: user.id, name: user.name, email: user.email, role: user.role as Role });
  const next = String(formData.get("next") || "");
  if (user.role !== "CUSTOMER") redirect("/admin");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/account");
}

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter"),
    email: z.string().trim().email("Format email tidak valid"),
    phone: z.string().trim().min(8, "Nomor telepon tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Konfirmasi password tidak sama", path: ["confirm"] });

export async function register(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const email = parsed.data.email.toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "Email sudah terdaftar, silakan masuk" };
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      phone: parsed.data.phone,
      password: await bcrypt.hash(parsed.data.password, 10),
      role: "CUSTOMER",
    },
  });
  await createSession({ id: user.id, name: user.name, email: user.email, role: "CUSTOMER" });
  redirect("/account");
}

export async function logout() {
  await destroySession();
  redirect("/");
}

export async function adminLogout() {
  await destroySession();
  redirect("/admin/login");
}
