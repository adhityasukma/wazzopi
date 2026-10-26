"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import type { FormState } from "./auth";

const schema = z.object({
  name: z.string().trim().min(2, "Nama kategori minimal 2 karakter"),
  description: z.string().optional(),
  image: z.string().optional(),
});

export async function saveCategory(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const parsed = schema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    image: formData.get("image") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const slug = slugify(parsed.data.name);
  const dup = await prisma.category.findUnique({ where: { slug } });
  if (dup && dup.id !== id) return { error: "Kategori dengan nama tersebut sudah ada" };

  if (id) {
    await prisma.category.update({ where: { id }, data: { ...parsed.data, slug } });
  } else {
    await prisma.category.create({ data: { ...parsed.data, slug } });
  }
  revalidatePath("/admin/categories");
  return { success: id ? "Kategori diperbarui" : "Kategori ditambahkan" };
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  await prisma.category.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/categories");
}
