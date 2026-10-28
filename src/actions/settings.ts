"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings, saveSetting } from "@/lib/settings";
import type { CurrencyPosition } from "@/lib/currency";
import type { BankAccount, ShippingMethod, SmtpSettings } from "@/lib/settings-types";
import { sendSmtpTestEmail } from "@/lib/smtp";
import type { FormState } from "./auth";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const num = (f: FormData, k: string) => Number(f.get(k) || 0) || 0;
const bool = (f: FormData, k: string) => f.get(k) === "on";

function done(msg = "Pengaturan berhasil disimpan"): FormState {
  revalidatePath("/", "layout");
  return { success: msg };
}

export async function saveGeneral(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  if (!str(f, "storeName")) return { error: "Nama toko wajib diisi" };
  await saveSetting("general", {
    storeName: str(f, "storeName"),
    tagline: str(f, "tagline"),
    email: str(f, "email"),
    phone: str(f, "phone"),
    address: str(f, "address"),
    city: str(f, "city"),
    province: str(f, "province"),
    postalCode: str(f, "postalCode"),
    country: str(f, "country"),
    mapUrl: str(f, "mapUrl"),
  });
  return done();
}

export async function saveCurrency(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const thousandSep = String(f.get("thousandSep") ?? ".");
  const decimalSep = String(f.get("decimalSep") ?? ",");
  if (thousandSep === decimalSep && thousandSep !== "") return { error: "Separator ribuan dan desimal tidak boleh sama" };
  await saveSetting("currency", {
    code: str(f, "code") || "IDR",
    symbol: str(f, "symbol") || "Rp",
    thousandSep: thousandSep === "space" ? " " : thousandSep,
    decimalSep,
    decimals: Math.max(0, Math.min(4, num(f, "decimals"))),
    position: (str(f, "position") || "left_space") as CurrencyPosition,
  });
  return done();
}

export async function savePayment(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  let accounts: BankAccount[] = [];
  try {
    accounts = (JSON.parse(String(f.get("accounts") || "[]")) as BankAccount[]).filter((a) => a.bank && a.number);
  } catch {
    return { error: "Data rekening tidak valid" };
  }
  const settings = {
    bankTransfer: { enabled: bool(f, "bankEnabled"), accounts },
    cod: { enabled: bool(f, "codEnabled"), fee: num(f, "codFee") },
    midtrans: {
      enabled: bool(f, "midtransEnabled"),
      mode: (str(f, "midtransMode") === "production" ? "production" : "sandbox") as "sandbox" | "production",
      merchantId: str(f, "merchantId"),
      clientKey: str(f, "clientKey"),
      serverKey: str(f, "serverKey"),
    },
  };
  if (!settings.bankTransfer.enabled && !settings.cod.enabled && !settings.midtrans.enabled) {
    return { error: "Aktifkan minimal satu metode pembayaran" };
  }
  if (settings.midtrans.enabled && (!settings.midtrans.clientKey || !settings.midtrans.serverKey)) {
    return { error: "Client Key dan Server Key Midtrans wajib diisi" };
  }
  await saveSetting("payment", settings);
  return done();
}

export async function saveShipping(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  let methods: ShippingMethod[] = [];
  try {
    methods = (JSON.parse(String(f.get("methods") || "[]")) as ShippingMethod[])
      .filter((m) => m.name)
      .map((m) => ({ ...m, id: m.id || m.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), cost: Number(m.cost) || 0 }));
  } catch {
    return { error: "Data kurir tidak valid" };
  }
  const apiKey = str(f, "binderbyteApiKey");
  await saveSetting("shipping", {
    originCity: str(f, "originCity"),
    methods,
    freeShippingEnabled: bool(f, "freeShippingEnabled"),
    freeShippingMin: num(f, "freeShippingMin"),
    pickupEnabled: bool(f, "pickupEnabled"),
    binderbyteApiKey: apiKey,
  });
  if (apiKey) {
    await prisma.setting.upsert({
      where: { key: "binderbyte_api_key" },
      update: { value: apiKey },
      create: { key: "binderbyte_api_key", value: apiKey },
    });
  }
  return done();
}

