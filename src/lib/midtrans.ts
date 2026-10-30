import "server-only";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { getSnapCodeFromPaymentMethod, getChannelById } from "@/lib/midtrans-channels";

export type SnapTokenResult =
  | {
      token: string;
      redirectUrl?: string;
      clientKey: string;
      isProduction: boolean;
    }
  | {
      error: string;
    };

export async function getMidtransSnapToken(orderNo: string): Promise<SnapTokenResult> {
  try {
    const [order, settings] = await Promise.all([
      prisma.order.findUnique({
        where: { orderNo },
        include: { items: true },
      }),
      getSettings(),
    ]);

    if (!order) {
      return { error: "Pesanan tidak ditemukan" };
    }

    const midtrans = settings.payment.midtrans;
    if (!midtrans.enabled || !midtrans.serverKey || !midtrans.clientKey) {
      return {
        error:
          "Payment Gateway Midtrans belum diaktifkan atau Client/Server Key belum diisi di Pengaturan Admin.",
      };
    }

    const isProduction = midtrans.mode === "production";
    const cacheKey = `snap_${orderNo}_${order.paymentMethod || "midtrans"}_v2`;

    // 1. Cek apakah token Snap sudah pernah dibuat sebelumnya
    const cachedToken = await prisma.setting.findUnique({
      where: { key: cacheKey },
    });

    if (cachedToken?.value) {
      return {
        token: cachedToken.value,
        clientKey: midtrans.clientKey,
        isProduction,
      };
    }

    // 2. Jika belum, buat transaksi baru ke Midtrans Snap API
    const snapUrl = isProduction
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions";

    // Siapkan detail item
    const itemsList = order.items.map((it) => ({
      id: it.id.slice(0, 50),
      price: it.price,
      quantity: it.quantity,
      name: (it.productName + (it.variantName ? ` (${it.variantName})` : "")).slice(0, 50),
    }));

    if (order.shippingCost > 0) {
      itemsList.push({
        id: "SHIPPING",
        price: order.shippingCost,
        quantity: 1,
        name: "Ongkos Kirim",
      });
    }

    // Pastikan total item_details sama persis dengan gross_amount
    const currentSum = itemsList.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
    if (currentSum !== order.total) {
      const diff = order.total - currentSum;
      itemsList.push({
        id: "FEE_ADJUSTMENT",
        price: diff,
        quantity: 1,
        name: "Biaya Layanan / Tambahan",
      });
    }

    const authHeader = `Basic ${Buffer.from(`${midtrans.serverKey}:`).toString("base64")}`;

    const snapCodes = getSnapCodeFromPaymentMethod(order.paymentMethod);
    let enabledPayments: string[] | undefined;

    if (snapCodes && snapCodes.length > 0) {
      enabledPayments = snapCodes;
    } else if (midtrans.channels && midtrans.channels.length > 0) {
      enabledPayments = Array.from(
        new Set(
          midtrans.channels.flatMap((chId) => {
            if (chId === "qris") return ["other_qris", "gopay", "shopeepay"];
            const code = getChannelById(chId)?.snapCode;
            return code ? [code] : [];
          })
        )
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://wazzopi.vercel.app");
    const returnUrl = `${baseUrl}/checkout/success/${order.orderNo}`;

    const payload: Record<string, any> = {
      transaction_details: {
        order_id: order.orderNo,
        gross_amount: order.total,
      },
      customer_details: {
        first_name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        shipping_address: {
          first_name: order.customerName,
          phone: order.customerPhone,
          address: order.address,
          city: order.city,
          postal_code: order.postalCode,
        },
      },
      item_details: itemsList,
      callbacks: {
        finish: returnUrl,
        unfinish: returnUrl,
        error: returnUrl,
      },
    };

    if (enabledPayments && enabledPayments.length > 0) {
      payload.enabled_payments = enabledPayments;
    }

    const res = await fetch(snapUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMsg =
        data.error_messages?.join(", ") ||
        data.message ||
        "Gagal membuat token pembayaran Midtrans";
      console.error("[Midtrans Snap API Error]:", data);
      return { error: errorMsg };
    }

    // Simpan token ke database Setting agar transaksi yang sama dapat dilanjutkan sewaktu-waktu
    if (data.token) {
      await prisma.setting.upsert({
        where: { key: cacheKey },
        update: { value: data.token },
        create: { key: cacheKey, value: data.token },
      });
    }

    return {
      token: data.token,
      redirectUrl: data.redirect_url,
      clientKey: midtrans.clientKey,
      isProduction,
    };
  } catch (err: any) {
    console.error("[Midtrans Helper Error]:", err);
    return { error: err.message || "Terjadi kesalahan koneksi ke Midtrans" };
  }
}

export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  signatureKey: string
): boolean {
  const hash = crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex");
  return hash === signatureKey;
}
