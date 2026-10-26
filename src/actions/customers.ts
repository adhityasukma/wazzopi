"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function deleteCustomer(id: string) {
  await requireAdmin();
  if (!id) return { success: false, error: "ID pelanggan tidak valid" };

  try {
    const res = await prisma.user.deleteMany({
      where: {
        id,
        role: "CUSTOMER", // Hanya menghapus role CUSTOMER, keamanan akun ADMIN & KARYAWAN terjamin
      },
    });

    if (res.count === 0) {
      return { success: false, error: "Pelanggan tidak ditemukan atau bukan berstatus customer" };
    }

    revalidatePath("/admin/customers");
    return { success: true };
  } catch (error: any) {
    console.error("[deleteCustomer error]:", error);
    return { success: false, error: error.message || "Gagal menghapus data pelanggan" };
  }
}

export async function deleteSelectedCustomers(ids: string[]) {
  await requireAdmin();
  if (!ids || ids.length === 0) {
    return { success: false, error: "Pilih minimal 1 pelanggan untuk dihapus" };
  }

  try {
    const res = await prisma.user.deleteMany({
      where: {
        id: { in: ids },
        role: "CUSTOMER", // Hanya menghapus role CUSTOMER
      },
    });

    revalidatePath("/admin/customers");
    return { success: true, count: res.count };
  } catch (error: any) {
    console.error("[deleteSelectedCustomers error]:", error);
    return { success: false, error: error.message || "Gagal menghapus pelanggan terpilih" };
  }
}

export async function deleteAllCustomers() {
  await requireAdmin();

  try {
    const res = await prisma.user.deleteMany({
      where: {
        role: "CUSTOMER", // Hanya menghapus role CUSTOMER, jangan sentuh ADMIN / KARYAWAN
      },
    });

    revalidatePath("/admin/customers");
    return { success: true, count: res.count };
  } catch (error: any) {
    console.error("[deleteAllCustomers error]:", error);
    return { success: false, error: error.message || "Gagal menghapus seluruh pelanggan" };
  }
}