export async function saveOther(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const current = await getSettings();
  await saveSetting("other", {
    ...current.other,
    metaTitle: str(f, "metaTitle"),
    metaDescription: str(f, "metaDescription"),
    instagram: str(f, "instagram"),
    facebook: str(f, "facebook"),
    whatsapp: str(f, "whatsapp"),
    taxPercent: Math.max(0, Math.min(100, num(f, "taxPercent"))),
    orderPrefix: str(f, "orderPrefix").toUpperCase() || "WZ",
    lowStockThreshold: num(f, "lowStockThreshold"),
  });
  return done();
}

type SlideInput = { id?: string; title: string; subtitle?: string; image: string; ctaLabel?: string; ctaLink?: string; active: boolean };

export async function saveHeroSlides(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  let slides: SlideInput[] = [];
  try {
    slides = JSON.parse(String(f.get("slides") || "[]"));
  } catch {
    return { error: "Data slide tidak valid" };
  }
  slides = slides.filter((s) => s.title && s.image);
  if (slides.length === 0) return { error: "Minimal satu slide dengan judul dan gambar" };
  await prisma.$transaction([
    prisma.heroSlide.deleteMany(),
    prisma.heroSlide.createMany({
      data: slides.map((s, i) => ({
        title: s.title,
        subtitle: s.subtitle || null,
        image: s.image,
        ctaLabel: s.ctaLabel || null,
        ctaLink: s.ctaLink || null,
        active: s.active !== false,
        sortOrder: i,
      })),
    }),
  ]);
  return done("Hero slide berhasil disimpan");
}

export async function saveSmtp(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const enabled = bool(f, "smtpEnabled");
  const host = str(f, "smtpHost");
  const port = num(f, "smtpPort") || 587;
  const encryption = (str(f, "smtpEncryption") || "tls") as "tls" | "ssl" | "none";
  const authRequired = bool(f, "smtpAuthRequired");
  const username = str(f, "smtpUsername");
  const password = str(f, "smtpPassword");
  const fromEmail = str(f, "smtpFromEmail");
  const fromName = str(f, "smtpFromName") || "Wazzopi Coffee";

  if (enabled) {
    if (!host) return { error: "SMTP Host / Server Address wajib diisi jika SMTP diaktifkan" };
    if (!fromEmail) return { error: "From Email Address wajib diisi jika SMTP diaktifkan" };
    if (authRequired && !username) {
      return { error: "SMTP Username / Email wajib diisi jika Authentication Required dicentang" };
    }
  }

  await saveSetting("smtp", {
    enabled,
    host,
    port,
    encryption,
    authRequired,
    username,
    password,
    fromEmail,
    fromName,
  });

  return done("Pengaturan Mail Server (SMTP) berhasil disimpan");
}

export async function testSmtpAction(
  targetEmail: string,
  config: {
    host: string;
    port: number;
    encryption: "tls" | "ssl" | "none";
    authRequired: boolean;
    username: string;
    password: string;
    fromEmail: string;
    fromName: string;
  }
): Promise<{ success: boolean; message: string }> {
  await requireAdmin();
  const cleanTarget = targetEmail?.trim();
  if (!cleanTarget || !cleanTarget.includes("@")) {
    return { success: false, message: "Masukkan alamat email penerima tes yang valid" };
  }
  if (!config.host) {
    return { success: false, message: "SMTP Host wajib diisi untuk melakukan pengujian" };
  }
  if (!config.fromEmail) {
    return { success: false, message: "From Email Address wajib diisi untuk melakukan pengujian" };
  }
  if (config.authRequired && !config.username) {
    return { success: false, message: "SMTP Username wajib diisi untuk autentikasi" };
  }

  const smtpSettings: SmtpSettings = {
    enabled: true,
    host: config.host.trim(),
    port: Number(config.port) || 587,
    encryption: config.encryption,
    authRequired: config.authRequired,
    username: config.username.trim(),
    password: config.password,
    fromEmail: config.fromEmail.trim(),
    fromName: config.fromName?.trim() || "Wazzopi Coffee",
  };

  return sendSmtpTestEmail(smtpSettings, cleanTarget);
}
