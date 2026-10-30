export type MidtransCategory = "qris" | "va" | "ewallet" | "card" | "cstore";

export type MidtransChannelDef = {
  id: string;
  snapCode: string;
  name: string;
  category: MidtransCategory;
  categoryLabel: string;
  desc: string;
  badge?: string;
};

export const MIDTRANS_CHANNEL_LIST: MidtransChannelDef[] = [
  // QRIS & E-Wallet
  {
    id: "qris",
    snapCode: "other_qris",
    name: "QRIS",
    category: "qris",
    categoryLabel: "QRIS & E-Wallet",
    desc: "BCA QRIS, GoPay, OVO, DANA, ShopeePay, LinkAja, & semua mobile banking",
  },
  {
    id: "gopay",
    snapCode: "gopay",
    name: "GoPay / GoPay Later",
    category: "ewallet",
    categoryLabel: "QRIS & E-Wallet",
    desc: "Bayar langsung dengan aplikasi GoPay / Gojek",
    badge: "Otomatis",
  },
  {
    id: "shopeepay",
    snapCode: "shopeepay",
    name: "ShopeePay / SPayLater",
    category: "ewallet",
    categoryLabel: "QRIS & E-Wallet",
    desc: "Bayar langsung melalui aplikasi Shopee",
    badge: "Otomatis",
  },

  // Virtual Account
  {
    id: "bca_va",
    snapCode: "bca_va",
    name: "BCA Virtual Account",
    category: "va",
    categoryLabel: "Virtual Account (Verifikasi Otomatis)",
    desc: "BCA Mobile, myBCA, KlikBCA, atau ATM BCA",
    badge: "Otomatis",
  },
  {
    id: "mandiri_va",
    snapCode: "echannel",
    name: "Mandiri Virtual Account",
    category: "va",
    categoryLabel: "Virtual Account (Verifikasi Otomatis)",
    desc: "Livin' by Mandiri (Bill Payment), ATM Mandiri, atau Internet Banking",
    badge: "Otomatis",
  },
  {
    id: "bni_va",
    snapCode: "bni_va",
    name: "BNI Virtual Account",
    category: "va",
    categoryLabel: "Virtual Account (Verifikasi Otomatis)",
    desc: "BNI Mobile Banking, BNI Internet Banking, atau ATM BNI",
    badge: "Otomatis",
  },
  {
    id: "bri_va",
    snapCode: "bri_va",
    name: "BRI Virtual Account (BRIVA)",
    category: "va",
    categoryLabel: "Virtual Account (Verifikasi Otomatis)",
    desc: "BRImo, Internet Banking BRI, atau ATM BRI",
    badge: "Otomatis",
  },
  {
    id: "permata_va",
    snapCode: "permata_va",
    name: "Permata Virtual Account",
    category: "va",
    categoryLabel: "Virtual Account (Verifikasi Otomatis)",
    desc: "PermataMobile X atau ATM Bank Permata",
    badge: "Otomatis",
  },
  {
    id: "cimb_va",
    snapCode: "cimb_va",
    name: "CIMB Niaga Virtual Account",
    category: "va",
    categoryLabel: "Virtual Account (Verifikasi Otomatis)",
    desc: "OCTO Mobile, OCTO Clicks, atau ATM CIMB Niaga",
    badge: "Otomatis",
  },
  {
    id: "other_va",
    snapCode: "other_va",
    name: "Virtual Account Bank Lainnya",
    category: "va",
    categoryLabel: "Virtual Account (Verifikasi Otomatis)",
    desc: "Transfer via ATM Bersama, Prima, atau ALTO",
    badge: "Otomatis",
  },

  // Kartu Kredit
  {
    id: "credit_card",
    snapCode: "credit_card",
    name: "Kartu Kredit / Debit",
    category: "card",
    categoryLabel: "Kartu Kredit & Debit",
    desc: "Visa, Mastercard, JCB, atau American Express",
    badge: "Instant",
  },

  // Gerai Retail
  {
    id: "alfamart",
    snapCode: "alfamart",
    name: "Alfamart / Alfamidi",
    category: "cstore",
    categoryLabel: "Gerai Retail",
    desc: "Bayar tunai di gerai Alfamart terdekat",
    badge: "Kasir",
  },
  {
    id: "indomaret",
    snapCode: "indomaret",
    name: "Indomaret",
    category: "cstore",
    categoryLabel: "Gerai Retail",
    desc: "Bayar tunai di gerai Indomaret terdekat",
    badge: "Kasir",
  },
];

export const DEFAULT_MIDTRANS_CHANNELS = [
  "qris",
  "bca_va",
  "mandiri_va",
  "bni_va",
  "bri_va",
];

export function getChannelById(id: string): MidtransChannelDef | undefined {
  return MIDTRANS_CHANNEL_LIST.find((c) => c.id === id);
}

export function isMidtransPayment(method?: string | null): boolean {
  if (!method) return false;
  return method === "midtrans" || method.startsWith("midtrans_");
}

export function getSnapCodeFromPaymentMethod(method?: string | null): string[] | null {
  if (!method) return null;
  if (!method.startsWith("midtrans_")) return null;
  const channelId = method.replace("midtrans_", "");

  // QRIS pada Midtrans Snap didukung lewat other_qris, gopay, dan shopeepay
  if (channelId === "qris") {
    return ["other_qris", "gopay", "shopeepay"];
  }

  const channel = getChannelById(channelId);
  return channel?.snapCode ? [channel.snapCode] : null;
}
