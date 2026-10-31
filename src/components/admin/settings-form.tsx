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
  LayoutDashboard,
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
import { CurrencyCombobox } from "@/components/admin/currency-combobox";
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
  const [paymentSubTab, setPaymentSubTab] = useState<
    "overview" | "bank" | "cod" | "midtrans" | "stripe" | "paypal"
  >("overview");

  // Controlled payment enabled states for visual feedback & sub-tab badges
  const [bankEnabled, setBankEnabled] = useState(initialSettings.payment.bankTransfer.enabled);
  const [codEnabled, setCodEnabled] = useState(initialSettings.payment.cod.enabled);
  const [midtransEnabled, setMidtransEnabled] = useState(initialSettings.payment.midtrans.enabled);
  const [stripeEnabled, setStripeEnabled] = useState(initialSettings.payment.stripe?.enabled ?? false);
  const [paypalEnabled, setPaypalEnabled] = useState(initialSettings.payment.paypal?.enabled ?? false);

  // Secret keys visibility toggles
  const [showMidtransSecret, setShowMidtransSecret] = useState(false);
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [showPaypalSecret, setShowPaypalSecret] = useState(false);
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
                <Field
                  label={isEn ? "Currency Selection" : "Pilihan Mata Uang"}
                  hint={isEn ? "Search and select from 110+ WooCommerce world currencies" : "Cari dan pilih dari 110+ mata uang dunia standar WooCommerce"}
                >
                  <CurrencyCombobox
                    value={currencyConfig.code}
                    onChange={(sel) => {
                      setCurrencyConfig((prev) => ({
                        ...prev,
                        code: sel.code,
                        symbol: sel.symbol,
                        decimals: sel.defaultDecimals !== undefined ? sel.defaultDecimals : prev.decimals,
                      }));
                    }}
                  />
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-latte pb-4">
              <div>
                <h2 className="text-base font-bold text-espresso-900">
                  {isEn ? "Payment Methods Configuration" : "Pengaturan Metode Pembayaran"}
                </h2>
                <p className="text-xs text-espresso-500 mt-0.5">
                  {isEn
                    ? "Manage your payment gateways, bank transfers, and cash on delivery cleanly organized per method."
                    : "Kelola gateway pembayaran, transfer bank, dan bayar di tempat secara terorganisir dan tidak menumpuk."}
                </p>
              </div>

              {/* Sub-tab pills */}
              <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-latte bg-cream/40 p-1 scrollbar-none">
                {[
                  {
                    id: "overview",
                    label: isEn ? "Overview" : "Semua Metode",
                    icon: LayoutDashboard,
                  },
                  {
                    id: "bank",
                    label: isEn ? "Bank Transfer" : "Transfer Bank",
                    icon: Landmark,
                    enabled: bankEnabled,
                  },
                  {
                    id: "cod",
                    label: "COD",
                    icon: Banknote,
                    enabled: codEnabled,
                  },
                  {
                    id: "midtrans",
                    label: "Midtrans (Snap)",
                    icon: QrCode,
                    enabled: midtransEnabled,
                  },
                  {
                    id: "stripe",
                    label: "Stripe",
                    icon: CreditCard,
                    enabled: stripeEnabled,
                  },
                  {
                    id: "paypal",
                    label: "PayPal",
                    icon: Wallet,
                    enabled: paypalEnabled,
                  },
                ].map((s) => {
                  const SIcon = s.icon;
                  const active = paymentSubTab === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setPaymentSubTab(s.id as typeof paymentSubTab)}
                      className={cn(
                        "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer",
                        active
                          ? "bg-espresso-900 text-white shadow-xs"
                          : "text-espresso-700 hover:bg-latte/60"
                      )}
                    >
                      <SIcon className={cn("h-3.5 w-3.5", active ? "text-caramel-300" : "text-caramel-600")} />
                      <span>{s.label}</span>
                      {s.enabled !== undefined && (
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            s.enabled
                              ? "bg-emerald-500 ring-2 ring-emerald-200"
                              : "bg-espresso-300"
                          )}
                          title={s.enabled ? (isEn ? "Active" : "Aktif") : (isEn ? "Inactive" : "Nonaktif")}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {paymentState?.error && <Alert tone="error">{paymentState.error}</Alert>}
            {paymentState?.success && <Alert tone="success">{paymentState.success}</Alert>}

            <form action={paymentAction} className="space-y-6">
              {/* SUB-SECTION 0: OVERVIEW (RINGKASAN METODE PEMBAYARAN) */}
              <div
                className={cn(
                  "space-y-4",
                  paymentSubTab === "overview" ? "block animate-in fade-in-50 duration-200" : "hidden"
                )}
              >
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h3 className="text-sm font-bold text-espresso-900">
                      {isEn ? "Payment Methods Directory" : "Daftar Metode Pembayaran"}
                    </h3>
                    <p className="text-[11px] text-espresso-500">
                      {isEn
                        ? "Activate and click 'Configure' to manage individual account numbers, API credentials, or checkout channels."
                        : "Aktifkan dan klik 'Konfigurasi' untuk mengelola detail rekening, kunci API, atau saluran checkout."}
                    </p>
                  </div>
                  <span className="rounded-full bg-caramel-50 px-2.5 py-0.5 text-xs font-semibold text-caramel-800 border border-caramel-200">
                    {[bankEnabled, codEnabled, midtransEnabled, stripeEnabled, paypalEnabled].filter(Boolean).length} / 5 {isEn ? "Active" : "Aktif"}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Card 1: Bank Transfer */}
                  <div
                    className={cn(
                      "flex flex-col justify-between rounded-xl border p-4 transition shadow-2xs",
                      bankEnabled
                        ? "border-caramel-300 bg-caramel-50/20 ring-1 ring-caramel-200"
                        : "border-latte bg-white"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-caramel-100 text-caramel-800">
                            <Landmark className="h-4 w-4" />
                          </div>
                          <span className="font-bold text-xs text-espresso-900">
                            {isEn ? "Bank Transfer" : "Transfer Bank"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBankEnabled(!bankEnabled)}
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold border transition cursor-pointer",
                            bankEnabled
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-espresso-100 text-espresso-500 border-espresso-200"
                          )}
                        >
                          {bankEnabled ? (isEn ? "Active" : "Aktif") : (isEn ? "Inactive" : "Nonaktif")}
                        </button>
                      </div>
                      <p className="text-[11px] text-espresso-500 mt-2 line-clamp-2">
                        {isEn
                          ? "Manual transfer to store bank accounts with customer transfer proof verification."
                          : "Pembayaran transfer manual ke rekening toko dengan instruksi verifikasi bukti transfer."}
                      </p>
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-espresso-600">
                        <span className="font-semibold">{bankAccounts.length}</span>
                        <span>{isEn ? "registered account(s)" : "rekening terdaftar"}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-latte/70 flex items-center justify-between">
                      <span className="text-[10px] text-espresso-400 font-mono">BCA, Mandiri, BRI...</span>
                      <button
                        type="button"
                        onClick={() => setPaymentSubTab("bank")}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-caramel-700 hover:text-caramel-900 cursor-pointer"
                      >
                        <span>{isEn ? "Configure" : "Kelola Rekening"}</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Card 2: COD */}
                  <div
                    className={cn(
                      "flex flex-col justify-between rounded-xl border p-4 transition shadow-2xs",
                      codEnabled
                        ? "border-caramel-300 bg-caramel-50/20 ring-1 ring-caramel-200"
                        : "border-latte bg-white"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-caramel-100 text-caramel-800">
                            <Banknote className="h-4 w-4" />
                          </div>
                          <span className="font-bold text-xs text-espresso-900">
                            {isEn ? "Cash on Delivery" : "Bayar di Tempat (COD)"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCodEnabled(!codEnabled)}
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold border transition cursor-pointer",
                            codEnabled
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-espresso-100 text-espresso-500 border-espresso-200"
                          )}
                        >
                          {codEnabled ? (isEn ? "Active" : "Aktif") : (isEn ? "Inactive" : "Nonaktif")}
                        </button>
                      </div>
                      <p className="text-[11px] text-espresso-500 mt-2 line-clamp-2">
                        {isEn
                          ? "Customers pay cash directly to the courier upon product delivery."
                          : "Pelanggan membayar tunai langsung kepada kurir saat pesanan tiba di alamat."}
                      </p>
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-espresso-600">
                        <span>{isEn ? "Handling Fee:" : "Biaya Penanganan:"}</span>
                        <span className="font-semibold text-espresso-900">
                          {initialSettings.payment.cod.fee ? `Rp ${initialSettings.payment.cod.fee.toLocaleString("id-ID")}` : (isEn ? "Free" : "Gratis")}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-latte/70 flex items-center justify-between">
                      <span className="text-[10px] text-espresso-400 font-mono">Cash / Tunai</span>
                      <button
                        type="button"
                        onClick={() => setPaymentSubTab("cod")}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-caramel-700 hover:text-caramel-900 cursor-pointer"
                      >
                        <span>{isEn ? "Configure" : "Atur Biaya"}</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Card 3: Midtrans */}
                  <div
                    className={cn(
                      "flex flex-col justify-between rounded-xl border p-4 transition shadow-2xs",
                      midtransEnabled
                        ? "border-caramel-300 bg-caramel-50/20 ring-1 ring-caramel-200"
                        : "border-latte bg-white"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-caramel-100 text-caramel-800">
                            <QrCode className="h-4 w-4" />
                          </div>
                          <span className="font-bold text-xs text-espresso-900">
                            Midtrans (Snap)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMidtransEnabled(!midtransEnabled)}
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold border transition cursor-pointer",
                            midtransEnabled
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-espresso-100 text-espresso-500 border-espresso-200"
                          )}
                        >
                          {midtransEnabled ? (isEn ? "Active" : "Aktif") : (isEn ? "Inactive" : "Nonaktif")}
                        </button>
                      </div>
                      <p className="text-[11px] text-espresso-500 mt-2 line-clamp-2">
                        {isEn
                          ? "Accepts QRIS (GoPay/ShopeePay), Virtual Accounts, Credit Cards, & Retail outlets."
                          : "Otomatisasi pembayaran QRIS, Virtual Account bank, dan e-wallet secara instan."}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-[11px] text-espresso-600">
                        <span>{selectedChannels.length} {isEn ? "channels active" : "channel aktif"}</span>
                        <span className="rounded bg-cream px-1.5 py-0.5 text-[10px] font-mono text-espresso-700">
                          {initialSettings.payment.midtrans.mode === "production" ? "Production" : "Sandbox"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-latte/70 flex items-center justify-between">
                      <span className="text-[10px] text-espresso-400 font-mono">QRIS, VA, E-Wallet</span>
                      <button
                        type="button"
                        onClick={() => setPaymentSubTab("midtrans")}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-caramel-700 hover:text-caramel-900 cursor-pointer"
                      >
                        <span>{isEn ? "Configure" : "Konfigurasi"}</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Card 4: Stripe */}
                  <div
                    className={cn(
                      "flex flex-col justify-between rounded-xl border p-4 transition shadow-2xs",
                      stripeEnabled
                        ? "border-caramel-300 bg-caramel-50/20 ring-1 ring-caramel-200"
                        : "border-latte bg-white"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-caramel-100 text-caramel-800">
                            <CreditCard className="h-4 w-4" />
                          </div>
                          <span className="font-bold text-xs text-espresso-900">
                            Stripe Gateway
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStripeEnabled(!stripeEnabled)}
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold border transition cursor-pointer",
                            stripeEnabled
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-espresso-100 text-espresso-500 border-espresso-200"
                          )}
                        >
                          {stripeEnabled ? (isEn ? "Active" : "Aktif") : (isEn ? "Inactive" : "Nonaktif")}
                        </button>
                      </div>
                      <p className="text-[11px] text-espresso-500 mt-2 line-clamp-2">
                        {isEn
                          ? "Global Visa, Mastercard, Amex, Apple Pay, and Google Pay card processing."
                          : "Menerima kartu kredit internasional (Visa, Mastercard, Amex), Apple Pay & Google Pay."}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-[11px] text-espresso-600">
                        <span>{isEn ? "Global Cards" : "Kartu Global"}</span>
                        <span className="rounded bg-cream px-1.5 py-0.5 text-[10px] font-mono text-espresso-700">
                          {initialSettings.payment.stripe?.mode === "live" ? "Live" : "Test"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-latte/70 flex items-center justify-between">
                      <span className="text-[10px] text-espresso-400 font-mono">Visa, MC, Amex</span>
                      <button
                        type="button"
                        onClick={() => setPaymentSubTab("stripe")}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-caramel-700 hover:text-caramel-900 cursor-pointer"
                      >
                        <span>{isEn ? "Configure" : "Konfigurasi"}</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Card 5: PayPal */}
                  <div
                    className={cn(
                      "flex flex-col justify-between rounded-xl border p-4 transition shadow-2xs",
                      paypalEnabled
                        ? "border-caramel-300 bg-caramel-50/20 ring-1 ring-caramel-200"
                        : "border-latte bg-white"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-caramel-100 text-caramel-800">
                            <Wallet className="h-4 w-4" />
                          </div>
                          <span className="font-bold text-xs text-espresso-900">
                            PayPal Gateway
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPaypalEnabled(!paypalEnabled)}
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold border transition cursor-pointer",
                            paypalEnabled
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-espresso-100 text-espresso-500 border-espresso-200"
                          )}
                        >
                          {paypalEnabled ? (isEn ? "Active" : "Aktif") : (isEn ? "Inactive" : "Nonaktif")}
                        </button>
                      </div>
                      <p className="text-[11px] text-espresso-500 mt-2 line-clamp-2">
                        {isEn
                          ? "Accepts PayPal account balance and international debit/credit cards."
                          : "Menerima saldo dompet PayPal dan pembayaran kartu debit/kredit internasional."}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-[11px] text-espresso-600">
                        <span>{isEn ? "PayPal Checkout" : "PayPal Checkout"}</span>
                        <span className="rounded bg-cream px-1.5 py-0.5 text-[10px] font-mono text-espresso-700">
                          {initialSettings.payment.paypal?.mode === "live" ? "Live" : "Sandbox"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-latte/70 flex items-center justify-between">
                      <span className="text-[10px] text-espresso-400 font-mono">PayPal, Wallet</span>
                      <button
                        type="button"
                        onClick={() => setPaymentSubTab("paypal")}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-caramel-700 hover:text-caramel-900 cursor-pointer"
                      >
                        <span>{isEn ? "Configure" : "Konfigurasi"}</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SUB-SECTION 1: BANK TRANSFER */}
              <div
                className={cn(
                  "space-y-4 rounded-xl border border-latte/80 bg-latte/10 p-5",
                  paymentSubTab === "bank" ? "block animate-in fade-in-50 duration-200" : "hidden"
                )}
              >
                <div className="flex items-center justify-between pb-3 border-b border-latte/60">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-caramel-100 text-caramel-800">
                      <Landmark className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-espresso-900">
                        {isEn ? "Manual Bank Transfer" : "Transfer Bank Manual"}
                      </h3>
                      <p className="text-[11px] text-espresso-500">
                        {isEn ? "Direct payment instructions to your store bank accounts" : "Instruksi pembayaran langsung ke nomor rekening toko"}
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-espresso-800 bg-white px-3 py-1.5 rounded-lg border border-latte shadow-2xs">
                    <input
                      type="checkbox"
                      name="bankEnabled"
                      checked={bankEnabled}
                      onChange={(e) => setBankEnabled(e.target.checked)}
                      className="rounded border-espresso-300 text-caramel-600 focus:ring-caramel-500 h-4 w-4"
                    />
                    <span>{isEn ? "Enable Bank Transfer" : "Aktifkan Transfer Bank"}</span>
                  </label>
                </div>

                <input type="hidden" name="accounts" value={JSON.stringify(bankAccounts)} />

                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-espresso-800">
                      {isEn ? "Destination Bank Accounts" : "Daftar Rekening Tujuan"}
                    </span>
                    <span className="text-[11px] text-espresso-400">
                      {bankAccounts.length} {isEn ? "account(s)" : "rekening"}
                    </span>
                  </div>

                  {bankAccounts.map((b, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2.5 rounded-lg border border-latte bg-white p-3 shadow-2xs">
                      <div className="w-28">
                        <label className="text-[10px] font-semibold text-espresso-500 block mb-1">
                          {isEn ? "Bank Name" : "Nama Bank"}
                        </label>
                        <Input
                          placeholder="BCA / Mandiri"
                          value={b.bank}
                          onChange={(e) => updateBankField(i, "bank", e.target.value)}
                          className="h-8 text-xs font-semibold"
                        />
                      </div>
                      <div className="flex-1 min-w-36">
                        <label className="text-[10px] font-semibold text-espresso-500 block mb-1">
                          {isEn ? "Account Number" : "Nomor Rekening"}
                        </label>
                        <Input
                          placeholder="1234567890"
                          value={b.number}
                          onChange={(e) => updateBankField(i, "number", e.target.value)}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                      <div className="flex-1 min-w-36">
                        <label className="text-[10px] font-semibold text-espresso-500 block mb-1">
                          {isEn ? "Account Holder Name" : "Atas Nama (Pemilik)"}
                        </label>
                        <Input
                          placeholder="PT Wazzopi Kopi"
                          value={b.holder}
                          onChange={(e) => updateBankField(i, "holder", e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="pt-4">
                        <button
                          type="button"
                          onClick={() => removeBankAccount(i)}
                          className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 transition"
                          title={isEn ? "Remove account" : "Hapus rekening"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addBankAccount}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-caramel-300 bg-caramel-50/40 px-3 py-2 text-xs font-semibold text-caramel-700 hover:bg-caramel-100 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{isEn ? "Add Bank Account" : "Tambah Rekening Baru"}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-latte/60">
                  <button
                    type="button"
                    onClick={() => setPaymentSubTab("overview")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-espresso-600 hover:text-espresso-900 cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>{isEn ? "Back to Overview" : "Kembali ke Ringkasan"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentSubTab("cod")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-caramel-700 hover:text-caramel-900 cursor-pointer"
                  >
                    <span>{isEn ? "Next: Cash on Delivery (COD)" : "Lanjut: Bayar di Tempat (COD)"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* SUB-SECTION 2: CASH ON DELIVERY (COD) */}
              <div
                className={cn(
                  "space-y-4 rounded-xl border border-latte/80 bg-latte/10 p-5",
                  paymentSubTab === "cod" ? "block animate-in fade-in-50 duration-200" : "hidden"
                )}
              >
                <div className="flex items-center justify-between pb-3 border-b border-latte/60">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-caramel-100 text-caramel-800">
                      <Banknote className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-espresso-900">
                        {isEn ? "Cash on Delivery (COD)" : "Bayar di Tempat (COD)"}
                      </h3>
                      <p className="text-[11px] text-espresso-500">
                        {isEn ? "Customer pays cash upon delivery by the courier" : "Pelanggan membayar tunai saat kurir tiba mengantarkan paket"}
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-espresso-800 bg-white px-3 py-1.5 rounded-lg border border-latte shadow-2xs">
                    <input
                      type="checkbox"
                      name="codEnabled"
                      checked={codEnabled}
                      onChange={(e) => setCodEnabled(e.target.checked)}
                      className="rounded border-espresso-300 text-caramel-600 focus:ring-caramel-500 h-4 w-4"
                    />
                    <span>{isEn ? "Enable COD" : "Aktifkan COD"}</span>
                  </label>
                </div>

                <div className="max-w-md pt-2">
                  <Field
                    label={isEn ? "COD Handling Fee (IDR)" : "Biaya Penanganan COD (Rp)"}
                    hint={isEn ? "Additional fee charged to customer when choosing COD (0 for free)" : "Biaya tambahan yang dikenakan jika memilih COD (isi 0 jika gratis)"}
                  >
                    <Input
                      name="codFee"
                      type="number"
                      defaultValue={initialSettings.payment.cod.fee}
                      placeholder="5000"
                    />
                  </Field>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-latte/60">
                  <button
                    type="button"
                    onClick={() => setPaymentSubTab("overview")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-espresso-600 hover:text-espresso-900 cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>{isEn ? "Back to Overview" : "Kembali ke Ringkasan"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentSubTab("midtrans")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-caramel-700 hover:text-caramel-900 cursor-pointer"
                  >
                    <span>{isEn ? "Next: Midtrans Gateway" : "Lanjut: Midtrans Gateway"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* SUB-SECTION 3: MIDTRANS PAYMENT GATEWAY */}
              <div
                className={cn(
                  "space-y-5 rounded-xl border border-latte/80 bg-latte/10 p-5",
                  paymentSubTab === "midtrans" ? "block animate-in fade-in-50 duration-200" : "hidden"
                )}
              >
                <div className="flex items-center justify-between pb-3 border-b border-latte/60">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-caramel-100 text-caramel-800">
                      <QrCode className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-espresso-900">
                        {isEn ? "Midtrans Payment Gateway (Snap)" : "Payment Gateway Midtrans (Snap)"}
                      </h3>
                      <p className="text-[11px] text-espresso-500">
                        {isEn
                          ? "Accepts QRIS, GoPay, OVO, ShopeePay, Virtual Accounts, & Credit Cards"
                          : "Menerima QRIS, GoPay, OVO, ShopeePay, Virtual Account, & Kartu Kredit"}
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-espresso-800 bg-white px-3 py-1.5 rounded-lg border border-latte shadow-2xs">
                    <input
                      type="checkbox"
                      name="midtransEnabled"
                      checked={midtransEnabled}
                      onChange={(e) => setMidtransEnabled(e.target.checked)}
                      className="rounded border-espresso-300 text-caramel-600 focus:ring-caramel-500 h-4 w-4"
                    />
                    <span>{isEn ? "Enable Midtrans" : "Aktifkan Midtrans"}</span>
                  </label>
                </div>

                {/* API Credentials */}
                <div className="rounded-xl border border-latte bg-white p-4 space-y-4 shadow-2xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-espresso-800 block border-b border-latte pb-2">
                    {isEn ? "API Credentials & Environment" : "Kredensial API & Mode Lingkungan"}
                  </span>
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <Field label={isEn ? "Environment Mode" : "Mode Lingkungan"}>
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
                      <div className="relative">
                        <Input
                          name="serverKey"
                          type={showMidtransSecret ? "text" : "password"}
                          defaultValue={initialSettings.payment.midtrans.serverKey}
                          placeholder="SB-Mid-server-..."
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowMidtransSecret(!showMidtransSecret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-espresso-400 hover:text-espresso-700"
                        >
                          {showMidtransSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </Field>
                  </div>
                </div>

                {/* Centang Channel Midtrans yang Aktif */}
                <div className="rounded-xl border border-latte bg-white p-4 space-y-4 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-latte pb-3">
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

                <div className="flex items-center justify-between pt-3 border-t border-latte/60">
                  <button
                    type="button"
                    onClick={() => setPaymentSubTab("overview")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-espresso-600 hover:text-espresso-900 cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>{isEn ? "Back to Overview" : "Kembali ke Ringkasan"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentSubTab("stripe")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-caramel-700 hover:text-caramel-900 cursor-pointer"
                  >
                    <span>{isEn ? "Next: Stripe Gateway" : "Lanjut: Stripe Gateway"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* SUB-SECTION 4: STRIPE PAYMENT GATEWAY */}
              <div
                className={cn(
                  "space-y-4 rounded-xl border border-latte/80 bg-latte/10 p-5",
                  paymentSubTab === "stripe" ? "block animate-in fade-in-50 duration-200" : "hidden"
                )}
              >
                <div className="flex items-center justify-between pb-3 border-b border-latte/60">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-caramel-100 text-caramel-800">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-espresso-900">
                        {isEn ? "Stripe Payment Gateway" : "Payment Gateway Stripe"}
                      </h3>
                      <p className="text-[11px] text-espresso-500">
                        {isEn
                          ? "Accepts Global Credit Cards (Visa, Mastercard, Amex, Apple Pay, Google Pay)"
                          : "Menerima Kartu Kredit Internasional (Visa, Mastercard, Amex, Apple Pay, Google Pay)"}
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-espresso-800 bg-white px-3 py-1.5 rounded-lg border border-latte shadow-2xs">
                    <input
                      type="checkbox"
                      name="stripeEnabled"
                      checked={stripeEnabled}
                      onChange={(e) => setStripeEnabled(e.target.checked)}
                      className="rounded border-espresso-300 text-caramel-600 focus:ring-caramel-500 h-4 w-4"
                    />
                    <span>{isEn ? "Enable Stripe" : "Aktifkan Stripe"}</span>
                  </label>
                </div>

                <div className="rounded-xl border border-latte bg-white p-4 space-y-4 shadow-2xs">
                  <div className="max-w-xs">
                    <Field label={isEn ? "Transaction Mode" : "Mode Transaksi"}>
                      <select
                        name="stripeMode"
                        defaultValue={initialSettings.payment.stripe?.mode || "test"}
                        className="w-full rounded-lg border border-espresso-200 bg-white px-3 py-2 text-sm text-espresso-900 focus:border-caramel-500 focus:outline-none"
                      >
                        <option value="test">Test Mode (Sandbox)</option>
                        <option value="live">Live Mode (Production)</option>
                      </select>
                    </Field>
                  </div>
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <Field label="Stripe Publishable Key">
                      <Input
                        name="stripePublishableKey"
                        defaultValue={initialSettings.payment.stripe?.publishableKey || ""}
                        placeholder="pk_test_..."
                      />
                    </Field>
                    <Field label="Stripe Secret Key">
                      <div className="relative">
                        <Input
                          name="stripeSecretKey"
                          type={showStripeSecret ? "text" : "password"}
                          defaultValue={initialSettings.payment.stripe?.secretKey || ""}
                          placeholder="sk_test_..."
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowStripeSecret(!showStripeSecret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-espresso-400 hover:text-espresso-700"
                        >
                          {showStripeSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </Field>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-latte/60">
                  <button
                    type="button"
                    onClick={() => setPaymentSubTab("overview")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-espresso-600 hover:text-espresso-900 cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>{isEn ? "Back to Overview" : "Kembali ke Ringkasan"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentSubTab("paypal")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-caramel-700 hover:text-caramel-900 cursor-pointer"
                  >
                    <span>{isEn ? "Next: PayPal Gateway" : "Lanjut: PayPal Gateway"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* SUB-SECTION 5: PAYPAL PAYMENT GATEWAY */}
              <div
                className={cn(
                  "space-y-4 rounded-xl border border-latte/80 bg-latte/10 p-5",
                  paymentSubTab === "paypal" ? "block animate-in fade-in-50 duration-200" : "hidden"
                )}
              >
                <div className="flex items-center justify-between pb-3 border-b border-latte/60">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-caramel-100 text-caramel-800">
                      <Wallet className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-espresso-900">
                        {isEn ? "PayPal Payment Gateway" : "Payment Gateway PayPal"}
                      </h3>
                      <p className="text-[11px] text-espresso-500">
                        {isEn
                          ? "Accepts PayPal balance & global debit/credit cards via PayPal Checkout"
                          : "Menerima saldo dompet PayPal & kartu debit/kredit global via PayPal Checkout"}
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-espresso-800 bg-white px-3 py-1.5 rounded-lg border border-latte shadow-2xs">
                    <input
                      type="checkbox"
                      name="paypalEnabled"
                      checked={paypalEnabled}
                      onChange={(e) => setPaypalEnabled(e.target.checked)}
                      className="rounded border-espresso-300 text-caramel-600 focus:ring-caramel-500 h-4 w-4"
                    />
                    <span>{isEn ? "Enable PayPal" : "Aktifkan PayPal"}</span>
                  </label>
                </div>

                <div className="rounded-xl border border-latte bg-white p-4 space-y-4 shadow-2xs">
                  <div className="max-w-xs">
                    <Field label={isEn ? "Transaction Mode" : "Mode Transaksi"}>
                      <select
                        name="paypalMode"
                        defaultValue={initialSettings.payment.paypal?.mode || "sandbox"}
                        className="w-full rounded-lg border border-espresso-200 bg-white px-3 py-2 text-sm text-espresso-900 focus:border-caramel-500 focus:outline-none"
                      >
                        <option value="sandbox">Sandbox (Testing)</option>
                        <option value="live">Live (Production)</option>
                      </select>
                    </Field>
                  </div>
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <Field label="PayPal Client ID">
                      <Input
                        name="paypalClientId"
                        defaultValue={initialSettings.payment.paypal?.clientId || ""}
                        placeholder={isEn ? "Client ID from developer.paypal.com" : "Client ID dari developer.paypal.com"}
                      />
                    </Field>
                    <Field label="PayPal Secret Key">
                      <div className="relative">
                        <Input
                          name="paypalClientSecret"
                          type={showPaypalSecret ? "text" : "password"}
                          defaultValue={initialSettings.payment.paypal?.clientSecret || ""}
                          placeholder={isEn ? "PayPal Secret Key" : "Secret Key PayPal"}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPaypalSecret(!showPaypalSecret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-espresso-400 hover:text-espresso-700"
                        >
                          {showPaypalSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </Field>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-latte/60">
                  <button
                    type="button"
                    onClick={() => setPaymentSubTab("overview")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-espresso-600 hover:text-espresso-900 cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>{isEn ? "Back to Overview" : "Kembali ke Ringkasan"}</span>
                  </button>
                </div>
              </div>

              {/* Action Bar (Always accessible) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-latte">
                <div className="text-xs text-espresso-500 font-medium">
                  {paymentSubTab === "overview" && (isEn ? "Overview: All payment methods at a glance" : "Tinjauan: Semua metode pembayaran")}
                  {paymentSubTab === "bank" && (isEn ? "Method 1 of 5: Manual Bank Transfer" : "Metode 1 dari 5: Transfer Bank Manual")}
                  {paymentSubTab === "cod" && (isEn ? "Method 2 of 5: Cash on Delivery (COD)" : "Metode 2 dari 5: Bayar di Tempat (COD)")}
                  {paymentSubTab === "midtrans" && (isEn ? "Method 3 of 5: Midtrans Gateway (Snap)" : "Metode 3 dari 5: Gateway Midtrans (Snap)")}
                  {paymentSubTab === "stripe" && (isEn ? "Method 4 of 5: Stripe Gateway (Credit Cards)" : "Metode 4 dari 5: Gateway Stripe (Kartu Global)")}
                  {paymentSubTab === "paypal" && (isEn ? "Method 5 of 5: PayPal Gateway" : "Metode 5 dari 5: Gateway PayPal")}
                </div>

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
