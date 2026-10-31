import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateOrderNo(prefix = "WZ") {
  const d = new Date();
  const ymd = `${d.getFullYear().toString().slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}${ymd}-${rand}`;
}

export function formatDate(date: Date | string, withTime = false) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export const ORDER_STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu Pembayaran",
  PAID: "Dibayar",
  PROCESSING: "Diproses",
  SHIPPED: "Dikirim",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

export const ORDER_STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-800 ring-amber-200",
  PAID: "bg-sky-50 text-sky-800 ring-sky-200",
  PROCESSING: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  SHIPPED: "bg-caramel-50 text-caramel-700 ring-caramel-200",
  COMPLETED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-800 ring-rose-200",
};

/** Status yang dihitung sebagai penjualan */
export const SALES_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "COMPLETED"];

export const PAYMENT_LABEL: Record<string, string> = {
  bank_transfer: "Transfer Bank Manual",
  cod: "Bayar di Tempat (COD)",
  midtrans: "Pembayaran Online (Midtrans)",
  midtrans_qris: "QRIS",
  midtrans_gopay: "GoPay / GoPay Later",
  midtrans_shopeepay: "ShopeePay / SPayLater",
  midtrans_bca_va: "BCA Virtual Account",
  midtrans_mandiri_va: "Mandiri Virtual Account",
  midtrans_bni_va: "BNI Virtual Account",
  midtrans_bri_va: "BRI Virtual Account",
  midtrans_permata_va: "Permata Virtual Account",
  midtrans_cimb_va: "CIMB Niaga Virtual Account",
  midtrans_other_va: "Bank Lainnya (Virtual Account)",
  midtrans_credit_card: "Kartu Kredit / Debit",
  midtrans_alfamart: "Gerai Alfamart",
  midtrans_indomaret: "Gerai Indomaret",
  stripe: "Stripe (International Cards)",
  paypal: "PayPal",
};
