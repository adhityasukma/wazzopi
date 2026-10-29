"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, requireCustomer } from "@/lib/auth";
import type { FormState } from "./auth";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter"),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  province: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
});

export async function updateProfile(_: FormState, formData: FormData): Promise<FormState> {
  const session = await requireCustomer();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const user = await prisma.user.update({ where: { id: session.id }, data: parsed.data });
  await createSession({ ...session, name: user.name });
  revalidatePath("/account");
  return { success: "Profil berhasil diperbarui" };
}

const pwSchema = z
  .object({
    current: z.string().min(1, "Password saat ini wajib diisi"),
    password: z
      .string()
      .min(8, "Password baru minimal 8 karakter")
      .regex(/[A-Z]/, "Password baru harus mengandung minimal 1 huruf besar (A-Z)")
      .regex(/[a-z]/, "Password baru harus mengandung minimal 1 huruf kecil (a-z)")
      .regex(/[0-9]/, "Password baru harus mengandung minimal 1 angka (0-9)"),
    confirm: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Konfirmasi password baru tidak cocok",
    path: ["confirm"],
  });

export async function changePassword(_: FormState, formData: FormData): Promise<FormState> {
  const session = await requireCustomer();
  const parsed = pwSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user || !(await bcrypt.compare(parsed.data.current, user.password))) {
    return { error: "Password saat ini salah" };
  }
  await prisma.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(parsed.data.password, 10) } });
  return { success: "Password berhasil diubah" };
}
