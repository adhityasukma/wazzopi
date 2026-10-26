"use server";

import { revalidatePath } from "next/cache";
import { getMidtransSnapToken, type SnapTokenResult } from "@/lib/midtrans";
import { prisma } from "@/lib/prisma";

export async function requestSnapPayment(orderNo: string): Promise<SnapTokenResult> {
  return getMidtransSnapToken(orderNo);
}

export async function confirmMidtransSuccess(orderNo: string): Promise<{ success: boolean }> {
  try {
    const order = await prisma.order.findUnique({ where: { orderNo } });
    if (order && order.status === "PENDING") {
      await prisma.order.update({
        where: { orderNo },
        data: { status: "PAID" },
      });
      revalidatePath(`/checkout/success/${orderNo}`);
      revalidatePath("/admin/orders");
      revalidatePath("/account");
    }
    return { success: true };
  } catch (err) {
    console.error("[Midtrans Confirm Error]:", err);
    return { success: false };
  }
}
