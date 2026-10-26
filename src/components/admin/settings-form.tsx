"use client";

import { useActionState, useEffect, useState } from "react";
import {
  Banknote,
  Coins,
  CreditCard,
  Plus,
  Sliders,
  Store,
  Trash2,
  Truck,
} from "lucide-react";
import { useAppLoading } from "@/components/loading-provider";
import {
  saveCurrency,
  saveGeneral,
  saveOther,
  savePayment,
  saveShipping,
} from "@/actions/settings";
import { Alert, Button, Field, Input, Select, Textarea } from "@/components/ui";
import { CURRENCIES, formatCurrency, type CurrencyPosition, type CurrencySettings } from "@/lib/currency";
import type { AllSettings, BankAccount, ShippingMethod } from "@/lib/settings-types";

export function SettingsForm({
  initialSettings,
}: {
  initialSettings: AllSettings;
}) {
  const [activeTab, setActiveTab] = useState<
    "general" | "currency" | "payment" | "shipping" | "other"
  >("general");

  const [generalState, generalAction, generalPending] = useActionState(saveGeneral, undefined);
  const [currencyState, currencyAction, currencyPending] = useActionState(saveCurrency, undefined);
  const [paymentState, paymentAction, paymentPending] = useActionState(savePayment, undefined);
  const [shippingState, shippingAction, shippingPending] = useActionState(saveShipping, undefined);
  const [otherState, otherAction, otherPending] = useActionState(saveOther, undefined);
  const { showLoading, hideLoading } = useAppLoading();

  useEffect(() => {
    if (generalPending) {
      showLoading("Menyimpan informasi umum toko...");
    } else if (currencyPending) {
      showLoading("Menyimpan format mata uang...");
    } else if (paymentPending) {
      showLoading("Menyimpan metode pembayaran...");
    } else if (shippingPending) {
      showLoading("Menyimpan kurir & pengiriman...");
    } else if (otherPending) {
      showLoading("Menyimpan pengaturan sistem & SEO...");
    } else {
      hideLoading();
    }
  }, [
    generalPending,
    currencyPending,
    paymentPending,
    shippingPending,
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

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Navigasi Tab Pengaturan */}
      <div className="lg:col-span-3">
        <nav className="space-y-1 rounded-xl border border-latte bg-white p-2 shadow-xs">
          {[
            { id: "general", label: "Umum & Toko", icon: Store },
            { id: "currency", label: "Opsi Mata Uang (Currency)", icon: Coins },
            { id: "payment", label: "Metode Pembayaran", icon: CreditCard },
            { id: "shipping", label: "Kurir & Pengiriman", icon: Truck },
            { id: "other", label: "Lainnya & SEO", icon: Sliders },
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
          <div className="rounded-xl border border-latte bg-white p-6 shadow-xs">
            <h2 className="text-base font-bold text-espresso-900 border-b border-latte pb-3">
              Informasi Umum Toko
            </h2>
            {generalState?.error && <Alert tone="error" className="mt-4">{generalState.error}</Alert>}
            {generalState?.success && <Alert tone="success" className="mt-4">{generalState.success}</Alert>}

            <form action={generalAction} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nama Brand / Toko">
                  <Input name="storeName" defaultValue={initialSettings.general.storeName} required />
                </Field>
                <Field label="Tagline Toko">
                  <Input name="tagline" defaultValue={initialSettings.general.tagline} />
                </Field>
                <Field label="Email Resmi Toko">
                  <Input name="email" type="email" defaultValue={initialSettings.general.email} required />
                </Field>
                <Field label="Nomor Telepon / CS">
                  <Input name="phone" defaultValue={initialSettings.general.phone} required />
                </Field>
                <Field label="Alamat Fisik Toko" className="sm:col-span-2">
                  <Textarea name="address" defaultValue={initialSettings.general.address} rows={2} />
                </Field>
                <Field label="Kota">
                  <Input name="city" defaultValue={initialSettings.general.city} />
                </Field>
                <Field label="Provinsi">
                  <Input name="province" defaultValue={initialSettings.general.province} />
                </Field>
                <Field label="Kode Pos">
                  <Input name="postalCode" defaultValue={initialSettings.general.postalCode} />
                </Field>
                <Field label="Negara">
                  <Input name="country" defaultValue={initialSettings.general.country} />
                </Field>
              </div>

              <div className="pt-4 border-t border-latte">
                <Button type="submit" disabled={generalPending} className="justify-center">
                  {generalPending ? "Menyimpan..." : "Simpan Pengaturan Umum"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: CURRENCY */}
        {activeTab === "currency" && (
          <div className="rounded-xl border border-latte bg-white p-6 shadow-xs">
            <h2 className="text-base font-bold text-espresso-900 border-b border-latte pb-3">
              Opsi Format Mata Uang (Currency Options)
            </h2>
            {currencyState?.error && <Alert tone="error" className="mt-4">{currencyState.error}</Alert>}
            {currencyState?.success && <Alert tone="success" className="mt-4">{currencyState.success}</Alert>}

            {/* Live Preview Box */}
            <div className="mt-6 rounded-lg border border-caramel-200 bg-caramel-50/40 p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-caramel-800">
                Live Preview Tampilan Harga:
              </span>
              <p className="mt-1 font-display text-3xl font-bold text-espresso-900">
                {formatCurrency(125000, currencyConfig)}
              </p>
              <p className="mt-1 text-xs text-espresso-500">
                Contoh format harga produk Rp 125.000 dengan pengaturan di bawah ini.
              </p>
            </div>

            <form action={currencyAction} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Pilihan Mata Uang">
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

                <Field label="Simbol Mata Uang">
                  <Input
                    name="symbol"
                    value={currencyConfig.symbol}
                    onChange={(e) =>
                      setCurrencyConfig((prev) => ({ ...prev, symbol: e.target.value }))
                    }
                  />
                </Field>

                <Field label="Pemisah Ribuan (Thousand Separator)">
                  <Select
                    name="thousandSep"
                    value={currencyConfig.thousandSep}
                    onChange={(e) =>
                      setCurrencyConfig((prev) => ({ ...prev, thousandSep: e.target.value }))
                    }
                  >
                    <option value=".">Titik ( . ) - Standar Indonesia</option>
                    <option value=",">Koma ( , ) - Standar US</option>
                    <option value="space">Spasi ( &nbsp; )</option>
                  </Select>
                </Field>

                <Field label="Pemisah Desimal (Decimal Separator)">
                  <Select
                    name="decimalSep"
                    value={currencyConfig.decimalSep}
                    onChange={(e) =>
                      setCurrencyConfig((prev) => ({ ...prev, decimalSep: e.target.value }))
                    }
                  >
                    <option value=",">Koma ( , ) - Standar Indonesia</option>
                    <option value=".">Titik ( . ) - Standar US</option>
                  </Select>
                </Field>

                <Field label="Jumlah Angka Desimal">
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

                <Field label="Posisi Simbol Mata Uang">
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
                    <option value="left_space">Kiri dengan spasi (Rp 100.000)</option>
                    <option value="left">Kiri tanpa spasi (Rp100.000)</option>
                    <option value="right_space">Kanan dengan spasi (100.000 Rp)</option>
                    <option value="right">Kanan tanpa spasi (100.000Rp)</option>
                  </Select>
                </Field>
              </div>

              <div className="pt-4 border-t border-latte">
                <Button type="submit" disabled={currencyPending} className="justify-center">
                  {currencyPending ? "Menyimpan..." : "Simpan Format Mata Uang"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: PAYMENT */}
        {activeTab === "payment" && (
          <div className="rounded-xl border border-latte bg-white p-6 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-espresso-900 border-b border-latte pb-3">
              Metode Pembayaran
            </h2>
            {paymentState?.error && <Alert tone="error">{paymentState.error}</Alert>}
            {paymentState?.success && <Alert tone="success">{paymentState.success}</Alert>}

            <form action={paymentAction} className="space-y-6">
              {/* Transfer Bank */}
              <div className="rounded-lg border border-latte p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-espresso-900">Transfer Bank Manual</h3>
                    <p className="text-xs text-espresso-400">Pembayaran langsung ke nomor rekening toko</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-espresso-800">
                    <input
                      type="checkbox"
                      name="bankEnabled"
                      defaultChecked={initialSettings.payment.bankTransfer.enabled}
                      className="rounded border-espresso-300 text-caramel-600 focus:ring-caramel-500 h-4 w-4"
                    />
                    Aktif
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
                          placeholder="No. Rekening"
                          value={b.number}
                          onChange={(e) => updateBankField(i, "number", e.target.value)}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                      <div className="flex-1 min-w-36">
                        <Input
                          placeholder="Atas Nama"
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
                    <Plus className="h-3.5 w-3.5" /> Tambah Rekening Bank
                  </button>
                </div>
              </div>

              {/* Bayar di Tempat (COD) */}
              <div className="rounded-lg border border-latte p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-espresso-900">Bayar di Tempat (COD)</h3>
                    <p className="text-xs text-espresso-400">Pelanggan membayar tunai saat kurir tiba</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-espresso-800">
                    <input
                      type="checkbox"
                      name="codEnabled"
                      defaultChecked={initialSettings.payment.cod.enabled}
                      className="rounded border-espresso-300 text-caramel-600 focus:ring-caramel-500 h-4 w-4"
                    />
                    Aktif
                  </label>
                </div>
                <div className="max-w-xs">
                  <Field label="Biaya Penanganan COD (Fee)">
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
                    <h3 className="font-semibold text-espresso-900">Payment Gateway Midtrans (Snap)</h3>
                    <p className="text-xs text-espresso-400">
                      Menerima QRIS, GoPay, OVO, ShopeePay, Virtual Account, & Kartu Kredit
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-espresso-800">
                    <input
                      type="checkbox"
                      name="midtransEnabled"
                      defaultChecked={initialSettings.payment.midtrans.enabled}
                      className="rounded border-espresso-300 text-caramel-600 focus:ring-caramel-500 h-4 w-4"
                    />
                    Aktif
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Environment Mode">
                    <Select name="midtransMode" defaultValue={initialSettings.payment.midtrans.mode}>
                      <option value="sandbox">Sandbox (Testing / Pengembangan)</option>
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
              </div>

              <div className="pt-4 border-t border-latte">
                <Button type="submit" disabled={paymentPending} className="justify-center">
                  {paymentPending ? "Menyimpan..." : "Simpan Metode Pembayaran"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: SHIPPING */}
        {activeTab === "shipping" && (
          <div className="rounded-xl border border-latte bg-white p-6 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-espresso-900 border-b border-latte pb-3">
              Kurir & Opsi Pengiriman
            </h2>
            {shippingState?.error && <Alert tone="error">{shippingState.error}</Alert>}
            {shippingState?.success && <Alert tone="success">{shippingState.success}</Alert>}

            <form action={shippingAction} className="space-y-6">
              <input type="hidden" name="methods" value={JSON.stringify(shippingMethods)} />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Kota Asal Pengiriman">
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
                        Promo Gratis Ongkir
                      </span>
                      <p className="text-[11px] text-espresso-400">
                        Aktifkan jika ingin memberikan gratis ongkir dengan syarat minimal belanja
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
                    <Field label="Minimal Belanja (IDR)">
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
                  Daftar Pilihan Jasa Ekspedisi / Kurir
                </label>

                {shippingMethods.map((m, i) => (
                  <div key={m.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-cream/40 p-3">
                    <div className="flex-1 min-w-36">
                      <Input
                        placeholder="Nama Kurir (JNE Reguler)"
                        value={m.name}
                        onChange={(e) => updateShippingField(i, "name", e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="w-28">
                      <Input
                        placeholder="Tarif (IDR)"
                        type="number"
                        value={m.cost}
                        onChange={(e) => updateShippingField(i, "cost", Number(e.target.value))}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="w-28">
                      <Input
                        placeholder="Estimasi (2-3 hari)"
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
                  <Plus className="h-3.5 w-3.5" /> Tambah Kurir Pengiriman
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
                  Izinkan Pengambilan Sendiri di Toko (Pickup Store)
                </label>
                <p className="mt-1 text-xs text-espresso-400">
                  Pelanggan dapat memilih opsi mengambil pesanan langsung di toko fisik tanpa biaya kirim.
                </p>
              </div>

              <div className="pt-4 border-t border-latte">
                <Button type="submit" disabled={shippingPending} className="justify-center">
                  {shippingPending ? "Menyimpan..." : "Simpan Pengaturan Pengiriman"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 5: OTHER */}
        {activeTab === "other" && (
          <div className="rounded-xl border border-latte bg-white p-6 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-espresso-900 border-b border-latte pb-3">
              Lainnya, Pajak, & SEO
            </h2>
            {otherState?.error && <Alert tone="error">{otherState.error}</Alert>}
            {otherState?.success && <Alert tone="success">{otherState.success}</Alert>}

            <form action={otherAction} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Meta Title SEO">
                  <Input name="metaTitle" defaultValue={initialSettings.other.metaTitle} />
                </Field>
                <Field label="Prefix Nomor Pesanan">
                  <Input name="orderPrefix" defaultValue={initialSettings.other.orderPrefix} placeholder="WZ" />
                </Field>
                <Field label="Meta Description SEO" className="sm:col-span-2">
                  <Textarea name="metaDescription" defaultValue={initialSettings.other.metaDescription} rows={2} />
                </Field>
                <Field label="URL Akun Instagram">
                  <Input name="instagram" defaultValue={initialSettings.other.instagram} />
                </Field>
                <Field label="Nomor WhatsApp CS (Tanpa +)">
                  <Input name="whatsapp" defaultValue={initialSettings.other.whatsapp} placeholder="6281234567890" />
                </Field>
                <Field label="Persentase Pajak / PPN (%)">
                  <Input
                    name="taxPercent"
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={initialSettings.other.taxPercent}
                    placeholder="0"
                  />
                </Field>
                <Field label="Batas Notifikasi Stok Menipis (Threshold)">
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
                  {otherPending ? "Menyimpan..." : "Simpan Pengaturan Lainnya"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
