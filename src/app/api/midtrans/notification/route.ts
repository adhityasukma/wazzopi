import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { verifyMidtransSignature } from "@/lib/midtrans";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    console.log(`[Midtrans Webhook] Menerima notifikasi untuk Order #${order_id}: ${transaction_status}`);

    const settings = await getSettings();
    const serverKey = settings.payment.midtrans.serverKey;

    if (!serverKey) {
      return NextResponse.json({ error: "Server Key tidak ditemukan" }, { status: 400 });
    }

    // Verifikasi signature keamanan dari Midtrans
    const isValid = verifyMidtransSignature(
      order_id,
      status_code,
      gross_amount,
      serverKey,
      signature_key
    );

    if (!isValid) {
      console.warn(`[Midtrans Webhook Warning] Signature tidak valid untuk order #${order_id}`);
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // Cari pesanan di database
    const order = await prisma.order.findUnique({
      where: { orderNo: order_id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
    }

    let nextStatus = order.status;

    if (transaction_status === "capture") {
      if (fraud_status === "challenge") {
        nextStatus = "PENDING";
      } else if (fraud_status === "accept") {
        nextStatus = "PAID";
      }
    } else if (transaction_status === "settlement") {
      nextStatus = "PAID";
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      nextStatus = "CANCELLED";
    } else if (transaction_status === "pending") {
      nextStatus = "PENDING";
    }

    if (nextStatus !== order.status) {
      // Jika dibatalkan atau kedaluwarsa, kembalikan stok
      if (nextStatus === "CANCELLED" && order.status !== "CANCELLED") {
        for (const it of order.items) {
          if (it.variantId) {
            await prisma.productVariant.updateMany({
              where: { id: it.variantId },
              data: { stock: { increment: it.quantity } },
            });
          }
          if (it.productId) {
            await prisma.product.updateMany({
              where: { id: it.productId },
              data: { stock: { increment: it.quantity } },
            });
          }
        }
      }

      await prisma.order.update({
        where: { orderNo: order_id },
        data: { status: nextStatus },
      });

      console.log(`[Midtrans Webhook Success] Status Order #${order_id} berhasil diupdate ke ${nextStatus}`);

      // Kirim notifikasi email status pembayaran ke customer
      if (nextStatus === "PAID" || nextStatus === "CANCELLED") {
        try {
          const { sendOrderNotificationByOrderId } = await import("@/lib/email");
          await sendOrderNotificationByOrderId(order.id, {
            forcedStatus: nextStatus,
          });
        } catch (emailErr) {
          console.error("[Midtrans Webhook Email Error]:", emailErr);
        }
      }

      revalidatePath(`/checkout/success/${order_id}`);
      revalidatePath(`/admin/orders/${order.id}`);
      revalidatePath("/admin/orders");
      revalidatePath("/account");
    }

    return NextResponse.json({ status: "OK", orderStatus: nextStatus });
  } catch (error: any) {
    console.error("[Midtrans Webhook Error]:", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}
