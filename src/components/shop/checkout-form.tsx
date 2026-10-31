"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CreditCard,
  Landmark,
  MapPin,
  MessageSquare,
  QrCode,
  Scale,
  ShieldCheck,
  Store,
  Truck,
  Wallet,
  Zap,
} from "lucide-react";
import { placeOrder } from "@/actions/orders";
import { useMoney, useHydrated } from "@/components/currency-provider";
import { useAppLoading } from "@/components/loading-provider";
import { Alert, Button, Field, Input, Textarea } from "@/components/ui";
import { CityProvinceSelector } from "@/components/shop/city-province-selector";
import { estimateCartWeight, calculateDynamicRates } from "@/lib/shipping-calculator";
import { getChannelById, DEFAULT_MIDTRANS_CHANNELS } from "@/lib/midtrans-channels";
import { cartSubtotal, useCart } from "@/store/cart";
import type { AllSettings } from "@/lib/settings-types";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/provider";

type CustomerInitial = {
  name?: string;
  email?: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
} | null;

export function CheckoutForm({
  settings,
  customer,
}: {
  settings: AllSettings;
  customer: CustomerInitial;
}) {
  const [state, formAction, isPending] = useActionState(placeOrder, undefined);
  const { showLoading, hideLoading } = useAppLoading();
  const { items, clear } = useCart();
  const hydrated = useHydrated();
  const money = useMoney();
  const { dict, locale } = useI18n();
  const isEn = locale === "en";

  useEffect(() => {
    if (isPending) {
      showLoading(isEn ? "Processing your order..." : "Sedang memproses pesanan Anda...");
    } else {
      hideLoading();
    }
  }, [isPending, showLoading, hideLoading, isEn]);

  const isLoggedIn = Boolean(customer?.email);
  const hasSavedAddress = Boolean(customer?.address && customer?.city && customer?.name);
  const [isEditingAddress, setIsEditingAddress] = useState(!hasSavedAddress);
  const [formData, setFormData] = useState({
    name: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
    city: customer?.city || "",
    province: customer?.province || "",
    postalCode: customer?.postalCode || "",
  });

  const [destination, setDestination] = useState({
    city: customer?.city || "",
    province: customer?.province || "",
  });

  const hasSelectedCity = Boolean(destination.city && destination.city.trim());

  const cartWeight = useMemo(() => estimateCartWeight(items), [items]);

  const dynamicShippings = useMemo(() => {
    return calculateDynamicRates(
      settings.shipping.methods,
      destination.city,
      destination.province,
      items
    );
  }, [settings.shipping.methods, destination.city, destination.province, items]);

  const enabledShippings = dynamicShippings.filter((m) => m.enabled);

  // Jika awalnya sudah ada data kota tersimpan (misal customer login), kurir pertama otomatis dipilih
  const [selectedShipping, setSelectedShipping] = useState<string>(
    hasSelectedCity ? (enabledShippings[0]?.id || "") : ""
  );

  // Handler saat pemilihan kota berubah di CityProvinceSelector
  const handleDestinationChange = (data: { city: string; province: string; postalCode?: string }) => {
    setDestination(data);
    setFormData((prev) => ({
      ...prev,
      city: data.city,
      province: data.province,
      postalCode: data.postalCode ?? prev.postalCode,
    }));
    if (data.city && data.city.trim()) {
      // Auto-select kurir pertama otomatis jika bukan pickup
      const rates = calculateDynamicRates(
        settings.shipping.methods,
        data.city,
        data.province,
        items
      );
      const firstEnabled = rates.find((m) => m.enabled);
      if (firstEnabled && selectedShipping !== "pickup") {
        setSelectedShipping(firstEnabled.id);
      }
    } else {
      // Jika kota dikosongkan
      if (selectedShipping !== "pickup") {
        setSelectedShipping("");
      }
    }
  };

  // Jika opsi kurir berubah dan kurir yang dipilih tidak tersedia (cth: GoSend di luar kota)
  useEffect(() => {
    if (hasSelectedCity && selectedShipping && selectedShipping !== "pickup") {
      const exists = enabledShippings.some((m) => m.id === selectedShipping);
      if (!exists && enabledShippings.length > 0) {
        setSelectedShipping(enabledShippings[0].id);
      }
    }
  }, [enabledShippings, selectedShipping, hasSelectedCity]);

  const paymentOptions = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      desc: string;
      badge?: string;
      iconType: "bank" | "cod" | "qris" | "va" | "ewallet" | "card" | "cstore";
    }> = [];

    // 1. Transfer Bank Manual
    if (settings.payment.bankTransfer.enabled) {
      list.push({
        id: "bank_transfer",
        name: isEn ? "Manual Bank Transfer" : "Transfer Bank Manual",
        desc: isEn
          ? "Direct bank transfer to store official bank accounts."
          : "BCA, Mandiri, dan rekening bank toko lainnya.",
        iconType: "bank",
      });
    }

    // 2. Bayar di Tempat (COD)
    if (settings.payment.cod.enabled) {
      list.push({
        id: "cod",
        name: isEn ? "Cash on Delivery (COD)" : "Bayar di Tempat (COD)",
        desc: isEn
          ? `Handling fee ${money(settings.payment.cod.fee)}. Pay cash upon courier delivery.`
          : `Biaya penanganan ${money(settings.payment.cod.fee)}. Bayar tunai saat kurir tiba.`,
        iconType: "cod",
      });
    }

    // 3. Channel Pembayaran Otomatis Midtrans
    if (settings.payment.midtrans.enabled) {
      const activeChannels =
        settings.payment.midtrans.channels && settings.payment.midtrans.channels.length > 0
          ? settings.payment.midtrans.channels
          : DEFAULT_MIDTRANS_CHANNELS;

      for (const chId of activeChannels) {
        const def = getChannelById(chId);
        if (def) {
          list.push({
            id: `midtrans_${def.id}`,
            name: def.name,
            desc: def.desc,
            iconType: def.category,
          });
        }
      }
    }

    // 4. Gateway Stripe (Kartu Kredit Internasional)
    if (settings.payment.stripe?.enabled) {
      list.push({
        id: "stripe",
        name: "Credit / Debit Card (Stripe)",
        desc: isEn
          ? "Visa, Mastercard, American Express, Apple Pay, Google Pay"
          : "Visa, Mastercard, American Express, Apple Pay, Google Pay",
        iconType: "card",
      });
    }

    // 5. Gateway PayPal
    if (settings.payment.paypal?.enabled) {
      list.push({
        id: "paypal",
        name: "PayPal Checkout",
        desc: isEn
          ? "Pay securely with PayPal balance or international debit/credit cards"
          : "Bayar aman dengan saldo akun PayPal atau kartu debit/kredit global",
        iconType: "ewallet",
      });
    }

    return list;
  }, [settings.payment, money, isEn]);

  const [selectedPayment, setSelectedPayment] = useState<string>(
    paymentOptions[0]?.id || ""
  );

  useEffect(() => {
    if (!selectedPayment && paymentOptions.length > 0) {
      setSelectedPayment(paymentOptions[0].id);
    }
  }, [paymentOptions, selectedPayment]);

  const subtotal = hydrated ? cartSubtotal(items) : 0;

  // Hitung ongkir
  let shippingCost = 0;
  if (selectedShipping === "pickup") {
    shippingCost = 0;
  } else if (hasSelectedCity && selectedShipping) {
    const method = enabledShippings.find((m) => m.id === selectedShipping);
    const isFree =
      settings.shipping.freeShippingEnabled &&
      subtotal >= settings.shipping.freeShippingMin;
    shippingCost = isFree ? 0 : method?.cost || 0;
  }

  // Biaya COD
  const codFee = selectedPayment === "cod" ? settings.payment.cod.fee : 0;
  // Pajak
  const tax = Math.round((subtotal * (settings.other.taxPercent || 0)) / 100);
  const total = subtotal + shippingCost + codFee + tax;

  if (!hydrated) {
    return <div className="py-12 text-center text-espresso-400">{isEn ? "Loading checkout form..." : "Memuat formulir checkout..."}</div>;
  }

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-espresso-600">{isEn ? "Your shopping cart is empty." : "Keranjang belanja Anda kosong."}</p>
        <Link href="/products" className="mt-4 inline-block font-semibold text-caramel-600 underline">
          {isEn ? "Continue Shopping" : "Kembali Berbelanja"}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction}>
      {/* Hidden input data items cart */}
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(
          items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          }))
        )}
      />

      <div className="grid gap-10 lg:grid-cols-12">
        {/* Kolom Kiri: Data Pengiriman & Pembayaran */}
        <div className="space-y-8 lg:col-span-7">
          {state?.error && (
            <Alert tone="error">
              {state.error}
            </Alert>
          )}

          {/* Section 1: Alamat Pengiriman */}
          {hasSavedAddress && !isEditingAddress ? (
            <div className="rounded-xl border border-latte bg-white p-5 md:p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-espresso-100 pb-3 mb-3.5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-caramel-600" />
                  <h2 className="text-sm md:text-base font-bold text-espresso-900">
                    {isEn ? "Shipping Address" : "Alamat Pengiriman"}
                  </h2>
                  <span className="rounded-md bg-caramel-50 px-2 py-0.5 text-[10px] font-semibold text-caramel-700 border border-caramel-200">
                    {isEn ? "Default" : "Utama"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(true)}
                  className="text-xs font-semibold text-caramel-700 hover:text-caramel-800 hover:underline transition-colors cursor-pointer"
                >
                  {isEn ? "Edit Address" : "Ubah Alamat"}
                </button>
              </div>

              {/* Keterangan Alamat Ala Shopee */}
              <div className="space-y-1.5 text-xs text-espresso-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sm text-espresso-900">{formData.name}</span>
                  <span className="text-espresso-300">|</span>
                  <span className="font-medium text-espresso-700">{formData.phone || "-"}</span>
                </div>
                <p className="leading-relaxed text-espresso-700 pt-0.5">
                  {formData.address}
                </p>
                <p className="font-semibold text-espresso-800">
                  {formData.city}, {formData.province} {formData.postalCode}
                </p>
                <p className="text-[11px] text-espresso-400 pt-0.5">
                  {isLoggedIn ? (isEn ? "Account Email:" : "Email akun:") : "Email:"} {customer?.email || formData.email}
                </p>
              </div>

              {/* Hidden Inputs untuk Pengiriman Data Form ke Server Action */}
              <input type="hidden" name="customerName" value={formData.name} />
              <input type="hidden" name="customerEmail" value={customer?.email || formData.email} />
              <input type="hidden" name="customerPhone" value={formData.phone} />
              <input type="hidden" name="address" value={formData.address} />
              <input type="hidden" name="city" value={formData.city} />
              <input type="hidden" name="province" value={formData.province} />
              <input type="hidden" name="postalCode" value={formData.postalCode} />
            </div>
          ) : (
            <div className="rounded-xl border border-latte bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-espresso-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-caramel-600" />
                  <h2 className="text-base font-bold text-espresso-900">
                    {hasSavedAddress
                      ? (isEn ? "Edit Shipping Address" : "Ubah Alamat Pengiriman")
                      : (isEn ? "1. Shipping Address" : "1. Alamat Pengiriman")}
                  </h2>
                </div>
                {hasSavedAddress && (
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(false)}
                    className="text-xs text-espresso-500 hover:text-espresso-800 transition-colors cursor-pointer"
                  >
                    {isEn ? "Cancel" : "Batal"}
                  </button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={isEn ? "Recipient Name" : "Nama Penerima"} className="sm:col-span-2">
                  <Input
                    name="customerName"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder={isEn ? "Full recipient name" : "Nama penerima paket"}
                  />
                </Field>

                {/* Kolom Email hanya untuk tamu yang belum login */}
                {!isLoggedIn ? (
                  <Field label={isEn ? "Email for Order Updates" : "Email untuk Notifikasi Pesanan"}>
                    <Input
                      name="customerEmail"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                    />
                  </Field>
                ) : (
                  <input type="hidden" name="customerEmail" value={customer?.email || formData.email} />
                )}

                <Field
                  label={isEn ? "Recipient Phone / WhatsApp" : "Nomor HP / WhatsApp Penerima"}
                  hint={isEn ? "Active phone number reachable by courier during delivery" : "Nomor aktif yang dapat dihubungi kurir saat pengantaran"}
                  className={isLoggedIn ? "sm:col-span-2" : ""}
                >
                  <Input
                    name="customerPhone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="081234567890"
                  />
                </Field>

                <Field label={isEn ? "Full Street Address" : "Alamat Lengkap"} className="sm:col-span-2">
                  <Textarea
                    name="address"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder={isEn ? "Street name, building/house number, apartment, suite" : "Nama jalan, nomor rumah, RT/RW, kelurahan/kecamatan"}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <CityProvinceSelector
                    defaultCity={formData.city}
                    defaultProvince={formData.province}
                    defaultPostalCode={formData.postalCode}
                    showPostalCode={true}
                    postalCodeRequired={true}
                    required
                    onChange={handleDestinationChange}
                    onPostalCodeChange={(code) => setFormData((prev) => ({ ...prev, postalCode: code }))}
                  />
                </div>
              </div>

              {hasSavedAddress && (
                <div className="mt-4 pt-3 border-t border-espresso-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(false)}
                    className="inline-flex items-center rounded-lg bg-espresso-800 px-4 py-2 text-xs font-semibold text-white hover:bg-espresso-900 transition-colors cursor-pointer"
                  >
                    {isEn ? "Use This Address" : "Gunakan Alamat Ini"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Pilihan Pengiriman */}
          <div className="rounded-xl border border-latte bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-espresso-100 pb-3">
              <div>
                <h2 className="text-lg font-semibold text-espresso-900">
                  {isEn ? "2. Shipping Method" : "2. Metode Pengiriman"}
                </h2>
                <p className="text-xs text-espresso-500">
                  {hasSelectedCity ? (
                    <span>
                      {isEn ? "Destination:" : "Tujuan:"} <strong className="text-espresso-800">{destination.city}</strong> ({dynamicShippings[0]?.zoneLabel || (isEn ? "Standard" : "Disesuaikan")})
                    </span>
                  ) : (
                    <span className="text-caramel-700 font-medium">
                      {isEn ? "Complete delivery address above to see courier options" : "Lengkapi alamat pengiriman di atas untuk melihat pilihan kurir"}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-cream px-3 py-1 text-xs font-medium text-espresso-700 border border-espresso-100">
                <Scale className="h-3.5 w-3.5 text-caramel-600" />
                <span>{isEn ? "Weight:" : "Berat:"} {cartWeight.totalGrams}g ({cartWeight.chargeableKg} kg)</span>
              </div>
            </div>

            {!hasSelectedCity ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-dashed border-caramel-200 bg-caramel-50/40 p-6 text-center">
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-caramel-100 text-caramel-700">
                    <Truck className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-espresso-900">
                    {isEn ? "Please fill in the shipping address above first" : "Silakan isi Alamat Pengiriman di atas terlebih dahulu"}
                  </p>
                  <p className="mt-1 text-xs text-espresso-500 max-w-md mx-auto">
                    {isEn
                      ? "Once City / Region is selected, courier shipping options and rates will calculate automatically."
                      : "Setelah Kota / Kabupaten dipilih, daftar opsi kurir (JNE, J&T, SiCepat) dan tarif ongkir resmi akan otomatis muncul dan terkalkulasi."}
                  </p>
                </div>

                {settings.shipping.pickupEnabled && (
                  <div className="pt-2">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-espresso-400">
                      {isEn ? "Or Pick Up in Store:" : "Atau Pilih Opsi Ambil Langsung di Kedai:"}
                    </p>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all",
                        selectedShipping === "pickup"
                          ? "border-caramel-500 bg-caramel-50/30 ring-1 ring-caramel-500"
                          : "border-espresso-100 hover:border-espresso-300"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value="pickup"
                          checked={selectedShipping === "pickup"}
                          onChange={() => setSelectedShipping("pickup")}
                          className="text-caramel-600 focus:ring-caramel-500"
                        />
                        <div>
                          <p className="font-semibold text-espresso-900">{isEn ? "In-Store Pick Up" : "Ambil Sendiri di Toko"}</p>
                          <p className="text-xs text-espresso-400">
                            {settings.general.address}, {settings.general.city}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-emerald-700">{isEn ? "FREE" : "GRATIS"}</span>
                    </label>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {enabledShippings.map((m) => {
                  const isFree =
                    settings.shipping.freeShippingEnabled &&
                    subtotal >= settings.shipping.freeShippingMin;
                  return (
                    <label
                      key={m.id}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all",
                        selectedShipping === m.id
                          ? "border-caramel-500 bg-caramel-50/30 ring-1 ring-caramel-500"
                          : "border-espresso-100 hover:border-espresso-300"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value={m.id}
                          checked={selectedShipping === m.id}
                          onChange={() => setSelectedShipping(m.id)}
                          className="text-caramel-600 focus:ring-caramel-500"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-espresso-900">{m.name}</p>
                            {m.isDynamic && (
                              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                                {isEn ? "Auto" : "Otomatis"}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-espresso-400">{isEn ? "Est. arrival:" : "Estimasi tiba:"} {m.etd}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-espresso-800">
                        {isFree ? (
                          <span className="text-emerald-700">{isEn ? "FREE" : "GRATIS"}</span>
                        ) : (
                          money(m.cost)
                        )}
                      </span>
                    </label>
                  );
                })}

                {settings.shipping.pickupEnabled && (
                  <label
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all",
                      selectedShipping === "pickup"
                        ? "border-caramel-500 bg-caramel-50/30 ring-1 ring-caramel-500"
                        : "border-espresso-100 hover:border-espresso-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="pickup"
                        checked={selectedShipping === "pickup"}
                        onChange={() => setSelectedShipping("pickup")}
                        className="text-caramel-600 focus:ring-caramel-500"
                      />
                      <div>
                        <p className="font-semibold text-espresso-900">{isEn ? "In-Store Pick Up" : "Ambil Sendiri di Toko"}</p>
                        <p className="text-xs text-espresso-400">
                          {settings.general.address}, {settings.general.city}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-emerald-700">{isEn ? "FREE" : "GRATIS"}</span>
                  </label>
                )}
              </div>
            )}

            {/* Catatan untuk Toko/Kurir */}
            <div className="mt-5 pt-4 border-t border-espresso-100">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-espresso-800">
                <MessageSquare className="h-3.5 w-3.5 text-caramel-600" />
                {isEn ? "Order & Delivery Notes (Optional)" : "Catatan untuk Toko / Kurir (Opsional)"}
              </label>
              <Input
                name="notes"
                placeholder={isEn ? "e.g., Leave with concierge, pack securely, etc." : "Contoh: Titipkan ke satpam jika rumah kosong, packing aman, dll."}
                className="text-xs"
              />
            </div>
          </div>

          {/* Pilihan Pembayaran */}
          <div className="rounded-xl border border-latte bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-espresso-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-caramel-600" />
                <h2 className="text-base font-bold text-espresso-900">
                  {isEn ? "3. Payment Method" : "3. Metode Pembayaran"}
                </h2>
              </div>
              <span className="text-[11px] text-espresso-500">
                {isEn ? "Select payment method" : "Pilih salah satu metode"}
              </span>
            </div>

            {paymentOptions.length === 0 ? (
              <p className="text-xs text-rose-600">
                {isEn ? "No payment methods configured yet." : "Belum ada metode pembayaran yang diaktifkan oleh admin toko."}
              </p>
            ) : (
              <div className="space-y-2.5">
                {paymentOptions.map((p) => {
                  const isSelected = selectedPayment === p.id;
                  return (
                    <label
                      key={p.id}
                      className={cn(
                        "flex cursor-pointer items-start justify-between rounded-xl border p-3.5 transition-all",
                        isSelected
                          ? "border-caramel-500 bg-caramel-50/30 ring-1 ring-caramel-500"
                          : "border-espresso-100 hover:border-espresso-300 bg-white"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={p.id}
                          checked={isSelected}
                          onChange={() => setSelectedPayment(p.id)}
                          className="mt-1 text-caramel-600 focus:ring-caramel-500 h-4 w-4"
                        />
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                              isSelected
                                ? "bg-caramel-100/70 border-caramel-300 text-caramel-800"
                                : "bg-cream/60 border-latte text-espresso-600"
                            )}
                          >
                            {p.iconType === "qris" ? (
                              <QrCode className="h-4 w-4" />
                            ) : p.iconType === "va" ? (
                              <Landmark className="h-4 w-4" />
                            ) : p.iconType === "ewallet" ? (
                              <Wallet className="h-4 w-4" />
                            ) : p.iconType === "card" ? (
                              <CreditCard className="h-4 w-4" />
                            ) : p.iconType === "cstore" ? (
                              <Store className="h-4 w-4" />
                            ) : p.iconType === "cod" ? (
                              <Truck className="h-4 w-4" />
                            ) : (
                              <Banknote className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-espresso-900">{p.name}</p>
                            <p className="text-xs text-espresso-500 leading-relaxed mt-0.5">{p.desc}</p>
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Rincian Pesanan */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 rounded-xl border border-latte bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-espresso-900">
              {isEn ? "Order Summary" : "Ringkasan Pembelian"}
            </h2>

            <div className="mt-4 max-h-72 divide-y divide-latte overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.key} className="flex items-center gap-3 py-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-latte">
                    {i.image && (
                      <Image src={i.image} alt={i.name} fill sizes="56px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-espresso-900 line-clamp-1">{i.name}</p>
                    {i.variantName && (
                      <p className="text-xs text-espresso-400">{isEn ? "Variant:" : "Varian:"} {i.variantName}</p>
                    )}
                    <p className="text-xs text-espresso-500">
                      {i.quantity} x {money(i.price)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-espresso-900">
                    {money(i.price * i.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2.5 border-t border-latte pt-4 text-sm">
              <div className="flex justify-between text-espresso-600">
                <span>{isEn ? "Items Subtotal" : "Subtotal Produk"}</span>
                <span className="font-medium text-espresso-900">{money(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-espresso-600">
                <span>{isEn ? "Shipping Fee" : "Biaya Pengiriman"}</span>
                {selectedShipping === "pickup" ? (
                  <span className="font-medium text-emerald-700">{isEn ? "Free (Store Pickup)" : "Gratis (Ambil di Toko)"}</span>
                ) : hasSelectedCity && selectedShipping ? (
                  <span className="font-medium text-espresso-900">
                    {shippingCost === 0 ? <span className="text-emerald-700">{isEn ? "Free" : "Gratis"}</span> : money(shippingCost)}
                  </span>
                ) : (
                  <span className="text-xs font-normal text-espresso-400 italic">
                    {isEn ? "Calculated after address" : "Dihitung setelah isi alamat"}
                  </span>
                )}
              </div>
              {codFee > 0 && (
                <div className="flex justify-between text-espresso-600">
                  <span>{isEn ? "COD Fee" : "Biaya COD"}</span>
                  <span className="font-medium text-espresso-900">{money(codFee)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between text-espresso-600">
                  <span>{isEn ? `Tax (${settings.other.taxPercent}%)` : `Pajak (${settings.other.taxPercent}%)`}</span>
                  <span className="font-medium text-espresso-900">{money(tax)}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-latte pt-3">
                <div>
                  <span className="font-semibold text-espresso-900">{isEn ? "Total Amount" : "Total Pembayaran"}</span>
                  {!hasSelectedCity && selectedShipping !== "pickup" && (
                    <p className="text-[11px] text-espresso-400">{isEn ? "Excl. shipping" : "Belum termasuk ongkir"}</p>
                  )}
                </div>
                <span className="font-display text-2xl font-bold text-espresso-900">
                  {money(total)}
                </span>
              </div>
            </div>

            {!hasSelectedCity && selectedShipping !== "pickup" && (
              <p className="mt-4 text-center text-xs text-caramel-800 bg-caramel-50/80 py-2.5 px-3 rounded-lg border border-caramel-200">
                {isEn
                  ? "Please select your City / Region in shipping address above to proceed"
                  : "Lengkapi Kota / Kabupaten pada alamat di atas untuk melanjutkan pemesanan"}
              </p>
            )}

            <Button
              type="submit"
              disabled={isPending || (!hasSelectedCity && selectedShipping !== "pickup")}
              className="mt-4 w-full justify-center h-12 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending
                ? (isEn ? "Processing Order..." : "Memproses Pesanan...")
                : (isEn ? "Place Order Now" : "Buat Pesanan Sekarang")}
            </Button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-espresso-400">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>{isEn ? "Secure checkout & 256-bit SSL encrypted" : "Transaksi aman dan data terlindungi"}</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
