"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import type { FormState } from "./auth";

export async function saveHeroSlide(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const id = String(formData.get("id") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const subtitle = String(formData.get("subtitle") || "").trim();
  const image = String(formData.get("image") || "").trim();
  const ctaLabel = String(formData.get("ctaLabel") || "").trim();
  const ctaLink = String(formData.get("ctaLink") || "").trim();
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const active = formData.get("active") === "on";

  if (!title) return { error: "Judul slide wajib diisi" };
  if (!image) return { error: "Gambar slide wajib dipilih atau diisi URL-nya" };

  if (id) {
    await prisma.heroSlide.update({
      where: { id },
      data: {
        title,
        subtitle: subtitle || null,
        image,
        ctaLabel: ctaLabel || null,
        ctaLink: ctaLink || null,
        sortOrder,
        active,
      },
    });
  } else {
    await prisma.heroSlide.create({
      data: {
        title,
        subtitle: subtitle || null,
        image,
        ctaLabel: ctaLabel || null,
        ctaLink: ctaLink || null,
        sortOrder,
        active,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/admin/hero-slides");
  return { success: id ? "Slide berhasil diperbarui" : "Slide berhasil ditambahkan" };
}

export async function toggleHeroSlide(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const slide = await prisma.heroSlide.findUnique({ where: { id } });
  if (slide) {
    await prisma.heroSlide.update({
      where: { id },
      data: { active: !slide.active },
    });
    revalidatePath("/");
    revalidatePath("/admin/hero-slides");
  }
}

export async function deleteHeroSlide(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.heroSlide.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/hero-slides");
}
