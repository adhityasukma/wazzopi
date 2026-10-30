"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, getSession, requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import {
  sendOrderStatusEmail,
  sendOrderNotificationByOrderId,
  sendNewAccountEmail,
  type OrderEmailStatus,
} from "@/lib/email";
import { generateOrderNo, ORDER_STATUSES, ORDER_STATUS_LABEL } from "@/lib/utils";
import { calculateDynamicRates } from "@/lib/shipping-calculator";
import { isMidtransPayment, DEFAULT_MIDTRANS_CHANNELS } from "@/lib/midtrans-channels";
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
  paymentMethod: z.string().min(1, "Pilih metode pembayaran"),
  items: z
    .array(z.object({ productId: z.string(), variantId: z.string().nullable().optional(), quantity: z.number().int().min(1) }))
    .min(1, "Keranjang belanja kosong"),
});

export async function placeOrder(_: FormState, formData: FormData): Promise<FormState> {
  try {
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
  const isMidtrans = isMidtransPayment(d.paymentMethod);
  if (
    (d.paymentMethod === "bank_transfer" && !pay.bankTransfer.enabled) ||
    (d.paymentMethod === "cod" && !pay.cod.enabled) ||
    (isMidtrans && !pay.midtrans.enabled) ||
    (!isMidtrans && d.paymentMethod !== "bank_transfer" && d.paymentMethod !== "cod")
  ) {
    return { error: "Metode pembayaran tidak tersedia" };
  }

  if (d.paymentMethod.startsWith("midtrans_")) {
    const channelId = d.paymentMethod.replace("midtrans_", "");
    const activeChannels =
      pay.midtrans.channels && pay.midtrans.channels.length > 0
        ? pay.midtrans.channels
        : DEFAULT_MIDTRANS_CHANNELS;
    if (!activeChannels.includes(channelId)) {
      return { error: "Metode pembayaran yang dipilih tidak aktif" };
    }
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
    // Hitung tarif dinamis berdasarkan kota tujuan dan produk
    const dynamicMethods = calculateDynamicRates(
      settings.shipping.methods,
      d.city,
      d.province,
      lines.map((l) => ({ name: l.productName, variantName: l.variantName, quantity: l.quantity }))
    );
    const m = dynamicMethods.find((x) => x.id === d.shippingMethod && x.enabled);
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

  let assignedUserId: string | null = null;
  let newAccountInfo: { email: string; tempPassword: string } | null = null;
  let finalCustomerEmail = d.customerEmail.toLowerCase().trim();

  // 1. Jika ada session login di browser, verifikasi apakah User ID tersebut benar-benar ada di database
  if (session?.id) {
    const sessionUser = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, email: true },
    });
    if (sessionUser) {
      assignedUserId = sessionUser.id;
      // Untuk pengguna yang sudah login, selalu kunci email pesanan ke email akun login yang sah
      finalCustomerEmail = sessionUser.email.toLowerCase().trim();
    }
  }

  // 2. Jika user ID tidak ditemukan di database (atau session lama/kadaluarsa), cocokkan via email atau buat akun baru
  if (!assignedUserId) {
    const cleanEmail = finalCustomerEmail;
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
        customerEmail: finalCustomerEmail,
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

  // Kirim notifikasi email sesuai kondisi:
  // 1. Jika user belum login & dibuatkan akun baru, kirim Notifikasi 1: Detail Akses Login Member
  if (newAccountInfo) {
    try {
      await sendNewAccountEmail({
        customerName: d.customerName,
        email: newAccountInfo.email,
        tempPassword: newAccountInfo.tempPassword,
        storeName: settings.general.storeName,
        whatsappContact: settings.other.whatsapp || settings.general.phone,
      });
    } catch (accountEmailErr) {
      console.error("[placeOrder newAccount Email Error]:", accountEmailErr);
    }
  }

  // 2. Kirim Notifikasi 2 (atau tunggal untuk user yang sudah login): Detail Pesanan Baru (Status: Menunggu Pembayaran)
  try {
    await sendOrderStatusEmail({
      status: "PENDING",
      customerName: d.customerName,
      customerEmail: finalCustomerEmail,
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
      bankAccounts: settings.payment.bankTransfer.accounts,
      storeName: settings.general.storeName,
      whatsappContact: settings.other.whatsapp || settings.general.phone,
    });
  } catch (emailErr) {
    console.error("[placeOrder Email Error]:", emailErr);
  }

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
  } catch (err: any) {
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("[PlaceOrder Error]:", err);
    return {
      error:
        err?.message || "Terjadi kesalahan saat memproses pesanan. Silakan coba beberapa saat lagi.",
    };
  }
}

