"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, CreditCard, ShieldCheck, Truck } from "lucide-react";
import { placeOrder } from "@/actions/orders";
import { useMoney, useHydrated } from "@/components/currency-provider";
import { useAppLoading } from "@/components/loading-provider";
import { Alert, Button, Field, Input, Textarea } from "@/components/ui";
import { CityProvinceSelector } from "@/components/shop/city-province-selector";
import { cartSubtotal, useCart } from "@/store/cart";
import type { AllSettings } from "@/lib/settings-types";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    if (isPending) {
      showLoading("Sedang memproses pesanan Anda...");
    } else {
      hideLoading();
    }
  }, [isPending, showLoading, hideLoading]);

  const enabledShippings = settings.shipping.methods.filter((m) => m.enabled);
  const [selectedShipping, setSelectedShipping] = useState<string>(
    enabledShippings[0]?.id || (settings.shipping.pickupEnabled ? "pickup" : "")
  );

  const paymentOptions = [
    settings.payment.bankTransfer.enabled && {
      id: "bank_transfer",
      name: "Transfer Bank Manual",
      desc: "BCA, Mandiri, dan bank lainnya. Verifikasi manual.",
    },
    settings.payment.cod.enabled && {
      id: "cod",
      name: "Bayar di Tempat (COD)",
      desc: `Biaya penanganan ${money(settings.payment.cod.fee)}`,
    },
    settings.payment.midtrans.enabled && {
      id: "midtrans",
      name: "Pembayaran Otomatis (Midtrans)",
      desc: "QRIS, Virtual Account, Kartu Kredit (Instant)",
    },
  ].filter(Boolean) as { id: string; name: string; desc: string }[];

  const [selectedPayment, setSelectedPayment] = useState<string>(
    paymentOptions[0]?.id || ""
  );

  const subtotal = hydrated ? cartSubtotal(items) : 0;

  // Hitung ongkir
  let shippingCost = 0;
  if (selectedShipping === "pickup") {
    shippingCost = 0;
  } else {
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
    return <div className="py-12 text-center text-espresso-400">Memuat formulir checkout...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-espresso-600">Keranjang belanja Anda kosong.</p>
        <Link href="/products" className="mt-4 inline-block font-semibold text-caramel-600 underline">
          Kembali Berbelanja
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

          {/* Data Kontak & Alamat */}
          <div className="rounded-xl border border-latte bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-espresso-900">1. Alamat Pengiriman</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nama Lengkap" className="sm:col-span-2">
                <Input
                  name="customerName"
                  required
                  defaultValue={customer?.name || ""}
                  placeholder="Nama penerima paket"
                />
              </Field>
              <Field label="Email">
                <Input
                  name="customerEmail"
                  type="email"
                  required
                  defaultValue={customer?.email || ""}
                  placeholder="email@anda.com"
                />
              </Field>
              <Field label="Nomor WhatsApp/HP">
                <Input
                  name="customerPhone"
                  type="tel"
                  required
                  defaultValue={customer?.phone || ""}
                  placeholder="081234567890"
                />
              </Field>
              <Field label="Alamat Lengkap" className="sm:col-span-2">
                <Textarea
                  name="address"
                  required
                  defaultValue={customer?.address || ""}
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan/kecamatan"
                />
              </Field>
              <div className="sm:col-span-2">
                <CityProvinceSelector
                  defaultCity={customer?.city || ""}
                  defaultProvince={customer?.province || ""}
                  required
                />
              </div>
              <Field label="Kode Pos" className="sm:col-span-2">
                <Input
                  name="postalCode"
                  required
                  defaultValue={customer?.postalCode || ""}
                  placeholder="40115"
                />
              </Field>
              <Field label="Catatan untuk Toko/Kurir (Opsional)" className="sm:col-span-2">
                <Input
                  name="notes"
                  placeholder="Contoh: Titipkan ke satpam jika rumah kosong"
                />
              </Field>
            </div>
          </div>

          {/* Pilihan Pengiriman */}
          <div className="rounded-xl border border-latte bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-espresso-900">2. Metode Pengiriman</h2>
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
                        <p className="font-semibold text-espresso-900">{m.name}</p>
                        <p className="text-xs text-espresso-400">Estimasi tiba: {m.etd}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-espresso-800">
                      {isFree ? (
                        <span className="text-emerald-700">GRATIS</span>
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
                      <p className="font-semibold text-espresso-900">Ambil Sendiri di Toko</p>
                      <p className="text-xs text-espresso-400">
                        {settings.general.address}, {settings.general.city}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-emerald-700">GRATIS</span>
                </label>
              )}
            </div>
          </div>

          {/* Pilihan Pembayaran */}
          <div className="rounded-xl border border-latte bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-espresso-900">3. Metode Pembayaran</h2>
            <div className="space-y-3">
              {paymentOptions.map((p) => (
                <label
                  key={p.id}
                  className={cn(
                    "flex cursor-pointer items-start justify-between rounded-lg border p-4 transition-all",
                    selectedPayment === p.id
                      ? "border-caramel-500 bg-caramel-50/30 ring-1 ring-caramel-500"
                      : "border-espresso-100 hover:border-espresso-300"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={p.id}
                      checked={selectedPayment === p.id}
                      onChange={() => setSelectedPayment(p.id)}
                      className="mt-1 text-caramel-600 focus:ring-caramel-500"
                    />
                    <div>
                      <p className="font-semibold text-espresso-900">{p.name}</p>
                      <p className="text-xs text-espresso-400">{p.desc}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Rincian Pesanan */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 rounded-xl border border-latte bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-espresso-900">Ringkasan Pembelian</h2>

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
                      <p className="text-xs text-espresso-400">Varian: {i.variantName}</p>
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
                <span>Subtotal Produk</span>
                <span className="font-medium text-espresso-900">{money(subtotal)}</span>
              </div>
              <div className="flex justify-between text-espresso-600">
                <span>Biaya Pengiriman</span>
                <span className="font-medium text-espresso-900">
                  {shippingCost === 0 ? <span className="text-emerald-700">Gratis</span> : money(shippingCost)}
                </span>
              </div>
              {codFee > 0 && (
                <div className="flex justify-between text-espresso-600">
                  <span>Biaya COD</span>
                  <span className="font-medium text-espresso-900">{money(codFee)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between text-espresso-600">
                  <span>Pajak ({settings.other.taxPercent}%)</span>
                  <span className="font-medium text-espresso-900">{money(tax)}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-latte pt-3">
                <span className="font-semibold text-espresso-900">Total Pembayaran</span>
                <span className="font-display text-2xl font-bold text-espresso-900">
                  {money(total)}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="mt-6 w-full justify-center h-12 text-base font-semibold"
            >
              {isPending ? "Memproses Pesanan..." : "Buat Pesanan Sekarang"}
            </Button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-espresso-400">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Transaksi aman dan data terlindungi</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
