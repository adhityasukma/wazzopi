"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, getSession, requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { sendOrderCreatedEmail } from "@/lib/email";
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

  let assignedUserId: string | null = session?.id || null;
  let newAccountInfo: { email: string; tempPassword: string } | null = null;

  // Jika pembeli belum login, cek akun yang ada atau buatkan akun Member baru secara otomatis
  if (!assignedUserId) {
    const cleanEmail = d.customerEmail.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      assignedUserId = existingUser.id;
    } else {
      // Generate password acak sementara yang aman dan mudah diingat (misal: Waz-482910)
      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      const tempPassword = `Waz-${randomDigits}`;
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const createdUser = await prisma.user.create({
        data: {
          name: d.customerName,
          email: cleanEmail,
          password: hashedPassword,
          role: "CUSTOMER",
          phone: d.customerPhone,
          address: d.address,
          city: d.city,
          province: d.province,
          postalCode: d.postalCode,
        },
      });

      assignedUserId = createdUser.id;
      newAccountInfo = {
        email: createdUser.email,
        tempPassword,
      };

      // Otomatis buat session login sehingga pembeli langsung berstatus login di Member Area
      await createSession({
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: "CUSTOMER",
      });
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.create({
      data: {
        orderNo,
        userId: assignedUserId,
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
  if (assignedUserId) {
    const user = await prisma.user.findUnique({ where: { id: assignedUserId } });
    if (user && !user.address) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          address: d.address,
          city: d.city,
          province: d.province,
          postalCode: d.postalCode,
          phone: user.phone || d.customerPhone,
        },
      });
    }
  }

  // Kirim email rincian pesanan & akses akun member
  await sendOrderCreatedEmail({
    customerName: d.customerName,
    customerEmail: d.customerEmail,
    orderNo,
    items: lines.map((l) => ({
      productName: l.productName,
      variantName: l.variantName,
      quantity: l.quantity,
      price: l.price,
      total: l.total,
    })),
    totalAmount: total,
    shippingAddress: `${d.address}, ${d.city}, ${d.province} ${d.postalCode}`,
    shippingMethod: shippingName,
    paymentMethod: d.paymentMethod,
    newAccount: newAccountInfo,
    storeName: settings.general.storeName,
    whatsappContact: settings.other.whatsapp || settings.general.phone,
  });

  // Simpan info akun baru di cookie singkat untuk ditampilkan langsung di halaman /checkout/success/[orderNo]
  if (newAccountInfo) {
    const cookieStore = await cookies();
    cookieStore.set("wz_new_account", JSON.stringify(newAccountInfo), {
      httpOnly: false,
      maxAge: 300,
      path: "/",
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath("/account");
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
