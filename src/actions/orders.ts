"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { generateOrderNo, ORDER_STATUSES } from "@/lib/utils";
import type { FormState } from "./auth";

const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Nama penerima wajib diisi"),
  customerEmail: z.string().trim().email("Email tidak valid"),
  customerPhone: z.string().trim().min(8, "Nomor telepon tidak valid"),
  address: z.string().trim().min(5, "Alamat wajib diisi"),
  city: z.string().trim().min(2, "Kota wajib diisi"),
  province: z.string().trim().min(2, "Provinsi wajib diisi"),
  postalCode: z.string().trim().min(4, "Kode pos wajib diisi"),
  notes: z.string().optional(),
  shippingMethod: z.string().min(1, "Pilih metode pengiriman"),
  paymentMethod: z.enum(["bank_transfer", "cod", "midtrans"], { message: "Pilih metode pembayaran" }),
  items: z
    .array(z.object({ productId: z.string(), variantId: z.string().nullable().optional(), quantity: z.number().int().min(1) }))
    .min(1, "Keranjang belanja kosong"),
});

export async function placeOrder(_: FormState, formData: FormData): Promise<FormState> {
  let items: unknown = [];
  try {
    items = JSON.parse(String(formData.get("items") || "[]"));
  } catch {
    /* noop */
  }
  const parsed = checkoutSchema.safeParse({ ...Object.fromEntries(formData), items });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const settings = await getSettings();
  const session = await getSession();

  // Validasi metode pembayaran
  const pay = settings.payment;
  if (
    (d.paymentMethod === "bank_transfer" && !pay.bankTransfer.enabled) ||
    (d.paymentMethod === "cod" && !pay.cod.enabled) ||
    (d.paymentMethod === "midtrans" && !pay.midtrans.enabled)
  ) {
    return { error: "Metode pembayaran tidak tersedia" };
  }

  // Hitung ulang harga dari database
  type OrderLine = {
    productId: string;
    variantId: string | null;
    productName: string;
    variantName: string | null;
    price: number;
    quantity: number;
    total: number;
  };
  const lines: OrderLine[] = [];
  for (const it of d.items) {
    const product = await prisma.product.findUnique({ where: { id: it.productId }, include: { variants: true } });
    if (!product || product.status !== "PUBLISHED") return { error: "Ada produk yang sudah tidak tersedia" };
    const variant = it.variantId ? product.variants.find((v) => v.id === it.variantId) : null;
    if (product.hasVariants && !variant) return { error: `Pilih varian untuk ${product.name}` };
    const stock = variant ? variant.stock : product.stock;
    if (stock < it.quantity) return { error: `Stok ${product.name}${variant ? ` (${variant.name})` : ""} tidak mencukupi` };
    const price = variant ? variant.price : product.price;
    lines.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      productName: product.name,
      variantName: variant?.name ?? null,
      price,
      quantity: it.quantity,
      total: price * it.quantity,
    });
  }
  const subtotal = lines.reduce((a, l) => a + l.total, 0);

  // Ongkir
  let shippingName: string;
  let shippingCost = 0;
  if (d.shippingMethod === "pickup") {
    if (!settings.shipping.pickupEnabled) return { error: "Ambil di toko tidak tersedia" };
    shippingName = "Ambil di Toko";
  } else {
    const m = settings.shipping.methods.find((x) => x.id === d.shippingMethod && x.enabled);
    if (!m) return { error: "Metode pengiriman tidak tersedia" };
    shippingName = m.name;
    const free =
      settings.shipping.freeShippingEnabled &&
      subtotal >= settings.shipping.freeShippingMin;
    shippingCost = free ? 0 : m.cost;
  }
  const codFee = d.paymentMethod === "cod" ? pay.cod.fee : 0;
  const tax = Math.round((subtotal * (settings.other.taxPercent || 0)) / 100);
  const total = subtotal + shippingCost + codFee + tax;

  const orderNo = generateOrderNo(settings.other.orderPrefix || "WZ");
  const extraNotes = [d.notes, codFee ? `Biaya COD: ${codFee}` : "", tax ? `Pajak: ${tax}` : ""].filter(Boolean).join(" | ");

  await prisma.$transaction(async (tx) => {
    await tx.order.create({
      data: {
        orderNo,
        userId: session?.id,
        customerName: d.customerName,
        customerEmail: d.customerEmail,
        customerPhone: d.customerPhone,
        address: d.address,
        city: d.city,
        province: d.province,
        postalCode: d.postalCode,
        notes: extraNotes || null,
        shippingMethod: shippingName,
        shippingCost,
        paymentMethod: d.paymentMethod,
        subtotal,
        total,
        status: "PENDING",
        items: { create: lines },
      },
    });
    for (const l of lines) {
      if (l.variantId) {
        await tx.productVariant.update({ where: { id: l.variantId }, data: { stock: { decrement: l.quantity } } });
      }
      await tx.product.update({ where: { id: l.productId }, data: { stock: { decrement: l.quantity } } });
    }
  });

  // Simpan alamat ke profil customer jika belum ada
  if (session?.role === "CUSTOMER") {
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (user && !user.address) {
      await prisma.user.update({
        where: { id: user.id },
        data: { address: d.address, city: d.city, province: d.province, postalCode: d.postalCode, phone: user.phone || d.customerPhone },
      });
    }
  }

  revalidatePath("/admin/orders");
  redirect(`/checkout/success/${orderNo}`);
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) return;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return;

  // kembalikan stok jika dibatalkan
  if (status === "CANCELLED" && order.status !== "CANCELLED") {
    for (const it of order.items) {
      if (it.variantId) await prisma.productVariant.updateMany({ where: { id: it.variantId }, data: { stock: { increment: it.quantity } } });
      if (it.productId) await prisma.product.updateMany({ where: { id: it.productId }, data: { stock: { increment: it.quantity } } });
    }
  }
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}