export async function updateOrderStatus(
  formData: FormData
): Promise<{ success: boolean; message?: string; error?: string }> {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const sendEmail = formData.get("sendEmail") === "true";

  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    return { success: false, error: "Status pesanan tidak valid" };
  }
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return { success: false, error: "Pesanan tidak ditemukan" };

  // kembalikan stok jika dibatalkan
  if (status === "CANCELLED" && order.status !== "CANCELLED") {
    for (const it of order.items) {
      if (it.variantId) await prisma.productVariant.updateMany({ where: { id: it.variantId }, data: { stock: { increment: it.quantity } } });
      if (it.productId) await prisma.product.updateMany({ where: { id: it.productId }, data: { stock: { increment: it.quantity } } });
    }
  }

  const updateData: Record<string, any> = { status };
  if (status === "COMPLETED") {
    updateData.trackingStatus = "DELIVERED";
  }

  await prisma.order.update({ where: { id }, data: updateData });

  let emailSent = false;
  let emailError: string | undefined;

  // Kirim notifikasi email status baru ke customer HANYA jika dicentang oleh admin
  if (sendEmail) {
    try {
      await sendOrderNotificationByOrderId(id, {
        forcedStatus: status as OrderEmailStatus,
      });
      emailSent = true;
    } catch (emailErr: any) {
      console.error("[updateOrderStatus Email Error]:", emailErr);
      emailError = emailErr?.message;
    }
  }

  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  revalidatePath("/account");

  const statusLabel = ORDER_STATUS_LABEL[status] || status;
  let feedbackMessage = `Status pesanan berhasil diperbarui menjadi ${statusLabel}.`;
  if (sendEmail) {
    feedbackMessage += emailSent
      ? ` Email notifikasi telah dikirimkan ke ${order.customerEmail}.`
      : ` (Namun gagal mengirim email: ${emailError || "kendala mail server"}).`;
  } else {
    feedbackMessage += " (Disimpan tanpa mengirim email notifikasi).";
  }

  return { success: true, message: feedbackMessage };
}

export async function deleteOrder(id: string) {
  await requireAdmin();
  if (!id) return { success: false, error: "ID pesanan tidak valid" };

  try {
    await prisma.order.delete({
      where: { id },
    });
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error: any) {
    console.error("[deleteOrder error]:", error);
    return { success: false, error: error.message || "Gagal menghapus pesanan" };
  }
}

export async function deleteSelectedOrders(ids: string[]) {
  await requireAdmin();
  if (!ids || ids.length === 0) {
    return { success: false, error: "Pilih minimal 1 pesanan untuk dihapus" };
  }

  try {
    const res = await prisma.order.deleteMany({
      where: { id: { in: ids } },
    });
    revalidatePath("/admin/orders");
    return { success: true, count: res.count };
  } catch (error: any) {
    console.error("[deleteSelectedOrders error]:", error);
    return { success: false, error: error.message || "Gagal menghapus pesanan terpilih" };
  }
}

export async function deleteAllOrders() {
  await requireAdmin();

  try {
    const res = await prisma.order.deleteMany({});
    revalidatePath("/admin/orders");
    return { success: true, count: res.count };
  } catch (error: any) {
    console.error("[deleteAllOrders error]:", error);
    return { success: false, error: error.message || "Gagal menghapus seluruh pesanan" };
  }
}

