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

export async function deleteSingleHeroSlide(id: string) {
  await requireAdmin();
  if (!id) return { success: false, error: "ID slide tidak valid" };

  try {
    await prisma.heroSlide.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/hero-slides");
    return { success: true };
  } catch (error: any) {
    console.error("[deleteSingleHeroSlide error]:", error);
    return { success: false, error: error.message || "Gagal menghapus slide" };
  }
}

export async function deleteSelectedHeroSlides(ids: string[]) {
  await requireAdmin();
  if (!ids || ids.length === 0) {
    return { success: false, error: "Pilih minimal 1 slide untuk dihapus" };
  }

  try {
    const res = await prisma.heroSlide.deleteMany({
      where: { id: { in: ids } },
    });
    revalidatePath("/");
    revalidatePath("/admin/hero-slides");
    return { success: true, count: res.count };
  } catch (error: any) {
    console.error("[deleteSelectedHeroSlides error]:", error);
    return { success: false, error: error.message || "Gagal menghapus slide terpilih" };
  }
}

export async function deleteAllHeroSlides() {
  await requireAdmin();

  try {
    const res = await prisma.heroSlide.deleteMany({});
    revalidatePath("/");
    revalidatePath("/admin/hero-slides");
    return { success: true, count: res.count };
  } catch (error: any) {
    console.error("[deleteAllHeroSlides error]:", error);
    return { success: false, error: error.message || "Gagal menghapus seluruh slide" };
  }
}
