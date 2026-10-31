"use client";

import { useActionState, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  CheckCircle2,
  Coins,
  CreditCard,
  Eye,
  EyeOff,
  Landmark,
  Loader2,
  Mail,
  MapPin,
  PhoneCall,
  Plus,
  QrCode,
  Send,
  Sliders,
  Store,
  Trash2,
  Truck,
  Wallet,
} from "lucide-react";
import { useAppLoading } from "@/components/loading-provider";
import { useI18n } from "@/i18n/provider";
import {
  saveCurrency,
  saveGeneral,
  saveOther,
  savePayment,
  saveShipping,
  saveSmtp,
  testSmtpAction,
} from "@/actions/settings";
import { Alert, Button, Field, Input, Select, Textarea } from "@/components/ui";
import { CityProvinceSelector } from "@/components/shop/city-province-selector";
import { cn } from "@/lib/utils";
import { CURRENCIES, formatCurrency, type CurrencyPosition, type CurrencySettings } from "@/lib/currency";
import { MIDTRANS_CHANNEL_LIST, DEFAULT_MIDTRANS_CHANNELS } from "@/lib/midtrans-channels";
import type { AllSettings, BankAccount, ShippingMethod, SmtpSettings } from "@/lib/settings-types";

export function SettingsForm({
  initialSettings,
}: {
  initialSettings: AllSettings;
}) {
  const { locale } = useI18n();
  const isEn = locale === "en";
  const [generalSubTab, setGeneralSubTab] = useState<"identity" | "contact" | "address">("identity");
  const [activeTab, setActiveTab] = useState<
    "general" | "currency" | "payment" | "shipping" | "smtp" | "other"
  >("general");

  const [generalState, generalAction, generalPending] = useActionState(saveGeneral, undefined);
  const [currencyState, currencyAction, currencyPending] = useActionState(saveCurrency, undefined);
  const [paymentState, paymentAction, paymentPending] = useActionState(savePayment, undefined);
  const [shippingState, shippingAction, shippingPending] = useActionState(saveShipping, undefined);
  const [smtpState, smtpAction, smtpPending] = useActionState(saveSmtp, undefined);
  const [otherState, otherAction, otherPending] = useActionState(saveOther, undefined);
  const { showLoading, hideLoading } = useAppLoading();

  useEffect(() => {
    if (generalPending) {
      showLoading(isEn ? "Saving store general settings..." : "Menyimpan informasi umum toko...");
    } else if (currencyPending) {
      showLoading(isEn ? "Saving currency format..." : "Menyimpan format mata uang...");
    } else if (paymentPending) {
      showLoading(isEn ? "Saving payment methods..." : "Menyimpan metode pembayaran...");
    } else if (shippingPending) {
      showLoading(isEn ? "Saving couriers & shipping..." : "Menyimpan kurir & pengiriman...");
    } else if (smtpPending) {
      showLoading(isEn ? "Saving Mail Server (SMTP) settings..." : "Menyimpan pengaturan Mail Server (SMTP)...");
    } else if (otherPending) {
      showLoading(isEn ? "Saving system & SEO settings..." : "Menyimpan pengaturan sistem & SEO...");
    } else {
      hideLoading();
    }
  }, [
    generalPending,
    currencyPending,
    paymentPending,
    shippingPending,
    smtpPending,
    otherPending,
    showLoading,
    hideLoading,
  ]);

  // Currency live preview state
  const [currencyConfig, setCurrencyConfig] = useState<CurrencySettings>(initialSettings.currency);

  // Bank accounts state
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(
    initialSettings.payment.bankTransfer.accounts
  );

  // Midtrans channels state
  const [selectedChannels, setSelectedChannels] = useState<string[]>(
    initialSettings.payment.midtrans.channels && initialSettings.payment.midtrans.channels.length > 0
      ? initialSettings.payment.midtrans.channels
      : DEFAULT_MIDTRANS_CHANNELS
  );

  useEffect(() => {
    if (initialSettings.payment.midtrans.channels && initialSettings.payment.midtrans.channels.length > 0) {
      setSelectedChannels(initialSettings.payment.midtrans.channels);
    }
  }, [initialSettings.payment.midtrans.channels]);

  function toggleChannel(id: string) {
    setSelectedChannels((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function selectAllChannels() {
    setSelectedChannels(MIDTRANS_CHANNEL_LIST.map((c) => c.id));
  }

  function clearAllChannels() {
    setSelectedChannels([]);
  }

  // Shipping methods state
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>(
    initialSettings.shipping.methods
  );

  const [freeShippingEnabled, setFreeShippingEnabled] = useState<boolean>(
    Boolean(initialSettings.shipping.freeShippingEnabled)
  );

  useEffect(() => {
    setFreeShippingEnabled(Boolean(initialSettings.shipping.freeShippingEnabled));
    setShippingMethods(initialSettings.shipping.methods);
  }, [initialSettings.shipping]);

  function addBankAccount() {
    setBankAccounts((prev) => [...prev, { bank: "", number: "", holder: "" }]);
  }

  function removeBankAccount(index: number) {
    setBankAccounts((prev) => prev.filter((_, i) => i !== index));
  }

  function updateBankField(index: number, field: keyof BankAccount, val: string) {
    setBankAccounts((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [field]: val } : b))
    );
  }

  function addShippingMethod() {
    setShippingMethods((prev) => [
      ...prev,
      { id: `method-${Date.now()}`, name: "", cost: 20000, etd: "2-3 hari", enabled: true },
    ]);
  }

  function removeShippingMethod(index: number) {
    setShippingMethods((prev) => prev.filter((_, i) => i !== index));
  }

  function updateShippingField(
    index: number,
    field: keyof ShippingMethod,
    val: string | number | boolean
  ) {
    setShippingMethods((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: val } : m))
    );
  }

  // SMTP Settings State
  const initialSmtp = initialSettings.smtp || {
    enabled: false,
    host: "",
    port: 587,
    encryption: "tls",
    authRequired: true,
    username: "",
    password: "",
    fromEmail: "",
    fromName: "Wazzopi Coffee",
  };
  const [smtpEnabled, setSmtpEnabled] = useState<boolean>(Boolean(initialSmtp.enabled));
  const [smtpEncryption, setSmtpEncryption] = useState<"tls" | "ssl" | "none">(
    (initialSmtp.encryption as "tls" | "ssl" | "none") || "tls"
  );
  const [smtpPort, setSmtpPort] = useState<number>(initialSmtp.port || 587);
  const [smtpAuthRequired, setSmtpAuthRequired] = useState<boolean>(
    initialSmtp.authRequired ?? true
  );
  const [showSmtpPassword, setShowSmtpPassword] = useState<boolean>(false);

  const [smtpHost, setSmtpHost] = useState(initialSmtp.host || "");
  const [smtpUsername, setSmtpUsername] = useState(initialSmtp.username || "");
  const [smtpPassword, setSmtpPassword] = useState(initialSmtp.password || "");
  const [smtpFromEmail, setSmtpFromEmail] = useState(initialSmtp.fromEmail || "");
  const [smtpFromName, setSmtpFromName] = useState(initialSmtp.fromName || "Wazzopi Coffee");

  // State Test Email
  const [testEmailTarget, setTestEmailTarget] = useState<string>("");
  const [testingSmtp, setTestingSmtp] = useState<boolean>(false);
  const [testSmtpResult, setTestSmtpResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleEncryptionChange = (enc: "tls" | "ssl" | "none") => {
    setSmtpEncryption(enc);
    if (enc === "ssl") {
      setSmtpPort(465);
    } else if (enc === "tls") {
      setSmtpPort(587);
    } else {
      setSmtpPort(25);
    }
  };

  const handleTestSmtp = async () => {
    if (!testEmailTarget.trim()) {
      setTestSmtpResult({
        success: false,
        message: "Silakan masukkan alamat email penerima uji coba terlebih dahulu.",
      });
      return;
    }
    setTestingSmtp(true);
    setTestSmtpResult(null);
    try {
      const res = await testSmtpAction(testEmailTarget, {
        host: smtpHost,
        port: smtpPort,
        encryption: smtpEncryption,
        authRequired: smtpAuthRequired,
        username: smtpUsername,
        password: smtpPassword,
        fromEmail: smtpFromEmail,
        fromName: smtpFromName,
      });
      setTestSmtpResult(res);
    } catch (err: any) {
      setTestSmtpResult({
        success: false,
        message: err.message || "Gagal menghubungkan ke server SMTP",
      });
    } finally {
      setTestingSmtp(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Navigasi Tab Pengaturan */}
      <div className="lg:col-span-3">
        <nav className="space-y-1 rounded-xl border border-latte bg-white p-2 shadow-xs">
          {[
            { id: "general", label: isEn ? "General & Store" : "Umum & Toko", icon: Store },
            { id: "currency", label: isEn ? "Currency Options" : "Opsi Mata Uang (Currency)", icon: Coins },
            { id: "payment", label: isEn ? "Payment Methods" : "Metode Pembayaran", icon: CreditCard },
            { id: "shipping", label: isEn ? "Shipping & Couriers" : "Kurir & Pengiriman", icon: Truck },
            { id: "smtp", label: isEn ? "Mail Server (SMTP)" : "Mail Server (SMTP)", icon: Mail },
            { id: "other", label: isEn ? "Other & SEO" : "Lainnya & SEO", icon: Sliders },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as typeof activeTab)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-espresso-700 text-cream"
                    : "text-espresso-700 hover:bg-latte"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Konten Tab */}
      <div className="lg:col-span-9">
        {/* TAB 1: GENERAL */}
        {activeTab === "general" && (
          <div className="rounded-xl border border-latte bg-white p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-latte pb-4">
              <div>
                <h2 className="text-base font-bold text-espresso-900">
                  {isEn ? "General Store Information & Contact" : "Informasi Umum Toko & Kontak"}
                </h2>
                <p className="text-xs text-espresso-500 mt-0.5">
                  {isEn
                    ? "Manage your brand identity, contact channels, and physical storefront address without clutter."
                    : "Kelola identitas brand, saluran kontak pelanggan, dan alamat fisik toko secara rapi dan terorganisir."}
                </p>
              </div>

              {/* Sub-tab pills */}
              <div className="inline-flex rounded-xl border border-latte bg-cream/40 p-1">
                {[
                  { id: "identity", label: isEn ? "Brand Identity" : "Identitas Brand", icon: Store },
                  { id: "contact", label: isEn ? "Contact & Hours" : "Kontak & Jam Buka", icon: PhoneCall },
                  { id: "address", label: isEn ? "Store Address" : "Alamat Toko", icon: MapPin },
                ].map((s) => {
                  const SIcon = s.icon;
                  const active = generalSubTab === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setGeneralSubTab(s.id as any)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer",
                        active
                          ? "bg-espresso-900 text-white shadow-xs"
                          : "text-espresso-700 hover:bg-latte/60"
                      )}
                    >
                      <SIcon className={cn("h-3.5 w-3.5", active ? "text-caramel-300" : "text-caramel-600")} />
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {generalState?.error && <Alert tone="error">{generalState.error}</Alert>}
            {generalState?.success && <Alert tone="success">{generalState.success}</Alert>}

            <form action={generalAction} className="space-y-6">
              {/* SUB-SECTION 1: BRAND IDENTITY */}
              <div
                className={cn(
                  "space-y-5 rounded-xl border border-latte/80 bg-latte/10 p-5",
                  generalSubTab === "identity" ? "block animate-in fade-in-50 duration-200" : "hidden"
                )}
              >
                <div className="flex items-center gap-2.5 pb-2 border-b border-latte/60">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-caramel-100 text-caramel-800">
                    <Store className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-espresso-900">
                      {isEn ? "Brand & Store Identity" : "Identitas Brand & Toko"}
                    </h3>
                    <p className="text-[11px] text-espresso-500">
                      {isEn
                        ? "Displayed across your public storefront navigation header and footer"
                        : "Tampil di header navigasi beranda dan footer toko online"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={isEn ? "Brand / Store Name *" : "Nama Brand / Toko *"}>
                    <Input
                      name="storeName"
                      defaultValue={initialSettings.general.storeName}
                      placeholder={isEn ? "e.g. Wazzopi Artisan Coffee" : "Contoh: Wazzopi"}
                      required
                    />
                  </Field>
                  <Field label={isEn ? "Store Tagline" : "Tagline Toko"}>
                    <Input
                      name="tagline"
                      defaultValue={initialSettings.general.tagline}
                      placeholder={isEn ? "e.g. One Sip, Endless Stories" : "Contoh: Satu Teguk, Banyak Cerita"}
                    />
                  </Field>
                </div>

                {/* Mini Preview Box */}
                <div className="rounded-lg border border-latte bg-white p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-espresso-900 text-white font-bold text-xs">
                      WP
                    </div>
                    <div>
                      <p className="text-xs font-bold text-espresso-900">
                        {initialSettings.general.storeName || "Wazzopi"}
                      </p>
                      <p className="text-[11px] text-caramel-700">
                        {initialSettings.general.tagline || "One Sip, Endless Stories"}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-espresso-400 bg-latte/40 px-2 py-0.5 rounded">
                    {isEn ? "Storefront Preview" : "Pratinjau Toko"}
                  </span>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setGeneralSubTab("contact")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-caramel-700 hover:text-caramel-900 cursor-pointer"
                  >
                    <span>{isEn ? "Next: Contact & Hours" : "Lanjut: Kontak & Jam Buka"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* SUB-SECTION 2: CONTACT & OPERATING HOURS */}
              <div
                className={cn(
                  "space-y-5 rounded-xl border border-latte/80 bg-latte/10 p-5",
                  generalSubTab === "contact" ? "block animate-in fade-in-50 duration-200" : "hidden"
                )}
              >
                <div className="flex items-center gap-2.5 pb-2 border-b border-latte/60">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-caramel-100 text-caramel-800">
                    <PhoneCall className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-espresso-900">
                      {isEn ? "Customer Contact & Operating Hours" : "Kontak Pelanggan & Jam Operasional"}
                    </h3>
                    <p className="text-[11px] text-espresso-500">
                      {isEn
                        ? "Contact info shown in footer 'Visit Us' and automated customer notification emails"
                        : "Informasi kontak di bagian footer 'Kunjungi Kami' dan email rincian pesanan"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label={isEn ? "CS Phone Number" : "Nomor Telepon CS"}
                    hint={isEn ? "Displayed with phone icon in footer" : "Ditampilkan dengan ikon telepon di footer"}
                  >
                    <Input name="phone" defaultValue={initialSettings.general.phone} placeholder="6282353538212" required />
                  </Field>
                  <Field
                    label={isEn ? "Store WhatsApp (WA Phone)" : "Nomor WhatsApp Toko (WA Phone)"}
                    hint={isEn ? "Active WA number for 'Chat on WhatsApp' button & order confirmation" : "Nomor WA aktif untuk tombol 'Chat dengan WA' & konfirmasi pesanan"}
                  >
                    <Input
                      name="whatsapp"
                      defaultValue={initialSettings.general.whatsapp || initialSettings.other.whatsapp || "6282353538212"}
                      placeholder="6282353538212"
                      required
                    />
                  </Field>
                  <Field
                    label={isEn ? "Official Store Email" : "Email Resmi Toko"}
                    hint={isEn ? "Displayed in footer & receives admin notifications" : "Ditampilkan di footer & penerima notifikasi admin"}
                  >
                    <Input name="email" type="email" defaultValue={initialSettings.general.email} placeholder="halo@wazzopi.com" required />
                  </Field>
                  <Field
                    label={isEn ? "Store Operating Hours" : "Jam Operasional Toko"}
                    hint={isEn ? "Displayed with clock icon in footer 'Visit Us'" : "Ditampilkan dengan ikon jam di footer 'Kunjungi Kami'"}
                  >
                    <Input
                      name="openingHours"
                      defaultValue={initialSettings.general.openingHours || "Setiap hari, 08.00 - 22.00"}
                      placeholder={isEn ? "E.g.: Every day, 08.00 - 22.00" : "Contoh: Setiap hari, 08.00 - 22.00"}
                    />
                  </Field>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setGeneralSubTab("identity")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-espresso-600 hover:text-espresso-900 cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>{isEn ? "Back: Brand Identity" : "Kembali: Identitas Brand"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGeneralSubTab("address")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-caramel-700 hover:text-caramel-900 cursor-pointer"
                  >
                    <span>{isEn ? "Next: Store Address" : "Lanjut: Alamat Toko"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* SUB-SECTION 3: STORE PHYSICAL ADDRESS & REGIONAL LOCATION */}
              <div
                className={cn(
                  "space-y-5 rounded-xl border border-latte/80 bg-latte/10 p-5",
                  generalSubTab === "address" ? "block animate-in fade-in-50 duration-200" : "hidden"
                )}
              >
                <div className="flex items-center gap-2.5 pb-2 border-b border-latte/60">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-caramel-100 text-caramel-800">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-espresso-900">
                      {isEn ? "Physical Store Address & Location" : "Alamat Fisik & Lokasi Toko"}
                    </h3>
                    <p className="text-[11px] text-espresso-500">
                      {isEn
                        ? "Street address, country, city, province, postal code, and Google Maps location"
                        : "Alamat jalan, negara, kota, provinsi, kode pos, dan tautan lokasi Google Maps"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Field label={isEn ? "Street Address / Building" : "Alamat Jalan / Gedung"}>
                    <Textarea
                      name="address"
                      defaultValue={initialSettings.general.address}
                      rows={2}
                      placeholder={isEn ? "e.g. Jl. Kopi Nusantara No. 17" : "Contoh: Jl. Kopi Nusantara No. 17"}
                    />
                  </Field>

                  {/* CityProvinceSelector with WooCommerce-style Country dropdown placed BEFORE City */}
                  <div className="rounded-xl border border-latte bg-white p-4 shadow-2xs">
                    <CityProvinceSelector
                      showCountry={true}
                      defaultCountry={initialSettings.general.country || "Indonesia"}
                      defaultCity={initialSettings.general.city}
                      defaultProvince={initialSettings.general.province}
                      defaultPostalCode={initialSettings.general.postalCode}
                      showPostalCode={true}
                      required={false}
                    />
                  </div>

                  <Field
                    label={isEn ? "Google Maps URL / Map Link" : "URL Google Maps / Tautan Peta Lokasi"}
                    hint={isEn ? "If filled, clicking the address in the footer will open this map link" : "Jika diisi, klik pada alamat di footer akan membuka tautan peta ini"}
                  >
                    <Input
                      name="mapUrl"
                      type="url"
                      defaultValue={initialSettings.general.mapUrl || ""}
                      placeholder="https://maps.app.goo.gl/..."
                    />
                  </Field>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setGeneralSubTab("contact")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-espresso-600 hover:text-espresso-900 cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>{isEn ? "Back: Contact & Hours" : "Kembali: Kontak & Jam Buka"}</span>
                  </button>
                </div>
              </div>

              {/* Action Bar (Always accessible) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-latte">
                <div className="text-xs text-espresso-500 font-medium">
                  {generalSubTab === "identity" && (isEn ? "Step 1 of 3: Brand & Identity" : "Langkah 1 dari 3: Identitas Brand")}
                  {generalSubTab === "contact" && (isEn ? "Step 2 of 3: Contact & Hours" : "Langkah 2 dari 3: Kontak & Jam Buka")}
                  {generalSubTab === "address" && (isEn ? "Step 3 of 3: Store Address" : "Langkah 3 dari 3: Alamat Toko")}
                </div>

                <div className="flex items-center gap-2">
                  <Button type="submit" disabled={generalPending} className="justify-center h-10 px-6 font-semibold">
                    {generalPending
                      ? (isEn ? "Saving Settings..." : "Menyimpan Pengaturan...")
                      : (isEn ? "Save General & Contact Settings" : "Simpan Pengaturan Umum & Kontak")}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: CURRENCY */}
        {activeTab === "currency" && (
          <div className="rounded-xl border border-latte bg-white p-6 shadow-xs">
            <h2 className="text-base font-bold text-espresso-900 border-b border-latte pb-3">
              {isEn ? "Currency Format Options" : "Opsi Format Mata Uang (Currency Options)"}
            </h2>
            {currencyState?.error && <Alert tone="error" className="mt-4">{currencyState.error}</Alert>}
            {currencyState?.success && <Alert tone="success" className="mt-4">{currencyState.success}</Alert>}

            {/* Live Preview Box */}
            <div className="mt-6 rounded-lg border border-caramel-200 bg-caramel-50/40 p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-caramel-800">
                {isEn ? "Live Price Display Preview:" : "Live Preview Tampilan Harga:"}
              </span>
              <p className="mt-1 font-display text-3xl font-bold text-espresso-900">
                {formatCurrency(125000, currencyConfig)}
              </p>
              <p className="mt-1 text-xs text-espresso-500">
                {isEn ? "Example product price formatting (Rp 125,000) with settings below." : "Contoh format harga produk Rp 125.000 dengan pengaturan di bawah ini."}
              </p>
            </div>

            <form action={currencyAction} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={isEn ? "Currency Selection" : "Pilihan Mata Uang"}>
                  <Select
                    name="code"
                    value={currencyConfig.code}
                    onChange={(e) => {
                      const sel = CURRENCIES.find((c) => c.code === e.target.value);
                      if (sel) {
                        setCurrencyConfig((prev) => ({
                          ...prev,
                          code: sel.code,
                          symbol: sel.symbol,
                        }));
                      }
                    }}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.code} - {c.symbol})
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label={isEn ? "Currency Symbol" : "Simbol Mata Uang"}>
                  <Input
                    name="symbol"
                    value={currencyConfig.symbol}
                    onChange={(e) =>
                      setCurrencyConfig((prev) => ({ ...prev, symbol: e.target.value }))
                    }
                  />
                </Field>

                <Field label={isEn ? "Thousand Separator" : "Pemisah Ribuan (Thousand Separator)"}>
                  <Select
                    name="thousandSep"
                    value={currencyConfig.thousandSep}
                    onChange={(e) =>
                      setCurrencyConfig((prev) => ({ ...prev, thousandSep: e.target.value }))
                    }
                  >
                    <option value=".">{isEn ? "Dot ( . ) - Indonesian Standard" : "Titik ( . ) - Standar Indonesia"}</option>
                    <option value=",">{isEn ? "Comma ( , ) - US Standard" : "Koma ( , ) - Standar US"}</option>
                    <option value="space">{isEn ? "Space ( &nbsp; )" : "Spasi ( &nbsp; )"}</option>
                  </Select>
                </Field>

                <Field label={isEn ? "Decimal Separator" : "Pemisah Desimal (Decimal Separator)"}>
                  <Select
                    name="decimalSep"
                    value={currencyConfig.decimalSep}
                    onChange={(e) =>
                      setCurrencyConfig((prev) => ({ ...prev, decimalSep: e.target.value }))
                    }
                  >
                    <option value=",">{isEn ? "Comma ( , ) - Indonesian Standard" : "Koma ( , ) - Standar Indonesia"}</option>
                    <option value=".">{isEn ? "Dot ( . ) - US Standard" : "Titik ( . ) - Standar US"}</option>
                  </Select>
                </Field>

                <Field label={isEn ? "Decimal Places" : "Jumlah Angka Desimal"}>
                  <Input
                    name="decimals"
                    type="number"
                    min={0}
                    max={4}
                    value={currencyConfig.decimals}
                    onChange={(e) =>
                      setCurrencyConfig((prev) => ({
                        ...prev,
                        decimals: Number(e.target.value),
                      }))
                    }
                  />
                </Field>

                <Field label={isEn ? "Currency Symbol Position" : "Posisi Simbol Mata Uang"}>
                  <Select
                    name="position"
                    value={currencyConfig.position}
                    onChange={(e) =>
                      setCurrencyConfig((prev) => ({
                        ...prev,
                        position: e.target.value as CurrencyPosition,
                      }))
                    }
                  >
                    <option value="left_space">{isEn ? "Left with space (Rp 100,000)" : "Kiri dengan spasi (Rp 100.000)"}</option>
                    <option value="left">{isEn ? "Left without space (Rp100,000)" : "Kiri tanpa spasi (Rp100.000)"}</option>
                    <option value="right_space">{isEn ? "Right with space (100,000 Rp)" : "Kanan dengan spasi (100.000 Rp)"}</option>
                    <option value="right">{isEn ? "Right without space (100,000Rp)" : "Kanan tanpa spasi (100.000Rp)"}</option>
                  </Select>
                </Field>
              </div>

              <div className="pt-4 border-t border-latte">
                <Button type="submit" disabled={currencyPending} className="justify-center">
                  {currencyPending ? (isEn ? "Saving..." : "Menyimpan...") : (isEn ? "Save Currency Format" : "Simpan Format Mata Uang")}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: PAYMENT */}
        {activeTab === "payment" && (
          <div className="rounded-xl border border-latte bg-white p-6 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-espresso-900 border-b border-latte pb-3">
              {isEn ? "Payment Methods" : "Metode Pembayaran"}
            </h2>
            {paymentState?.error && <Alert tone="error">{paymentState.error}</Alert>}
            {paymentState?.success && <Alert tone="success">{paymentState.success}</Alert>}

            <form action={paymentAction} className="space-y-6">
              {/* Transfer Bank */}
              <div className="rounded-lg border border-latte p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-espresso-900">{isEn ? "Manual Bank Transfer" : "Transfer Bank Manual"}</h3>
                    <p className="text-xs text-espresso-400">{isEn ? "Direct payment to store bank accounts" : "Pembayaran langsung ke nomor rekening toko"}</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-espresso-800">
                    <input
                      type="checkbox"
                      name="bankEnabled"
                      defaultChecked={initialSettings.payment.bankTransfer.enabled}
                      className="rounded border-espresso-300 text-caramel-600 focus:ring-caramel-500 h-4 w-4"
                    />
                    {isEn ? "Active" : "Aktif"}
                  </label>
                </div>

                <input type="hidden" name="accounts" value={JSON.stringify(bankAccounts)} />

                <div className="space-y-3">
                  {bankAccounts.map((b, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg bg-cream/40 p-2.5">
                      <div className="w-24">
                        <Input
                          placeholder="Bank (BCA)"
                          value={b.bank}
                          onChange={(e) => updateBankField(i, "bank", e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="flex-1 min-w-36">
                        <Input
                          placeholder={isEn ? "Account Number" : "No. Rekening"}
                          value={b.number}
                          onChange={(e) => updateBankField(i, "number", e.target.value)}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                      <div className="flex-1 min-w-36">
                        <Input
                          placeholder={isEn ? "Account Holder Name" : "Atas Nama"}
                          value={b.holder}
                          onChange={(e) => updateBankField(i, "holder", e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBankAccount(i)}
                        className="rounded p-1 text-rose-500 hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addBankAccount}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-caramel-600 hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" /> {isEn ? "Add Bank Account" : "Tambah Rekening Bank"}
                  </button>
                </div>
              </div>

              {/* Bayar di Tempat (COD) */}
              <div className="rounded-lg border border-latte p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-espresso-900">{isEn ? "Cash on Delivery (COD)" : "Bayar di Tempat (COD)"}</h3>
                    <p className="text-xs text-espresso-400">{isEn ? "Customer pays cash upon delivery" : "Pelanggan membayar tunai saat kurir tiba"}</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-espresso-800">
                    <input
                      type="checkbox"
                      name="codEnabled"
                      defaultChecked={initialSettings.payment.cod.enabled}
                      className="rounded border-espresso-300 text-caramel-600 focus:ring-caramel-500 h-4 w-4"
                    />
                    {isEn ? "Active" : "Aktif"}
                  </label>
                </div>
                <div className="max-w-xs">
                  <Field label={isEn ? "COD Handling Fee" : "Biaya Penanganan COD (Fee)"}>
                    <Input
                      name="codFee"
                      type="number"
                      defaultValue={initialSettings.payment.cod.fee}
                      placeholder="5000"
                    />
                  </Field>
                </div>
              </div>

              {/* Payment Gateway Midtrans */}
              <div className="rounded-lg border border-latte p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-espresso-900">{isEn ? "Midtrans Payment Gateway (Snap)" : "Payment Gateway Midtrans (Snap)"}</h3>
                    <p className="text-xs text-espresso-400">
                      {isEn ? "Accepts QRIS, GoPay, OVO, ShopeePay, Virtual Accounts, & Credit Cards" : "Menerima QRIS, GoPay, OVO, ShopeePay, Virtual Account, & Kartu Kredit"}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-espresso-800">
                    <input
                      type="checkbox"
                      name="midtransEnabled"
                      defaultChecked={initialSettings.payment.midtrans.enabled}
                      className="rounded border-espresso-300 text-caramel-600 focus:ring-caramel-500 h-4 w-4"
                    />
                    {isEn ? "Active" : "Aktif"}
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Environment Mode">
                    <Select name="midtransMode" defaultValue={initialSettings.payment.midtrans.mode}>
                      <option value="sandbox">{isEn ? "Sandbox (Testing / Development)" : "Sandbox (Testing / Pengembangan)"}</option>
                      <option value="production">Production (Live)</option>
                    </Select>
                  </Field>
                  <Field label="Merchant ID">
                    <Input
                      name="merchantId"
                      defaultValue={initialSettings.payment.midtrans.merchantId}
                      placeholder="G123456789"
                    />
                  </Field>
                  <Field label="Client Key">
                    <Input
                      name="clientKey"
                      defaultValue={initialSettings.payment.midtrans.clientKey}
                      placeholder="SB-Mid-client-..."
                    />
                  </Field>
                  <Field label="Server Key">
                    <Input
                      name="serverKey"
                      type="password"
                      defaultValue={initialSettings.payment.midtrans.serverKey}
                      placeholder="SB-Mid-server-..."
                    />
                  </Field>
                </div>

                {/* Centang Channel Midtrans yang Aktif */}
                <div className="mt-4 pt-4 border-t border-latte/80 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-caramel-800">
                        {isEn ? "Midtrans Payment Channels Displayed on Checkout" : "Channel Pembayaran Midtrans yang Ditampilkan di Checkout"}
                      </h4>
                      <p className="text-[11px] text-espresso-500 mt-0.5">
                        {isEn ? "Check the channels active in your Midtrans portal to display them clearly on checkout." : "Centang channel yang aktif di portal Midtrans Anda untuk ditampilkan secara jelas seperti pilihan di Shopee."}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={selectAllChannels}
                        className="text-[11px] font-semibold text-caramel-700 hover:text-caramel-900 underline cursor-pointer"
                      >
                        {isEn ? "Select All" : "Pilih Semua"}
                      </button>
                      <span className="text-espresso-300">|</span>
                      <button
                        type="button"
                        onClick={clearAllChannels}
                        className="text-[11px] font-semibold text-espresso-500 hover:text-espresso-700 underline cursor-pointer"
                      >
                        {isEn ? "Clear All" : "Hapus Semua"}
                      </button>
                    </div>
                  </div>

                  <input
                    type="hidden"
                    name="midtransChannels"
                    value={JSON.stringify(selectedChannels)}
                  />

                  {/* Kategori 1: QRIS & E-Wallet */}
                  <div>
                    <span className="text-[11px] font-bold text-espresso-700 block mb-2">
                      {isEn ? "1. QRIS & E-Wallet" : "1. QRIS & E-Wallet"}
                    </span>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {MIDTRANS_CHANNEL_LIST.filter(
                        (c) => c.category === "qris" || c.category === "ewallet"
                      ).map((c) => {
                        const isChecked = selectedChannels.includes(c.id);
                        return (
                          <label
                            key={c.id}
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                              isChecked
                                ? "border-caramel-500 bg-caramel-50/25 ring-1 ring-caramel-400"
                                : "border-espresso-100 hover:border-espresso-200 bg-white"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleChannel(c.id)}
                              className="mt-0.5 rounded border-espresso-300 text-caramel-600 focus:ring-caramel-500 h-4 w-4"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="font-semibold text-xs text-espresso-900">
                                  {c.name}
                                </span>
                                {c.badge && (
                                  <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-700 border border-emerald-200">
                                    {c.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-espresso-500 leading-tight mt-0.5">
                                {c.desc}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Kategori 2: Virtual Account (Transfer Otomatis) */}
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-espresso-700 block mb-2">
                      {isEn ? "2. Virtual Account (Auto Verification)" : "2. Virtual Account (Verifikasi Otomatis)"}
                    </span>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {MIDTRANS_CHANNEL_LIST.filter((c) => c.category === "va").map((c) => {
                        const isChecked = selectedChannels.includes(c.id);
                        return (
                          <label
                            key={c.id}
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                              isChecked
                                ? "border-caramel-500 bg-caramel-50/25 ring-1 ring-caramel-400"
                                : "border-espresso-100 hover:border-espresso-200 bg-white"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleChannel(c.id)}
                              className="mt-0.5 rounded border-espresso-300 text-caramel-600 focus:ring-caramel-500 h-4 w-4"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="font-semibold text-xs text-espresso-900">
                                  {c.name}
                                </span>
                                {c.badge && (
                                  <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-700 border border-emerald-200">
                                    {c.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-espresso-500 leading-tight mt-0.5">
                                {c.desc}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Kategori 3: Kartu Kredit & Retail */}
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-espresso-700 block mb-2">
                      {isEn ? "3. Credit Card & Retail Outlets" : "3. Kartu Kredit & Gerai Retail"}
                    </span>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {MIDTRANS_CHANNEL_LIST.filter(
                        (c) => c.category === "card" || c.category === "cstore"
                      ).map((c) => {
                        const isChecked = selectedChannels.includes(c.id);
                        return (
                          <label
                            key={c.id}
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                              isChecked
                                ? "border-caramel-500 bg-caramel-50/25 ring-1 ring-caramel-400"
                                : "border-espresso-100 hover:border-espresso-200 bg-white"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleChannel(c.id)}
                              className="mt-0.5 rounded border-espresso-300 text-caramel-600 focus:ring-caramel-500 h-4 w-4"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="font-semibold text-xs text-espresso-900">
                                  {c.name}
                                </span>
                                {c.badge && (
                                  <span className="rounded bg-caramel-50 px-1.5 py-0.2 text-[9px] font-semibold text-caramel-700 border border-caramel-200">
                                    {c.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-espresso-500 leading-tight mt-0.5">
                                {c.desc}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Gateway Stripe (Global Credit Cards) */}
              <div className="rounded-lg border border-latte p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-espresso-900">{isEn ? "Stripe Payment Gateway" : "Payment Gateway Stripe"}</h3>
                    <p className="text-xs text-espresso-400">
                      {isEn ? "Accepts Global Credit Cards (Visa, Mastercard, Amex, Apple Pay, Google Pay)" : "Menerima Kartu Kredit Internasional (Visa, Mastercard, Amex, Apple Pay, Google Pay)"}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-espresso-800">
                    <input
                      type="checkbox"
                      name="stripeEnabled"
                      defaultChecked={initialSettings.payment.stripe?.enabled ?? false}
                      className="rounded border-espresso-300 text-caramel-600 focus:ring-caramel-500 h-4 w-4"
                    />
                    {isEn ? "Active" : "Aktif"}
                  </label>
                </div>

                <div className="space-y-3">
                  <div className="max-w-xs">
                    <Field label={isEn ? "Transaction Mode" : "Mode Transaksi"}>
                      <select
                        name="stripeMode"
                        defaultValue={initialSettings.payment.stripe?.mode || "test"}
                        className="w-full rounded-lg border border-latte bg-white px-3 py-2 text-sm text-espresso-900 focus:border-caramel-500 focus:outline-none"
                      >
                        <option value="test">Test Mode (Sandbox)</option>
                        <option value="live">Live Mode (Production)</option>
                      </select>
                    </Field>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Stripe Publishable Key">
                      <Input
                        name="stripePublishableKey"
                        defaultValue={initialSettings.payment.stripe?.publishableKey || ""}
                        placeholder="pk_test_..."
                      />
                    </Field>
                    <Field label="Stripe Secret Key">
                      <Input
                        name="stripeSecretKey"
                        type="password"
                        defaultValue={initialSettings.payment.stripe?.secretKey || ""}
                        placeholder="sk_test_..."
                      />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Payment Gateway PayPal */}
              <div className="rounded-lg border border-latte p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-espresso-900">{isEn ? "PayPal Payment Gateway" : "Payment Gateway PayPal"}</h3>
                    <p className="text-xs text-espresso-400">
                      {isEn ? "Accepts PayPal balance & global debit/credit cards via PayPal Checkout" : "Menerima saldo PayPal & kartu debit/kredit global via PayPal Checkout"}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-espresso-800">
                    <input
                      type="checkbox"
                      name="paypalEnabled"
                      defaultChecked={initialSettings.payment.paypal?.enabled ?? false}
                      className="rounded border-espresso-300 text-caramel-600 focus:ring-caramel-500 h-4 w-4"
                    />
                    {isEn ? "Active" : "Aktif"}
                  </label>
                </div>

                <div className="space-y-3">
                  <div className="max-w-xs">
                    <Field label={isEn ? "Transaction Mode" : "Mode Transaksi"}>
                      <select
                        name="paypalMode"
                        defaultValue={initialSettings.payment.paypal?.mode || "sandbox"}
                        className="w-full rounded-lg border border-latte bg-white px-3 py-2 text-sm text-espresso-900 focus:border-caramel-500 focus:outline-none"
                      >
                        <option value="sandbox">Sandbox (Testing)</option>
                        <option value="live">Live (Production)</option>
                      </select>
                    </Field>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="PayPal Client ID">
                      <Input
                        name="paypalClientId"
                        defaultValue={initialSettings.payment.paypal?.clientId || ""}
                        placeholder={isEn ? "Client ID from developer.paypal.com" : "Client ID dari developer.paypal.com"}
                      />
                    </Field>
                    <Field label="PayPal Secret Key">
                      <Input
                        name="paypalClientSecret"
                        type="password"
                        defaultValue={initialSettings.payment.paypal?.clientSecret || ""}
                        placeholder={isEn ? "PayPal Secret Key" : "Secret Key PayPal"}
                      />
                    </Field>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-latte">
                <Button type="submit" disabled={paymentPending} className="justify-center">
                  {paymentPending ? (isEn ? "Saving..." : "Menyimpan...") : (isEn ? "Save Payment Methods" : "Simpan Metode Pembayaran")}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: SHIPPING */}
        {activeTab === "shipping" && (
          <div className="rounded-xl border border-latte bg-white p-6 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-espresso-900 border-b border-latte pb-3">
              {isEn ? "Couriers & Shipping Options" : "Kurir & Opsi Pengiriman"}
            </h2>
            {shippingState?.error && <Alert tone="error">{shippingState.error}</Alert>}
            {shippingState?.success && <Alert tone="success">{shippingState.success}</Alert>}

            <form action={shippingAction} className="space-y-6">
              <input type="hidden" name="methods" value={JSON.stringify(shippingMethods)} />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={isEn ? "Shipping Origin City" : "Kota Asal Pengiriman"}>
                  <Input
                    name="originCity"
                    defaultValue={initialSettings.shipping.originCity}
                    placeholder="Bandung"
                  />
                </Field>

                <div className="rounded-lg border border-latte p-4 bg-cream/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-espresso-800 block">
                        {isEn ? "Free Shipping Promotion" : "Promo Gratis Ongkir"}
                      </span>
                      <p className="text-[11px] text-espresso-400">
                        {isEn ? "Enable to offer free shipping with minimum order spend requirement" : "Aktifkan jika ingin memberikan gratis ongkir dengan syarat minimal belanja"}
                      </p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-espresso-800 shrink-0">
                      <input
                        type="checkbox"
                        name="freeShippingEnabled"
                        checked={freeShippingEnabled}
                        onChange={(e) => setFreeShippingEnabled(e.target.checked)}
                        className="rounded border-espresso-300 text-caramel-600 focus:ring-caramel-500 h-4 w-4"
                      />
                      Aktif
                    </label>
                  </div>

                  {freeShippingEnabled && (
                    <Field label={isEn ? "Minimum Spend (IDR)" : "Minimal Belanja (IDR)"}>
                      <Input
                        name="freeShippingMin"
                        type="number"
                        min={1000}
                        defaultValue={initialSettings.shipping.freeShippingMin || 300000}
                        placeholder="300000"
                        required={freeShippingEnabled}
                      />
                    </Field>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-espresso-500 block">
                  {isEn ? "Available Couriers & Shipping Carriers List" : "Daftar Pilihan Jasa Ekspedisi / Kurir"}
                </label>

                {shippingMethods.map((m, i) => (
                  <div key={m.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-cream/40 p-3">
                    <div className="flex-1 min-w-36">
                      <Input
                        placeholder={isEn ? "Courier Name (JNE Regular)" : "Nama Kurir (JNE Reguler)"}
                        value={m.name}
                        onChange={(e) => updateShippingField(i, "name", e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="w-28">
                      <Input
                        placeholder={isEn ? "Fee (IDR)" : "Tarif (IDR)"}
                        type="number"
                        value={m.cost}
                        onChange={(e) => updateShippingField(i, "cost", Number(e.target.value))}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="w-28">
                      <Input
                        placeholder={isEn ? "Estimate (2-3 days)" : "Estimasi (2-3 hari)"}
                        value={m.etd}
                        onChange={(e) => updateShippingField(i, "etd", e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <label className="flex items-center gap-1.5 text-xs text-espresso-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={m.enabled}
                        onChange={(e) => updateShippingField(i, "enabled", e.target.checked)}
                        className="rounded border-espresso-300 text-caramel-600 focus:ring-caramel-500 h-3.5 w-3.5"
                      />
                      Aktif
                    </label>
                    <button
                      type="button"
                      onClick={() => removeShippingMethod(i)}
                      className="rounded p-1 text-rose-500 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addShippingMethod}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-caramel-600 hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" /> {isEn ? "Add Shipping Courier" : "Tambah Kurir Pengiriman"}
                </button>
              </div>

              <div className="rounded-lg border border-latte p-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-espresso-800">
                  <input
                    type="checkbox"
                    name="pickupEnabled"
                    defaultChecked={initialSettings.shipping.pickupEnabled}
                    className="rounded border-espresso-300 text-caramel-600 focus:ring-caramel-500 h-4 w-4"
                  />
                  {isEn ? "Allow In-Store Pickup (Pickup Store)" : "Izinkan Pengambilan Sendiri di Toko (Pickup Store)"}
                </label>
                <p className="mt-1 text-xs text-espresso-400">
                  {isEn ? "Customers can choose to pick up orders directly at physical store free of charge." : "Pelanggan dapat memilih opsi mengambil pesanan langsung di toko fisik tanpa biaya kirim."}
                </p>
              </div>

              {/* Integrasi API Cek Resi Otomatis (Binderbyte) */}
              <div className="rounded-lg border border-latte p-4 bg-latte/20 space-y-3">
                <div>
                  <h3 className="font-semibold text-espresso-900 text-sm">
                    {isEn ? "Automatic Waybill Tracking API Integration (Binderbyte)" : "Integrasi API Pelacak Resi Otomatis (Binderbyte)"}
                  </h3>
                  <p className="text-xs text-espresso-500">
                    {isEn ? "Automatically tracks courier checkpoints (JNE, J&T, SiCepat, Anteraja, POS, TIKI) via official servers." : "Otomatis melacak posisi kurir (JNE, J&T, SiCepat, Anteraja, POS, TIKI) ke server ekspedisi resmi."}
                  </p>
                </div>

                <Field label={isEn ? "Binderbyte API Key (Optional / Free Tier)" : "Binderbyte API Key (Opsional / Free Tier)"}>
                  <Input
                    name="binderbyteApiKey"
                    type="password"
                    defaultValue={initialSettings.shipping.binderbyteApiKey || ""}
                    placeholder={isEn ? "Enter API Key from binderbyte.com dashboard" : "Masukkan API Key dari dashboard binderbyte.com"}
                  />
                  <p className="mt-1 text-[11px] text-espresso-400">
                    {isEn ? (
                      <>Get free API Key at <strong>binderbyte.com</strong>. If left blank, automatic tracking uses intelligent fallback based on order data.</>
                    ) : (
                      <>Dapatkan API Key gratis di <strong>binderbyte.com</strong>. Jika dikosongkan, sistem pelacakan otomatis menggunakan mode fallback cerdas berbasis data pesanan.</>
                    )}
                  </p>
                </Field>
              </div>

              <div className="pt-4 border-t border-latte">
                <Button type="submit" disabled={shippingPending} className="justify-center">
                  {shippingPending ? (isEn ? "Saving..." : "Menyimpan...") : (isEn ? "Save Shipping Settings" : "Simpan Pengaturan Pengiriman")}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 5: MAIL SERVER (SMTP) */}
        {activeTab === "smtp" && (
          <div className="rounded-xl border border-latte bg-white p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-espresso-900 border-b border-latte pb-3">
                {isEn ? "Mail Server (SMTP) Settings" : "Pengaturan Mail Server (SMTP)"}
              </h2>
              <p className="mt-2 text-xs text-espresso-500 leading-relaxed">
                {isEn
                  ? "Configure custom email server (such as Gmail App Password, cPanel Webmail, Zoho Mail, Mailgun, or Brevo) so the Wazzopi website can send order receipts and login details freely without recipient restrictions."
                  : "Konfigurasikan server email pribadi (seperti Gmail App Password, cPanel Webmail, Zoho Mail, Mailgun, atau Brevo) agar website Wazzopi dapat mengirim email rincian pesanan dan akses login ke pembeli secara bebas tanpa batasan penerima."}
              </p>
            </div>

            {smtpState?.error && <Alert tone="error">{smtpState.error}</Alert>}
            {smtpState?.success && <Alert tone="success">{smtpState.success}</Alert>}

            <form action={smtpAction} className="space-y-5">
              {/* Checkbox Enable SMTP */}
              <div className="rounded-xl border border-latte bg-cream/40 p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="smtpEnabled"
                    checked={smtpEnabled}
                    onChange={(e) => setSmtpEnabled(e.target.checked)}
                    className="rounded border-espresso-300 text-caramel-600 focus:ring-caramel-500 h-4 w-4"
                  />
                  <div>
                    <span className="font-semibold text-sm text-espresso-900">
                      Enable SMTP
                    </span>
                    <p className="text-xs text-espresso-500 mt-0.5">
                      {isEn ? "Enable to send all store notification emails using your custom SMTP server. If disabled (default), the system falls back to Resend API." : "Aktifkan untuk mengirim seluruh email notifikasi toko menggunakan server SMTP kustom Anda. Jika dinonaktifkan (default), sistem akan menggunakan fallback Resend API."}
                    </p>
                  </div>
                </label>
              </div>

              {/* Form Input Detail SMTP */}
              <div
                className={`space-y-4 transition-opacity duration-200 ${
                  smtpEnabled ? "opacity-100" : "opacity-60 pointer-events-none"
                }`}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="SMTP Host / Server Address *">
                    <Input
                      name="smtpHost"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      placeholder={isEn ? "E.g.: smtp.gmail.com or mail.yourdomain.com" : "Contoh: smtp.gmail.com atau mail.domainanda.com"}
                      required={smtpEnabled}
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Encryption Type *">
                      <Select
                        name="smtpEncryption"
                        value={smtpEncryption}
                        onChange={(e) =>
                          handleEncryptionChange(e.target.value as "tls" | "ssl" | "none")
                        }
                      >
                        <option value="tls">TLS (Port 587)</option>
                        <option value="ssl">SSL (Port 465)</option>
                        <option value="none">None (Port 25)</option>
                      </Select>
                    </Field>

                    <Field label="SMTP Port *">
                      <Input
                        name="smtpPort"
                        type="number"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(Number(e.target.value))}
                        placeholder="587"
                        required={smtpEnabled}
                      />
                    </Field>
                  </div>
                </div>

                {/* Authentication Section */}
                <div className="rounded-xl border border-latte bg-white p-4 space-y-4">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      name="smtpAuthRequired"
                      checked={smtpAuthRequired}
                      onChange={(e) => setSmtpAuthRequired(e.target.checked)}
                      className="rounded border-espresso-300 text-caramel-600 focus:ring-caramel-500 h-4 w-4"
                    />
                    <span className="text-sm font-semibold text-espresso-900">
                      SMTP Authentication Required
                    </span>
                  </label>

                  {smtpAuthRequired && (
                    <div className="grid gap-4 sm:grid-cols-2 pt-1 border-t border-latte/60">
                      <Field label="SMTP Username / Email *">
                        <Input
                          name="smtpUsername"
                          value={smtpUsername}
                          onChange={(e) => setSmtpUsername(e.target.value)}
                          placeholder={isEn ? "admin@yourdomain.com or account@gmail.com" : "admin@domainanda.com atau akun@gmail.com"}
                          required={smtpEnabled && smtpAuthRequired}
                        />
                      </Field>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-espresso-800">
                          SMTP Password *
                        </label>
                        <div className="relative">
                          <Input
                            name="smtpPassword"
                            type={showSmtpPassword ? "text" : "password"}
                            value={smtpPassword}
                            onChange={(e) => setSmtpPassword(e.target.value)}
                            placeholder={isEn ? "Password or App Password" : "Password atau App Password"}
                            required={smtpEnabled && smtpAuthRequired}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-espresso-400 hover:text-espresso-700 transition"
                            title={showSmtpPassword ? "Sembunyikan password" : "Tampilkan password"}
                          >
                            {showSmtpPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <p className="mt-1 text-[11px] text-espresso-400">
                          {isEn ? (
                            <>Use <strong>App Password</strong> if using Google Workspace / Gmail accounts.</>
                          ) : (
                            <>Gunakan <strong>App Password</strong> jika menggunakan akun Google Workspace / Gmail.</>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sender Details */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="From Email Address *">
                    <Input
                      name="smtpFromEmail"
                      value={smtpFromEmail}
                      onChange={(e) => setSmtpFromEmail(e.target.value)}
                      placeholder={isEn ? "E.g.: hello@wazzopi.com" : "Contoh: halo@wazzopi.com"}
                      required={smtpEnabled}
                    />
                  </Field>

                  <Field label="From Name *">
                    <Input
                      name="smtpFromName"
                      value={smtpFromName}
                      onChange={(e) => setSmtpFromName(e.target.value)}
                      placeholder="Wazzopi Coffee"
                      required={smtpEnabled}
                    />
                  </Field>
                </div>
              </div>

              <div className="pt-4 border-t border-latte">
                <Button type="submit" disabled={smtpPending} className="justify-center">
                  {smtpPending ? (isEn ? "Saving..." : "Menyimpan...") : (isEn ? "Save SMTP Settings" : "Simpan Pengaturan SMTP")}
                </Button>
              </div>
            </form>

            {/* SECTION: SEND TEST EMAIL & VERIFY CONNECTION */}
            <div className="rounded-xl border border-espresso-200 bg-cream/40 p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-latte pb-3">
                <Send className="h-4 w-4 text-caramel-600" />
                <h3 className="font-bold text-espresso-900 text-sm">
                  Send Test Email & Verify Connection
                </h3>
              </div>
              <p className="text-xs text-espresso-500 leading-relaxed">
                {isEn ? "Test whether your SMTP server connection and authentication credentials are correct by sending a test email to your address." : "Uji apakah koneksi server SMTP dan kredensial autentikasi Anda sudah benar dengan mengirimkan satu email uji coba ke alamat Anda."}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full">
                  <Input
                    type="email"
                    value={testEmailTarget}
                    onChange={(e) => setTestEmailTarget(e.target.value)}
                    placeholder={isEn ? "Enter recipient test email (e.g.: name@gmail.com)" : "Masukkan alamat email penerima uji coba (misal: nama@gmail.com)"}
                    className="h-10 text-xs"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleTestSmtp}
                  disabled={testingSmtp}
                  variant="secondary"
                  className="w-full sm:w-auto h-10 px-4 text-xs font-semibold whitespace-nowrap"
                >
                  {testingSmtp ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-caramel-600 mr-1.5" />
                      <span>{isEn ? "Testing Connection..." : "Sedang Menguji Koneksi..."}</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5 text-caramel-600 mr-1.5" />
                      <span>{isEn ? "Send Test Email & Verify Connection" : "Kirim Email Tes & Verifikasi Koneksi"}</span>
                    </>
                  )}
                </Button>
              </div>

              {testSmtpResult && (
                <div
                  className={`flex items-start gap-2.5 rounded-lg p-3 text-xs leading-relaxed border ${
                    testSmtpResult.success
                      ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                      : "bg-rose-50 text-rose-900 border-rose-200"
                  }`}
                >
                  {testSmtpResult.success ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                  )}
                  <div>
                    <strong className="block font-semibold">
                      {testSmtpResult.success ? (isEn ? "Verification Succeeded:" : "Verifikasi Berhasil:") : (isEn ? "Verification Failed:" : "Verifikasi Gagal:")}
                    </strong>
                    <span className="break-all">{testSmtpResult.message}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: OTHER */}
        {activeTab === "other" && (
          <div className="rounded-xl border border-latte bg-white p-6 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-espresso-900 border-b border-latte pb-3">
              {isEn ? "Other, Tax, & SEO Settings" : "Lainnya, Pajak, & SEO"}
            </h2>
            {otherState?.error && <Alert tone="error">{otherState.error}</Alert>}
            {otherState?.success && <Alert tone="success">{otherState.success}</Alert>}

            <form action={otherAction} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={isEn ? "SEO Meta Title" : "Meta Title SEO"}>
                  <Input name="metaTitle" defaultValue={initialSettings.other.metaTitle} />
                </Field>
                <Field label={isEn ? "Order Number Prefix" : "Prefix Nomor Pesanan"}>
                  <Input name="orderPrefix" defaultValue={initialSettings.other.orderPrefix} placeholder="WZ" />
                </Field>
                <Field label={isEn ? "SEO Meta Description" : "Meta Description SEO"} className="sm:col-span-2">
                  <Textarea name="metaDescription" defaultValue={initialSettings.other.metaDescription} rows={2} />
                </Field>
                <Field label={isEn ? "Instagram Profile URL" : "URL Akun Instagram"}>
                  <Input name="instagram" defaultValue={initialSettings.other.instagram} />
                </Field>
                <Field label={isEn ? "CS WhatsApp Number (WA Phone)" : "Nomor WhatsApp CS (WA Phone)"} hint={isEn ? "Active WhatsApp number for 'Chat on WhatsApp' button" : "Nomor WhatsApp aktif untuk tombol 'Chat dengan WA'"}>
                  <Input
                    name="whatsapp"
                    defaultValue={initialSettings.other.whatsapp || initialSettings.general.whatsapp || "6282353538212"}
                    placeholder="6282353538212"
                  />
                </Field>
                <Field label={isEn ? "Tax / VAT Percentage (%)" : "Persentase Pajak / PPN (%)"}>
                  <Input
                    name="taxPercent"
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={initialSettings.other.taxPercent}
                    placeholder="0"
                  />
                </Field>
                <Field label={isEn ? "Low Stock Alert Threshold" : "Batas Notifikasi Stok Menipis (Threshold)"}>
                  <Input
                    name="lowStockThreshold"
                    type="number"
                    defaultValue={initialSettings.other.lowStockThreshold}
                    placeholder="10"
                  />
                </Field>
              </div>

              <div className="pt-4 border-t border-latte">
                <Button type="submit" disabled={otherPending} className="justify-center">
                  {otherPending ? (isEn ? "Saving..." : "Menyimpan...") : (isEn ? "Save Other Settings" : "Simpan Pengaturan Lainnya")}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