export async function updateOrderTracking(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "").trim();
  const courierCode = String(formData.get("courierCode") || "").trim().toLowerCase();
  const trackingNumber = String(formData.get("trackingNumber") || "").trim().toUpperCase();
  const force = formData.get("force") === "true";

  if (!id) return { success: false, error: "ID pesanan tidak valid" };

  try {
    const { getCourierName, trackShipment, validateAwbForCourier } = await import("@/lib/tracking");
    const courierName = getCourierName(courierCode);

    // Validasi format nomor resi dan kesesuaian kurir (jika tidak dipaksa simpan)
    let validation: ReturnType<typeof validateAwbForCourier> | undefined;
    if (trackingNumber && !force) {
      validation = validateAwbForCourier(courierCode, trackingNumber);
      if (!validation.valid) {
        return {
          success: false,
          isValidationMismatch: true,
          error: validation.error || "Nomor resi tidak valid untuk kurir yang dipilih",
          detectedCourier: validation.detectedCourier,
          selectedCourierName: courierName,
          trackingNumber,
        };
      }
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) return { success: false, error: "Pesanan tidak ditemukan" };

    // Jika nomor resi dihapus
    if (!trackingNumber) {
      await prisma.order.update({
        where: { id },
        data: {
          trackingNumber: null,
          courierCode: null,
          courierName: null,
          trackingStatus: null,
          trackingHistory: null,
          trackingUpdatedAt: null,
        },
      });
      revalidatePath(`/admin/orders/${id}`);
      revalidatePath("/admin/orders");
      revalidatePath("/account");
      return { success: true, message: "Nomor resi berhasil dihapus" };
    }

    // Otomatis ubah status pesanan menjadi SHIPPED jika sebelumnya PENDING, PAID, atau PROCESSING
    const shouldUpdateStatus = ["PENDING", "PAID", "PROCESSING"].includes(order.status);
    const newStatus = shouldUpdateStatus ? "SHIPPED" : order.status;
    const trackingUpdatedAt = new Date();

    // Ambil data tracking (live API atau fallback kontekstual)
    const trackingInfo = await trackShipment(courierCode, trackingNumber, {
      orderNo: order.orderNo,
      customerName: order.customerName,
      city: order.city,
      createdAt: order.createdAt,
      status: newStatus,
      trackingUpdatedAt,
    });

    // Jika API Key ekspedisi aktif dan server kurir mengembalikan error resi tidak terdaftar (bukan force simpan):
    if (trackingInfo.liveApiError && !force) {
      return {
        success: false,
        isValidationMismatch: true,
        error: `Nomor resi ${trackingNumber} tidak terdaftar di server resmi ${courierName}. (${trackingInfo.liveApiError})`,
        detectedCourier: validation?.detectedCourier,
        selectedCourierName: courierName,
        trackingNumber,
      };
    }

    await prisma.order.update({
      where: { id },
      data: {
        courierCode,
        courierName,
        trackingNumber,
        status: newStatus,
        trackingStatus: trackingInfo.status,
        trackingHistory: JSON.stringify(trackingInfo.checkpoints),
        trackingUpdatedAt,
      },
    });

    // Kirim email notifikasi nomor resi & informasi pengiriman ke customer
    try {
      await sendOrderNotificationByOrderId(id, {
        forcedStatus: "SHIPPED",
      });
    } catch (emailErr) {
      console.error("[updateOrderTracking Email Error]:", emailErr);
    }

    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/orders");
    revalidatePath("/account");

    const feedbackMessage = trackingInfo.isLive
      ? `Nomor resi resmi terverifikasi di server ${courierName}! Data kurir live disinkronkan.`
      : `Nomor resi disimpan. (Belum terindeks di server resmi ${courierName}, menggunakan estimasi pelacakan toko).`;

    return { success: true, isLive: trackingInfo.isLive, message: feedbackMessage };
  } catch (error: any) {
    console.error("[updateOrderTracking error]:", error);
    return { success: false, error: error.message || "Gagal memperbarui nomor resi" };
  }
}

