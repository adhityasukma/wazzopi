"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireStaff } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import type { FormState } from "./auth";

const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Nama varian wajib diisi"),
  sku: z.string().optional(),
  price: z.coerce.number().int().min(0, "Harga varian tidak valid"),
  stock: z.coerce.number().int().min(0, "Stok varian tidak valid"),
});

const productSchema = z.object({
  name: z.string().trim().min(2, "Nama produk minimal 2 karakter"),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  image: z.string().optional(),
  price: z.coerce.number().int().min(0).default(0),
  comparePrice: z.coerce.number().int().min(0).optional(),
  stock: z.coerce.number().int().min(0).default(0),
  sku: z.string().optional(),
  weight: z.coerce.number().int().min(0).default(250),
  status: z.enum(["PUBLISHED", "DRAFT"]).default("PUBLISHED"),
  featured: z.boolean().default(false),
  hasVariants: z.boolean().default(false),
  variants: z.array(variantSchema).default([]),
});

function parseProduct(formData: FormData) {
  let variants: unknown = [];
  try {
    variants = JSON.parse(String(formData.get("variants") || "[]"));
  } catch {
    variants = [];
  }
  const cp = String(formData.get("comparePrice") || "");
  return productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    image: formData.get("image") || undefined,
    price: formData.get("price") || 0,
    comparePrice: cp ? cp : undefined,
    stock: formData.get("stock") || 0,
    sku: formData.get("sku") || undefined,
    weight: formData.get("weight") || 250,
    status: formData.get("status") || "PUBLISHED",
    featured: formData.get("featured") === "on",
    hasVariants: formData.get("hasVariants") === "on",
    variants,
  });
}

async function uniqueSlug(name: string, excludeId?: string) {
  const base = slugify(name) || "produk";
  let slug = base;
  let i = 1;
  while (true) {
    const found = await prisma.product.findUnique({ where: { slug } });
    if (!found || found.id === excludeId) return slug;
    slug = `${base}-${++i}`;
  }
}

/** Dapat diakses Administrator dan Karyawan */
export async function createProduct(_: FormState, formData: FormData): Promise<FormState> {
  const session = await requireStaff();
  const parsed = parseProduct(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  if (d.hasVariants && d.variants.length === 0) return { error: "Tambahkan minimal satu varian" };

  const slug = await uniqueSlug(d.name);
  await prisma.product.create({
    data: {
      name: d.name,
      slug,
      description: d.description,
      categoryId: d.categoryId || null,
      image: d.image || null,
      price: d.hasVariants ? Math.min(...d.variants.map((v) => v.price)) : d.price,
      comparePrice: d.comparePrice || null,
      stock: d.hasVariants ? d.variants.reduce((a, v) => a + v.stock, 0) : d.stock,
      sku: d.sku,
      weight: d.weight,
      status: d.status,
      featured: session.role === "ADMIN" ? d.featured : false,
      hasVariants: d.hasVariants,
      variants: d.hasVariants
        ? { create: d.variants.map((v) => ({ name: v.name, sku: v.sku, price: v.price, stock: v.stock })) }
        : undefined,
    },
  });
  revalidatePath("/admin/products");
  revalidatePath("/");
  if (session.role === "KARYAWAN") {
    return { success: `Produk "${d.name}" berhasil ditambahkan` };
  }
  redirect("/admin/products?created=1");
}

export async function updateProduct(id: string, _: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseProduct(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  if (d.hasVariants && d.variants.length === 0) return { error: "Tambahkan minimal satu varian" };

  const slug = await uniqueSlug(d.name, id);
  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        name: d.name,
        slug,
        description: d.description,
        categoryId: d.categoryId || null,
        image: d.image || null,
        price: d.hasVariants ? Math.min(...d.variants.map((v) => v.price)) : d.price,
        comparePrice: d.comparePrice || null,
        stock: d.hasVariants ? d.variants.reduce((a, v) => a + v.stock, 0) : d.stock,
        sku: d.sku,
        weight: d.weight,
        status: d.status,
        featured: d.featured,
        hasVariants: d.hasVariants,
      },
    });
    const keepIds = d.hasVariants ? d.variants.filter((v) => v.id).map((v) => v.id!) : [];
    await tx.productVariant.deleteMany({ where: { productId: id, id: { notIn: keepIds } } });
    if (d.hasVariants) {
      for (const v of d.variants) {
        if (v.id) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: { name: v.name, sku: v.sku, price: v.price, stock: v.stock },
          });
        } else {
          await tx.productVariant.create({
            data: { productId: id, name: v.name, sku: v.sku, price: v.price, stock: v.stock },
          });
        }
      }
    }
  });
  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products?updated=1");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function deleteSingleProduct(id: string) {
  await requireAdmin();
  if (!id) return { success: false, error: "ID produk tidak valid" };

  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("[deleteSingleProduct error]:", error);
    return { success: false, error: error.message || "Gagal menghapus produk" };
  }
}

export async function deleteSelectedProducts(ids: string[]) {
  await requireAdmin();
  if (!ids || ids.length === 0) {
    return { success: false, error: "Pilih minimal 1 produk untuk dihapus" };
  }

  try {
    const res = await prisma.product.deleteMany({
      where: { id: { in: ids } },
    });
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, count: res.count };
  } catch (error: any) {
    console.error("[deleteSelectedProducts error]:", error);
    return { success: false, error: error.message || "Gagal menghapus produk terpilih" };
  }
}

export async function deleteAllProducts() {
  await requireAdmin();

  try {
    const res = await prisma.product.deleteMany({});
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, count: res.count };
  } catch (error: any) {
    console.error("[deleteAllProducts error]:", error);
    return { success: false, error: error.message || "Gagal menghapus seluruh produk" };
  }
}