export async function refreshOrderTracking(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || !order.trackingNumber) {
      return { success: false, error: "Data resi belum lengkap" };
    }

    const { resolveEffectiveCourier } = await import("@/lib/tracking-constants");
    const effective = resolveEffectiveCourier({
      trackingNumber: order.trackingNumber,
      courierCode: order.courierCode,
      courierName: order.courierName,
      shippingMethod: order.shippingMethod,
    });

    // Auto-heal kurir di database jika terdeteksi ketidakcocokan ekspedisi
    const needHealCourier =
      (effective.courierCode && order.courierCode !== effective.courierCode) ||
      (effective.courierName && order.courierName !== effective.courierName);

    if (needHealCourier) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          courierCode: effective.courierCode,
          courierName: effective.courierName,
        },
      });
    }

    const { trackShipment } = await import("@/lib/tracking");
    const trackingInfo = await trackShipment(effective.courierCode, order.trackingNumber, {
      orderNo: order.orderNo,
      customerName: order.customerName,
      city: order.city,
      createdAt: order.createdAt,
      status: order.status,
      trackingUpdatedAt: order.trackingUpdatedAt || order.createdAt,
    });

    const isNowDelivered = trackingInfo.status === "DELIVERED";

    await prisma.order.update({
      where: { id: orderId },
      data: {
        trackingStatus: trackingInfo.status,
        trackingHistory: JSON.stringify(trackingInfo.checkpoints),
        trackingUpdatedAt: new Date(),
        // Jika dari API statusnya DELIVERED, otomatis selesaikan pesanan
        status: isNowDelivered ? "COMPLETED" : order.status,
      },
    });

    if (isNowDelivered && order.status !== "COMPLETED") {
      try {
        await sendOrderNotificationByOrderId(orderId, {
          forcedStatus: "COMPLETED",
        });
      } catch (emailErr) {
        console.error("[refreshOrderTracking Email Error]:", emailErr);
      }
    }

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/account");
    return { success: true, tracking: trackingInfo };
  } catch (error: any) {
    console.error("[refreshOrderTracking error]:", error);
    return { success: false, error: error.message || "Gagal memperbarui tracking" };
  }
}

export async function confirmOrderReceived(orderId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Silakan login terlebih dahulu" };

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) return { success: false, error: "Pesanan tidak ditemukan" };

    // Pastikan pesanan milik user yang sedang login (atau admin)
    if (session.role !== "ADMIN" && order.userId !== session.id) {
      return { success: false, error: "Akses tidak diizinkan" };
    }

    // Parse riwayat lama
    let checkpoints = [];
    try {
      checkpoints = order.trackingHistory ? JSON.parse(order.trackingHistory) : [];
    } catch {
      checkpoints = [];
    }

    const nowStr = new Date().toLocaleDateString("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB";

    // Tambahkan checkpoint selesai di posisi paling atas
    checkpoints.unshift({
      date: nowStr,
      desc: `Pesanan telah dikonfirmasi diterima dengan baik oleh ${order.customerName}. Transaksi selesai.`,
      location: order.city,
      status: "DELIVERED",
    });

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "COMPLETED",
        trackingStatus: "DELIVERED",
        trackingHistory: JSON.stringify(checkpoints),
        trackingUpdatedAt: new Date(),
      },
    });

    // Kirim notifikasi email pesanan selesai ke customer
    try {
      await sendOrderNotificationByOrderId(orderId, {
        forcedStatus: "COMPLETED",
      });
    } catch (emailErr) {
      console.error("[confirmOrderReceived Email Error]:", emailErr);
    }

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    revalidatePath("/account");
    return { success: true };
  } catch (error: any) {
    console.error("[confirmOrderReceived error]:", error);
    return { success: false, error: error.message || "Gagal mengonfirmasi pesanan" };
  }
}

/**
 * Kirim ulang email status pesanan terkini via Mail Server (SMTP) atau Resend
 */
export async function resendOrderEmail(
  orderId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { customerEmail: true, orderNo: true, status: true },
    });
    if (!order) {
      return { success: false, message: "Pesanan tidak ditemukan" };
    }

    const result = await sendOrderNotificationByOrderId(orderId);

    if (result.success && result.id) {
      return {
        success: true,
        message: `Sukses terkirim ke ${order.customerEmail} (ID: ${result.id})`,
      };
    } else if (result.error) {
      return { success: false, message: result.error };
    }

    return {
      success: true,
      message: `Email berhasil diproses ke ${order.customerEmail}`,
    };
  } catch (err: any) {
    console.error("[resendOrderEmail Error]:", err);
    return { success: false, message: err.message || "Gagal memproses pengiriman email" };
  }
}
